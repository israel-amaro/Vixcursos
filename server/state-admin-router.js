const express = require('express');
const XLSX = require('xlsx');
const { createLocalDb } = require('./local-db');
const { validCpf } = require('./citizen-service');
const mascots = require('../public/mascotes.json');
const { calendarDate, localDay } = require('./course-state');

function createStateAdminRouter(db, auth) {
    const router = express.Router();
    const wrap = operation => async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try { await operation(req, res); } catch (e) { console.error('[admin]', e.code || 'unavailable'); res.status(e.status || 503).json({ error: e.status && e.status < 500 ? e.message : 'Não foi possível concluir a operação.' }); }
    };
    const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
    const courses = s => createLocalDb(s).getPublicCourses();
    const publishedCourses = s => courses(s).filter(c => ['ativo', 'esgotado'].includes(c.status) && (!c.data_publicacao || Date.parse(c.data_publicacao) <= Date.now())).sort((a, b) => b.id - a.id);
    const publicCourses = s => publishedCourses(s).filter(c => c.situacao !== 'encerrado');
    const nextId = rows => rows.reduce((max, row) => Math.max(max, Number(row.id)), 0) + 1;
    const inactive = new Set(['cancelado', 'desistencia', 'nao_concluido', 'desistente', 'nao_compareceu', 'concluido', 'evadido', 'certificado_emitido']);
    const normalizeStatus = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '_');
    const enrollment = (s, id) => {
        const row = s.preInscricoes.find(i => i.id === Number(id));
        if (!row) fail(404, 'Inscrição não encontrada.');
        return row;
    };
    const reserve = (s, row) => {
        const course = s.cursos.find(c => c.id === row.curso_id);
        if (!course) fail(404, 'Turma não encontrada.');
        const occupied = s.preInscricoes.filter(i => i.id !== row.id && i.curso_id === row.curso_id && i.status_inscricao === 'titular' && !inactive.has(normalizeStatus(i.status))).length;
        if (occupied >= Number(course.vagas)) fail(409, 'Esta turma não tem vagas disponíveis.');
    };
    const catalog = createLocalDb();
    const options = type => catalog.query(`SELECT * FROM filtro_${type}`)[0];
    const ages = options('idade');
    const adminCourses = s => courses(s).map(course => {
        const raw = s.cursos.find(row => row.id === course.id);
        return { ...course, curso: raw.curso_id, categoria_id: raw.categoria_id, local_id: raw.local_id,
            modalidade_id: raw.modalidade_id, idade_min_id: ages.find(a => a.idade === Number(raw.idade_min))?.id,
            idade_max_id: ages.find(a => a.idade === Number(raw.idade_max))?.id,
            data_inicio_iso: calendarDate(raw.data_inicio), data_termino_iso: calendarDate(raw.data_termino) };
    }).sort((a, b) => b.id - a.id);
    const courseFields = b => {
        if (!options('curso').some(c => c.id === Number(b.curso))) fail(400, 'Selecione a área do curso.');
        if (!options('categoria').some(c => c.id === Number(b.categoria_id || b.curso))) fail(400, 'Selecione uma categoria válida.');
        if (!Number.isInteger(Number(b.vagas)) || Number(b.vagas) < 1) fail(400, 'Informe pelo menos uma vaga.');
        if (!options('local').some(c => c.id === Number(b.local))) fail(400, 'Selecione o local.');
        if (!options('modalidade').some(c => c.id === Number(b.modalidade))) fail(400, 'Selecione a modalidade.');
        const min = ages.find(a => a.id === Number(b.idade_min))?.idade;
        const max = ages.find(a => a.id === Number(b.idade_max))?.idade;
        if (!min || !max || max < min) fail(400, 'Confira as idades mínima e máxima.');
        if (b.mascote_id && !mascots.some(m => m.id === b.mascote_id)) fail(400, 'Mascote inválido.');
        if (b.status && !['ativo', 'esgotado', 'arquivado'].includes(b.status)) fail(400, 'Situação do curso inválida.');
        for (const key of ['data_inicio', 'data_termino']) {
            if (b[key] && (!/^\d{4}-\d{2}-\d{2}$/.test(b[key]) || !calendarDate(b[key]))) fail(400, 'Data inválida.');
        }
        if (b.data_inicio && b.data_termino && b.data_termino < b.data_inicio) fail(400, 'O término precisa ser após o início.');
        for (const key of ['horario_inicio', 'horario_termino']) {
            if (b[key] && !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(b[key])) fail(400, 'Horário inválido.');
        }
        let publication = null;
        if (b.data_publicacao) {
            if (typeof b.data_publicacao !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(b.data_publicacao) || Number.isNaN(Date.parse(b.data_publicacao))) fail(400, 'Informe uma data e hora válidas para publicação.');
            publication = new Date(b.data_publicacao).toISOString();
            if (!calendarDate(b.data_publicacao)) fail(400, 'Informe uma data e hora válidas para publicação.');
            if (b.data_termino && localDay(publication) > b.data_termino) fail(400, 'A publicação precisa acontecer até o término do curso.');
        }
        if (b.publicacao_modo) {
            const mode = b.publicacao_modo;
            if (!['manter', 'agora', 'agendada', 'arquivado', 'espera'].includes(mode)) fail(400, 'Escolha como o curso deve aparecer no site.');
            const modeStatus = { agora: 'ativo', agendada: 'ativo', arquivado: 'arquivado', espera: 'esgotado' };
            if (modeStatus[mode] && b.status !== modeStatus[mode]) fail(400, 'Confira a escolha de publicação do curso.');
            if (['agora', 'agendada', 'espera'].includes(mode) && (!b.data_termino || b.data_termino < localDay())) fail(400, 'Para mostrar o curso, escolha um último dia de aula que ainda não passou.');
            if (mode === 'agendada' && (!publication || Date.parse(publication) <= Date.now())) fail(400, 'Escolha um dia e horário futuros para o curso aparecer no site.');
            if (['agora', 'arquivado', 'espera'].includes(mode) && publication) fail(400, 'Esta escolha não usa uma data de publicação.');
        }
        const text = (key, limit = 10000) => {
            const value = String(b[key] || '').trim();
            if (value.length > limit) fail(400, 'Um dos textos excede o tamanho permitido.');
            return value;
        };
        return {
            curso_id: Number(b.curso), categoria_id: Number(b.categoria_id || b.curso), nome: text('nome', 160), vagas: Number(b.vagas),
            status: b.status || 'ativo', data_publicacao: publication, local_id: Number(b.local), modalidade_id: Number(b.modalidade),
            idade_min: min, idade_max: max, data_inicio: b.data_inicio || null, data_termino: b.data_termino || null,
            horario_inicio: b.horario_inicio || null, horario_termino: b.horario_termino || null,
            descricao: text('descricao'), ementa: text('ementa'), competencias: text('competencias'),
            pre_requisitos: text('pre_requisitos'), carga_horaria: Number(b.carga_horaria) || null, mascote_id: b.mascote_id || null,
        };
    };
    const enriched = s => s.preInscricoes.map(i => {
        const c = courses(s).find(c => c.id === i.curso_id);
        return { ...i, curso_nome: c?.nome || 'Curso', local_nome: c?.local || 'A definir', data: i.criado_em };
    });
    const filtered = (s, q) => enriched(s).filter(i =>
        (!q.curso_id || Number(q.curso_id) === i.curso_id) && (!q.genero || q.genero === i.genero) &&
        (!q.raca_cor || q.raca_cor === i.raca_cor) && (!q.bairro || String(i.bairro).toLowerCase().includes(q.bairro.toLowerCase())) &&
        (!q.data_inicio || (i.criado_em && localDay(i.criado_em) >= q.data_inicio)) && (!q.data_fim || (i.criado_em && localDay(i.criado_em) <= q.data_fim)));
    const group = (rows, field) => Object.entries(rows.reduce((acc, row) => {
        const label = typeof field === 'function' ? field(row) : row[field] || 'Não informado';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {})).map(([label, total]) => ({ label, total }));

    router.get('/api/cursos-public', wrap(async (_req, res) => res.json(publicCourses(await db.readState()))));
    router.get('/api/cursos-public/:id', wrap(async (req, res) => {
        const course = publishedCourses(await db.readState()).find(c => c.id === Number(req.params.id));
        if (!course) fail(404, 'Curso não encontrado.');
        res.json(course);
    }));
    router.get('/api/cursos-public/:id/vagas', wrap(async (req, res) => {
        const course = publishedCourses(await db.readState()).find(c => c.id === Number(req.params.id));
        if (!course) fail(404, 'Curso não encontrado.');
        res.json({ vagas_totais: course.vagas_totais, inscritos: course.inscritos, vagas_disponiveis: course.vagas_disponiveis, status: course.status, situacao: course.situacao, situacao_label: course.situacao_label, aceita_inscricoes: course.aceita_inscricoes });
    }));
    router.get('/cursos', auth, wrap(async (req, res) => {
        const list = adminCourses(await db.readState());
        res.json(req.query.id ? list.filter(c => c.id === Number(req.query.id)) : list);
    }));
    router.post('/cursos', auth, wrap(async (req, res) => {
        const fields = courseFields(req.body);
        const id = await db.mutate(s => {
            const id = nextId(s.cursos);
            s.cursos.push({ id, ...fields, criado_em: new Date().toISOString() });
            return id;
        });
        res.json({ status: 'ok', id });
    }));
    router.put('/cursos/:id', auth, wrap(async (req, res) => {
        const fields = courseFields(req.body);
        await db.mutate(s => {
            const course = s.cursos.find(c => c.id === Number(req.params.id));
            if (!course) fail(404, 'Curso não encontrado.');
            if (fields.vagas < courses(s).find(c => c.id === course.id).inscritos) fail(409, 'As vagas não podem ser menores que as reservas existentes.');
            Object.assign(course, fields, { atualizado_em: new Date().toISOString() });
        });
        res.json({ status: 'ok', id: Number(req.params.id) });
    }));
    router.put('/cursos/esgotar/:id', auth, wrap(async (req, res) => {
        await db.mutate(s => { const c = s.cursos.find(c => c.id === Number(req.params.id)); if (!c) fail(404, 'Curso não encontrado.'); c.status = 'esgotado'; });
        res.json({ status: 'ok' });
    }));
    router.delete('/cursos/:id', auth, wrap(async (req, res) => {
        await db.mutate(s => { if (s.preInscricoes.some(i => i.curso_id === Number(req.params.id))) fail(409, 'Este curso possui inscrições. Encerre-o para preservar o histórico.'); s.cursos = s.cursos.filter(c => c.id !== Number(req.params.id)); });
        res.json({ status: 'ok' });
    }));
    router.get('/inscritos/:idCurso', auth, wrap(async (req, res) => {
        const s = await db.readState();
        if (!s.cursos.some(c => c.id === Number(req.params.idCurso))) fail(404, 'Turma não encontrada.');
        res.json(enriched(s).filter(i => i.curso_id === Number(req.params.idCurso) && i.status !== 'cancelado'));
    }));
    router.get('/api/admin/inscricoes', auth, wrap(async (_req, res) => {
        res.json(enriched(await db.readState()).filter(i => i.status !== 'cancelado'));
    }));
    router.get('/api/admin/aluno/completo/:cpf', auth, wrap(async (req, res) => {
        const cpf = req.params.cpf.replace(/\D/g, '');
        if (!validCpf(cpf)) fail(400, 'CPF inválido.');
        const s = await db.readState();
        const historico = enriched(s).filter(i => String(i.cpf).replace(/\D/g, '') === cpf)
            .sort((a, b) => Date.parse(b.criado_em || '') - Date.parse(a.criado_em || ''));
        const perfil = s.usuarios.find(u => String(u.cpf).replace(/\D/g, '') === cpf);
        if (!perfil && !historico.length) fail(404, 'Cadastro não encontrado.');
        // Keep the current profile and supplement it with consent/survey data
        // from the most recent enrollment; also support older standalone records.
        const aluno = { ...(historico[0] || {}), ...(perfil || {}) };
        aluno.possui_necessidade_especial ??= aluno.possui_deficiencia;
        aluno.tipo_necessidade_especial ??= aluno.tipo_deficiencia;
        res.json({ aluno, historico });
    }));
    router.put('/api/inscricoes/:id/confirmar', auth, wrap(async (req, res) => {
        const status = await db.mutate(s => {
            const i = enrollment(s, req.params.id);
            if (inactive.has(normalizeStatus(i.status))) fail(409, 'Esta inscrição está encerrada.');
            if (i.status_inscricao !== 'titular') fail(409, 'A inscrição está na lista de espera.');
            if (Number(i.matricula_confirmada) === 1) return 'ja-confirmada';
            reserve(s, i);
            i.matricula_confirmada = 1; i.matricula_confirmada_em = new Date().toISOString(); i.status = 'matriculado'; i.situacao_final = 'matriculado';
            return 'ok';
        });
        res.json({ status });
    }));
    router.put('/api/inscricoes/:id/status-final', auth, wrap(async (req, res) => {
        const status = normalizeStatus(req.body.status);
        if (!['titular', 'suplente', 'concluido', 'evadido', 'cancelado', 'desistencia', 'nao_concluido', 'desistente', 'nao_compareceu', 'matriculado', 'inscrito', 'certificado_emitido'].includes(status)) fail(400, 'Situação inválida.');
        await db.mutate(s => {
            const i = enrollment(s, req.params.id);
            if (['titular', 'matriculado'].includes(status) || (status === 'inscrito' && i.status_inscricao === 'titular')) reserve(s, i);
            if (status === 'certificado_emitido' && !['concluido', 'certificado_emitido'].includes(normalizeStatus(i.situacao_final))) fail(409, 'Conclua a inscrição antes de marcar o certificado como emitido.');
            if (['titular', 'suplente'].includes(status)) i.status_inscricao = status;
            if (status === 'matriculado') i.status_inscricao = 'titular';
            i.status = status;
            i.situacao_final = status === 'certificado_emitido' ? 'concluido' : ['titular', 'suplente'].includes(status) ? 'inscrito' : status;
            if (['inscrito', 'titular', 'suplente', 'cancelado', 'desistencia', 'desistente', 'nao_compareceu'].includes(status)) {
                i.matricula_confirmada = 0; i.matricula_confirmada_em = null;
            } else if (status === 'matriculado') {
                i.matricula_confirmada = 1; i.matricula_confirmada_em ||= new Date().toISOString();
            }
        });
        res.json({ status: 'ok' });
    }));
    router.delete('/api/inscricoes/:id', auth, wrap(async (req, res) => {
        await db.mutate(s => { const i = enrollment(s, req.params.id); i.status = 'cancelado'; i.situacao_final = 'cancelado'; i.matricula_confirmada = 0; i.matricula_confirmada_em = null; });
        res.json({ status: 'ok' });
    }));
    router.get('/api/admin/stats', auth, wrap(async (_req, res) => {
        const s = await db.readState(); res.json({ total: s.cursos.length, ativos: courses(s).filter(c => c.situacao === 'aberto').length, inscritos: s.preInscricoes.filter(i => i.status !== 'cancelado').length, leads: s.interessados.filter(i => i.status === 'aguardando').length });
    }));
    router.get('/api/admin/cursos-stats', auth, wrap(async (_req, res) => res.json(courses(await db.readState()))));
    router.get('/api/admin/configuracoes', auth, wrap(async (_req, res) => res.json((await db.readState()).configuracoes[0])));
    router.put('/api/admin/configuracoes', auth, wrap(async (req, res) => {
        const limit = Number(req.body.limite_inscricoes_semestre), hours = Number(req.body.prazo_confirmacao_horas);
        if (!Number.isInteger(limit) || limit < 1 || limit > 10 || !Number.isInteger(hours) || hours < 1 || hours > 168) fail(400, 'Limites de configuração inválidos.');
        await db.mutate(s => { s.configuracoes = [{ id: 1, limite_inscricoes_semestre: limit, prazo_confirmacao_horas: hours }]; }); res.json({ ok: true });
    }));
    router.get('/api/admin/relatorios-stats', auth, wrap(async (req, res) => {
        const rows = filtered(await db.readState(), req.query);
        const ratings = rows.filter(i => Number(i.nota_satisfacao_geral) > 0);
        res.json({ genero: group(rows, 'genero'), raca_cor: group(rows, 'raca_cor'), bairro: group(rows, 'bairro'), escolaridade: group(rows, 'escolaridade'), deficiencia: group(rows, i => ['sim', '1', 'true'].includes(String(i.possui_necessidade_especial).toLowerCase()) ? 'Sim' : ['nao', 'não', '0', 'false'].includes(String(i.possui_necessidade_especial).toLowerCase()) ? 'Não' : 'Não informado'), objetivo: group(rows, 'objetivo'), faixa_etaria: group(rows, i => {
            const value = String(i.data_nascimento || '');
            const parts = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            const date = parts ? `${parts[3]}-${parts[2]}-${parts[1]}` : value.slice(0, 10);
            const birth = new Date(date + 'T12:00:00');
            if (Number.isNaN(birth.getTime())) return 'Não informada';
            const now = new Date(); let age = now.getFullYear() - birth.getFullYear();
            if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
            return age < 18 ? 'Menor de 18 anos' : age < 30 ? '18 a 29 anos' : age < 60 ? '30 a 59 anos' : '60 anos ou mais';
        }), kpis: { total: rows.length, concluidos: rows.filter(i => i.situacao_final === 'concluido').length, evadidos: rows.filter(i => i.situacao_final === 'evadido').length, satisfacao_media: ratings.length ? ratings.reduce((sum, i) => sum + Number(i.nota_satisfacao_geral), 0) / ratings.length : 0 } });
    }));
    router.get('/api/admin/exportar-excel', auth, wrap(async (req, res) => {
        const rows = filtered(await db.readState(), req.query);
        const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Inscrições');
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('qualifica-vix-inscricoes.xlsx').send(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }));
    const faqFields = body => {
        const pergunta = String(body.pergunta || '').trim(), resposta = String(body.resposta || '').trim(), ordem = Number(body.ordem ?? 0);
        if (!pergunta || pergunta.length > 500 || !resposta || resposta.length > 10000) fail(400, 'Informe uma pergunta e uma resposta válidas.');
        if (!Number.isInteger(ordem) || ordem < 0) fail(400, 'Informe uma ordem válida.');
        return { pergunta, resposta, ordem };
    };
    router.get('/api/faq', wrap(async (_req, res) => res.json((await db.readState()).faq.sort((a, b) => a.ordem - b.ordem || a.id - b.id))));
    router.post('/api/admin/faq', auth, wrap(async (req, res) => {
        const fields = faqFields(req.body);
        const id = await db.mutate(s => { const id = nextId(s.faq); s.faq.push({ id, ...fields }); return id; });
        res.json({ ok: true, id });
    }));
    router.put('/api/admin/faq/:id', auth, wrap(async (req, res) => {
        const fields = faqFields(req.body);
        await db.mutate(s => { const faq = s.faq.find(f => f.id === Number(req.params.id)); if (!faq) fail(404, 'Pergunta não encontrada.'); Object.assign(faq, fields); });
        res.json({ ok: true });
    }));
    router.delete('/api/admin/faq/:id', auth, wrap(async (req, res) => {
        await db.mutate(s => { if (!s.faq.some(f => f.id === Number(req.params.id))) fail(404, 'Pergunta não encontrada.'); s.faq = s.faq.filter(f => f.id !== Number(req.params.id)); });
        res.json({ ok: true });
    }));
    return router;
}
module.exports = { createStateAdminRouter };
