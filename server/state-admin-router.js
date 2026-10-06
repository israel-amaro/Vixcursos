const express = require('express');
const XLSX = require('xlsx');
const { createLocalDb } = require('./local-db');
const { validCpf } = require('./citizen-service');
const mascots = require('../public/mascotes.json');

function createStateAdminRouter(db, auth) {
    const router = express.Router();
    const wrap = operation => async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try { await operation(req, res); } catch (e) { console.error('[admin]', e.code || 'unavailable'); res.status(e.status || 503).json({ error: e.status && e.status < 500 ? e.message : 'Não foi possível concluir a operação.' }); }
    };
    const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
    const courses = s => createLocalDb(s).getPublicCourses();
    const publicCourses = s => courses(s).filter(c => ['ativo', 'esgotado'].includes(c.status) && (!c.data_publicacao || Date.parse(c.data_publicacao) <= Date.now())).sort((a, b) => b.id - a.id);
    const nextId = rows => rows.reduce((max, row) => Math.max(max, Number(row.id)), 0) + 1;
    const catalog = createLocalDb();
    const options = type => catalog.query(`SELECT * FROM filtro_${type}`)[0];
    const ages = options('idade');
    const adminCourses = s => courses(s).map(course => {
        const raw = s.cursos.find(row => row.id === course.id);
        return { ...course, curso: raw.curso_id, categoria_id: raw.categoria_id, local_id: raw.local_id,
            modalidade_id: raw.modalidade_id, idade_min_id: ages.find(a => a.idade === Number(raw.idade_min))?.id,
            idade_max_id: ages.find(a => a.idade === Number(raw.idade_max))?.id,
            data_inicio_iso: raw.data_inicio, data_termino_iso: raw.data_termino };
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
            if (b[key] && (!/^\d{4}-\d{2}-\d{2}$/.test(b[key]) || Number.isNaN(Date.parse(b[key])))) fail(400, 'Data inválida.');
        }
        if (b.data_inicio && b.data_termino && b.data_termino < b.data_inicio) fail(400, 'O término precisa ser após o início.');
        for (const key of ['horario_inicio', 'horario_termino']) {
            if (b[key] && !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(b[key])) fail(400, 'Horário inválido.');
        }
        const text = (key, limit = 10000) => {
            const value = String(b[key] || '').trim();
            if (value.length > limit) fail(400, 'Um dos textos excede o tamanho permitido.');
            return value;
        };
        return {
            curso_id: Number(b.curso), categoria_id: Number(b.categoria_id || b.curso), nome: text('nome', 160), vagas: Number(b.vagas),
            status: b.status || 'ativo', local_id: Number(b.local), modalidade_id: Number(b.modalidade),
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
        (!q.data_inicio || i.criado_em.slice(0, 10) >= q.data_inicio) && (!q.data_fim || i.criado_em.slice(0, 10) <= q.data_fim));
    const group = (rows, field) => Object.entries(rows.reduce((acc, row) => {
        const label = typeof field === 'function' ? field(row) : row[field] || 'Não informado';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
    }, {})).map(([label, total]) => ({ label, total }));

    router.get('/api/cursos-public', wrap(async (_req, res) => res.json(publicCourses(await db.readState()))));
    router.get('/api/cursos-public/:id', wrap(async (req, res) => {
        const course = publicCourses(await db.readState()).find(c => c.id === Number(req.params.id));
        if (!course) fail(404, 'Curso não encontrado.');
        res.json(course);
    }));
    router.get('/api/cursos-public/:id/vagas', wrap(async (req, res) => {
        const course = publicCourses(await db.readState()).find(c => c.id === Number(req.params.id));
        if (!course) fail(404, 'Curso não encontrado.');
        res.json({ vagas_totais: course.vagas_totais, inscritos: course.inscritos, vagas_disponiveis: course.vagas_disponiveis, status: course.status });
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
    router.get('/inscritos/:idCurso', auth, wrap(async (req, res) => res.json(enriched(await db.readState()).filter(i => i.curso_id === Number(req.params.idCurso)))));
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
        await db.mutate(s => {
            const i = s.preInscricoes.find(i => i.id === Number(req.params.id));
            if (!i) fail(404, 'Inscrição não encontrada.');
            if (i.status_inscricao !== 'titular') fail(409, 'A inscrição está na lista de espera.');
            i.matricula_confirmada = 1; i.matricula_confirmada_em = new Date().toISOString(); i.status = 'matriculado';
        });
        res.json({ status: 'ok' });
    }));
    router.put('/api/inscricoes/:id/status-final', auth, wrap(async (req, res) => {
        if (!['concluido', 'evadido', 'cancelado', 'desistencia', 'nao_concluido', 'desistente', 'nao_compareceu', 'matriculado', 'inscrito'].includes(req.body.status)) fail(400, 'Situação inválida.');
        await db.mutate(s => { const i = s.preInscricoes.find(i => i.id === Number(req.params.id)); if (!i) fail(404, 'Inscrição não encontrada.'); i.status = req.body.status; i.situacao_final = req.body.status; });
        res.json({ status: 'ok' });
    }));
    router.delete('/api/inscricoes/:id', auth, wrap(async (req, res) => {
        await db.mutate(s => { const i = s.preInscricoes.find(i => i.id === Number(req.params.id)); if (!i) fail(404, 'Inscrição não encontrada.'); i.status = 'cancelado'; i.situacao_final = 'cancelado'; const c = s.cursos.find(c => c.id === i.curso_id); if (c) c.status = 'ativo'; });
        res.json({ status: 'ok' });
    }));
    router.get('/api/admin/stats', auth, wrap(async (_req, res) => {
        const s = await db.readState(); res.json({ total: s.cursos.length, ativos: s.cursos.filter(c => c.status === 'ativo').length, inscritos: s.preInscricoes.length, leads: s.interessados.filter(i => i.status === 'aguardando').length });
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
        res.json({ genero: group(rows, 'genero'), raca_cor: group(rows, 'raca_cor'), bairro: group(rows, 'bairro'), escolaridade: group(rows, 'escolaridade'), deficiencia: group(rows, 'possui_necessidade_especial'), objetivo: group(rows, 'objetivo'), faixa_etaria: group(rows, i => {
            const year = Number(String(i.data_nascimento || '').split('/')[2]);
            if (!year) return 'Não informada'; const age = new Date().getFullYear() - year;
            return age < 18 ? 'Menor de 18 anos' : age < 30 ? '18 a 29 anos' : age < 60 ? '30 a 59 anos' : '60 anos ou mais';
        }), kpis: { total: rows.length, concluidos: rows.filter(i => i.situacao_final === 'concluido').length, evadidos: rows.filter(i => i.situacao_final === 'evadido').length, satisfacao_media: ratings.length ? ratings.reduce((sum, i) => sum + Number(i.nota_satisfacao_geral), 0) / ratings.length : 0 } });
    }));
    router.get('/api/admin/exportar-excel', auth, wrap(async (req, res) => {
        const rows = filtered(await db.readState(), req.query);
        const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Inscrições');
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('qualifica-vix-inscricoes.xlsx').send(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }));
    return router;
}
module.exports = { createStateAdminRouter };
