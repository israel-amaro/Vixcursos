const express = require('express');
const XLSX = require('xlsx');
const { createLocalDb } = require('./local-db');

function createInterestedRouter(db, auth) {
    const router = express.Router();
    const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
    const wrap = action => async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try { await action(req, res); }
        catch (error) { console.error('[interessados]', error.code || 'unavailable'); res.status(error.status || 503).json({ error: error.status && error.status < 500 ? error.message : 'Não foi possível salvar ou consultar os interessados. Tente novamente.' }); }
    };
    const enrich = state => {
        const courses = createLocalDb(state).getPublicCourses();
        return state.interessados.map(lead => ({ ...lead, curso_nome: courses.find(c => c.id === lead.curso_id)?.nome || '' })).sort((a, b) => b.id - a.id);
    };
    router.post('/api/interessados', wrap(async (req, res) => {
        const b = req.body;
        const nome = String(b.nome || '').trim();
        const email = String(b.email || '').trim().toLowerCase();
        let whatsapp = String(b.whatsapp || '').replace(/\D/g, '');
        if (whatsapp.length > 11 && whatsapp.startsWith('55')) whatsapp = whatsapp.slice(2);
        const perfil = String(b.perfil || '').trim();
        if (nome.length < 3 || nome.length > 160) fail(400, 'Informe seu nome completo.');
        if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) fail(400, 'Confira o e-mail informado.');
        if (whatsapp && !/^\d{10,11}$/.test(whatsapp)) fail(400, 'Informe o telefone com DDD.');
        if (!email && !whatsapp) fail(400, 'Informe um e-mail ou telefone para contato.');
        if (!perfil || perfil.length > 160) fail(400, 'Selecione uma área de interesse.');
        if (b.autoriza_contato !== true) fail(400, 'Autorize o contato sobre os cursos para salvar seu interesse.');
        const cursoId = b.curso_id ? Number(b.curso_id) : null;
        if (b.curso_id && (!Number.isInteger(cursoId) || cursoId < 1)) fail(400, 'Curso inválido.');
        const region = String(b.regiao || '').trim().slice(0, 120);
        const source = ['site_curso', 'site', 'chat_quiz'].includes(b.origem) ? b.origem : 'site';
        await db.mutate(state => {
            if (cursoId && !state.cursos.some(c => c.id === cursoId && ['ativo', 'esgotado'].includes(c.status) && (!c.data_publicacao || Date.parse(c.data_publicacao) <= Date.now()))) fail(404, 'Curso não encontrado.');
            const previous = state.interessados.find(lead =>
                ((whatsapp && lead.whatsapp === whatsapp) || (email && lead.email === email)) &&
                lead.perfil_curso === perfil && (lead.curso_id || null) === cursoId);
            const now = new Date().toISOString();
            const fields = { nome, email, whatsapp, regiao: region, perfil_curso: perfil, curso_id: cursoId,
                origem: source, autoriza_contato: true, consentimento_em: now, atualizado_em: now };
            if (previous) Object.assign(previous, fields);
            else state.interessados.push({ id: Math.max(0, ...state.interessados.map(l => Number(l.id) || 0)) + 1,
                ...fields, status: 'aguardando', criado_em: now, enviado_em: null });
        });
        res.json({ ok: true, message: 'Interesse registrado! A equipe poderá entrar em contato sobre os cursos.' });
    }));
    router.get('/api/interessados', auth, wrap(async (_req, res) => res.json(enrich(await db.readState()))));
    router.put('/api/interessados/:id/status', auth, wrap(async (req, res) => {
        if (!['aguardando', 'contatado', 'enviado', 'matriculado', 'desinteressado'].includes(req.body.status)) fail(400, 'Situação inválida.');
        await db.mutate(state => {
            const lead = state.interessados.find(l => l.id === Number(req.params.id));
            if (!lead) fail(404, 'Interessado não encontrado.');
            lead.status = req.body.status;
            lead.atualizado_em = new Date().toISOString();
            if (['contatado', 'enviado'].includes(lead.status)) lead.enviado_em = lead.atualizado_em;
        });
        res.json({ ok: true });
    }));
    router.get('/api/admin/interessados/exportar-excel', auth, wrap(async (_req, res) => {
        const rows = enrich(await db.readState()).map(l => ({ Nome: l.nome, WhatsApp: l.whatsapp, Email: l.email,
            Região: l.regiao, Área: l.perfil_curso, Curso: l.curso_nome, Situação: l.status,
            Origem: l.origem, Cadastro: l.criado_em, 'Autorização de contato': l.autoriza_contato ? 'Sim' : 'Não informada' }));
        const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Interessados');
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').attachment('qualifica-vix-interessados.xlsx').send(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }));
    return router;
}

module.exports = { createInterestedRouter };
