const express = require('express');
const crypto = require('crypto');
const { sessionFor } = require('./citizen-service');
const { createLocalDb } = require('./local-db');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
function secret() { if (!process.env.CERT_LINK_SECRET) fail(503, 'Links de certificado temporariamente indisponíveis.'); return process.env.CERT_LINK_SECRET; }
function sign(payload) { return crypto.createHmac('sha256', secret()).update(payload).digest('base64url'); }
function createLinkToken(id, expiresAt = Date.now() + 7 * 86400000) {
    const payload = Buffer.from(JSON.stringify({ id: Number(id), expiresAt })).toString('base64url');
    return `${payload}.${sign(payload)}`;
}
function authorize(state, req, row) {
    if (!row) fail(404, 'Inscrição não encontrada.');
    const token = String(req.query.token || '');
    if (!token) return sessionFor(state, req, row.cpf);
    const [payload, signature, extra] = token.split('.');
    const expected = sign(payload || '');
    if (extra || !signature || Buffer.byteLength(signature) !== Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) fail(401, 'Link inválido ou expirado.');
    let data;
    try { data = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { fail(401, 'Link inválido ou expirado.'); }
    if (data.id !== row.id || !Number.isFinite(data.expiresAt) || data.expiresAt <= Date.now()) fail(401, 'Link inválido ou expirado.');
}
function createSurveyCertificateRouter(db, auth) {
    const router = express.Router();
    const wrap = fn => async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try { await fn(req, res); } catch (e) { res.status(e.status || 503).json({ error: e.status ? e.message : 'Não foi possível concluir a operação.' }); }
    };
    const rowFor = (s, id) => s.preInscricoes.find(i => i.id === Number(id));
    router.post('/api/admin/inscricoes/:id/links', auth, wrap(async (req, res) => {
        const s = await db.readState();
        if (!rowFor(s, req.params.id)) fail(404, 'Inscrição não encontrada.');
        const token = createLinkToken(req.params.id);
        res.json({ certificado: `/certificado/${req.params.id}?token=${token}`, conclusao: `/questionario-conclusao.html?id=${req.params.id}&token=${token}`, satisfacao: `/pesquisa-satisfacao.html?id=${req.params.id}&token=${token}` });
    }));
    const fields = {
        'pesquisa-conclusao': ['emprego_pos_curso', 'contribuicao_profissional', 'recomendaria', 'beneficio_principal'],
        'pesquisa-satisfacao': ['nota_satisfacao_instrutor', 'nota_satisfacao_estrutura', 'nota_satisfacao_material', 'nota_satisfacao_geral', 'comentario_satisfacao'],
    };
    for (const [type, names] of Object.entries(fields)) router.post(`/api/pre-inscricoes/:id/${type}`, wrap(async (req, res) => {
        await db.mutate(s => {
            const row = rowFor(s, req.params.id); authorize(s, req, row);
            for (const name of names) row[name] = String(req.body[name] ?? '').slice(0, 2000);
            row[type === 'pesquisa-conclusao' ? 'questionario_conclusao_respondido' : 'pesquisa_satisfacao_respondida'] = 1;
        });
        res.json({ ok: true });
    }));
    router.post('/api/pre-inscricoes/sugestoes', wrap(async (req, res) => {
        await db.mutate(s => {
            const session = sessionFor(s, req);
            s.sugestoes ||= [];
            s.sugestoes.push({ id: s.sugestoes.reduce((n, i) => Math.max(n, i.id), 0) + 1, cpf: session.cpf, areas_interesse: String(req.body.areas_interesse || '').slice(0, 2000), sugestao_texto: String(req.body.sugestao_texto || '').slice(0, 2000) });
        });
        res.json({ ok: true });
    }));
    router.get('/certificado/:id', wrap(async (req, res) => {
        const s = await db.readState(); const row = rowFor(s, req.params.id); authorize(s, req, row);
        if (row.situacao_final !== 'concluido' && row.status !== 'certificado_emitido') fail(403, 'O certificado está disponível somente após a conclusão do curso.');
        const course = createLocalDb(s).getPublicCourses().find(c => c.id === row.curso_id);
        res.type('html').send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Certificado — Qualifica Vix</title><style>body{font:20px Arial;padding:5%;text-align:center;line-height:1.8}main{border:4px solid #283e69;padding:5%}@media print{button{display:none}}</style><main><h1>Certificado de conclusão</h1><p>Certificamos que <strong>${escapeHtml(row.nome)}</strong> concluiu o curso <strong>${escapeHtml(course?.nome || 'Curso')}</strong>.</p><p>${escapeHtml(course?.local || 'Vitória')} · Carga horária: ${escapeHtml(course?.carga_horaria || 'A definir')}</p><p>Qualifica Vix — Prefeitura de Vitória</p></main><button onclick="window.print()">Imprimir ou salvar em PDF</button></html>`);
    }));
    return router;
}
module.exports = { createSurveyCertificateRouter, createLinkToken, escapeHtml };
