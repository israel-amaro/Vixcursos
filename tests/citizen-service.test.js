const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createCitizenRouter, digest } = require('../server/citizen-service');
const { createLocalDb, createLocalState } = require('../server/local-db');
const { createFirebaseDb } = require('../server/firebase-db');
const { createStateAdminRouter } = require('../server/state-admin-router');

const fixture = cpf => ({
    cpf, nome: 'Cidadão de Teste', email: 'teste@example.invalid', telefone: '27999999999', rg: '123456',
    cep: '29100000', municipio: 'Vila Velha', uf: 'ES', numero: '10', rua: 'Rua de Teste', bairro: 'Teste',
    data_nascimento: '01/01/1990', escolaridade: 'Ensino Médio Completo', curso_id: 1,
    aceitou_termos_ciencia: true, aceitou_aviso_lgpd: true, autoriza_uso_imagem: 'nao', mora_vitoria: 'nao', trabalha_vitoria: 'sim',
    mascote_preferido: 'saude',
});

async function exercise(db) {
    const codes = [];
    const app = express(); app.use(express.json()); app.use(createCitizenRouter(db, { sendCode: async (_email, code) => codes.push(code) }));
    app.use(createStateAdminRouter(db, (req, res, next) => req.headers.authorization === 'Bearer test-admin' ? next() : res.status(401).json({ error: 'Não autorizado' })));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, body, token, method = 'POST') => {
        const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
        return { status: res.status, data: await res.json() };
    };
    try {
        assert.equal((await request('/cursos', null, null, 'GET')).status, 401);
        const created = await request('/cursos', { curso: 1, vagas: 12, idade_min: 9, idade_max: 71, local: 1, modalidade: 1, descricao: 'Curso teste', ementa: 'Ementa teste', pre_requisitos: 'Ensino médio', mascote_id: 'gestao' }, 'test-admin');
        assert.equal(created.status, 200);
        const courseList = await request('/cursos', null, 'test-admin', 'GET');
        const createdCourse = courseList.data.find(c => c.id === created.data.id);
        assert.equal(createdCourse.mascote_id, 'gestao'); assert.equal(createdCourse.ementa, 'Ementa teste');
        assert.equal(createdCourse.idade_min, '18');
        assert.equal((await request('/inscricao', { ...fixture('52998224725'), aceitou_aviso_lgpd: false })).status, 400);
        const denied = await request('/inscricao', { ...fixture('52998224725'), trabalha_vitoria: 'nao', confirmou_cep_fora_vitoria: true, mora_vitoria: 'sim' });
        assert.equal(denied.status, 400); assert.match(denied.data.error, /corrigi-lo/);
        assert.equal((await request('/inscricao', { ...fixture('52998224725'), trabalha_vitoria: undefined })).status, 400);
        assert.equal((await request('/inscricao', { ...fixture('52998224725'), municipio: 'Vitória', uf: 'BA', trabalha_vitoria: 'nao' })).status, 400);
        assert.equal((await db.readState()).usuarios.length, 0);
        const registrations = await Promise.all([request('/inscricao', fixture('52998224725')), request('/inscricao', { ...fixture('11144477735'), cep: '29010001', municipio: 'Vitória', mora_vitoria: 'sim', trabalha_vitoria: '' })]);
        assert.ok(registrations.every(r => r.status === 200), JSON.stringify(registrations));
        assert.deepEqual(registrations.map(r => r.data.status_inscricao).sort(), ['suplente', 'titular']);
        const state = await db.readState();
        assert.equal(state.usuarios.length, 2); assert.equal(state.preInscricoes.length, 2);
        assert.equal(state.preInscricoes.filter(i => i.status_inscricao === 'titular').length, 1);
        assert.equal(state.preInscricoes[0].autoriza_uso_imagem, 'nao');
        assert.equal(state.preInscricoes[0].vaga_expira_em ?? null, null);
        assert.equal(state.preInscricoes[0].cpf_documento, undefined);
        assert.equal((await request('/inscricao', fixture('52998224725'))).status, 409);
        const located = await request('/api/cidadaos/localizar', { cpf: '529.982.247-25' });
        assert.equal(located.data.localizou, true); assert.notEqual(located.data.id_mascarado.nome, fixture().nome);
        assert.equal((await request('/api/cidadaos/me', null, null, 'GET')).status, 401);
        assert.equal((await request('/api/cidadaos/enviar-codigo', { cpf: '52998224725' })).status, 200);
        assert.equal((await request('/api/cidadaos/enviar-codigo', { cpf: '52998224725' })).status, 429);
        assert.equal((await request('/api/cidadaos/validar-codigo', { cpf: '52998224725', codigo: '000000' })).status, 400);
        const authenticated = await request('/api/cidadaos/validar-codigo', { cpf: '52998224725', codigo: codes[0] });
        assert.equal(authenticated.status, 200); const token = authenticated.data.sessionToken;
        assert.equal((await request('/api/cidadaos/validar-codigo', { cpf: '52998224725', codigo: codes[0] })).status, 400);
        const profile = await request('/api/cidadaos/me', null, token, 'GET');
        assert.equal(profile.data.data.trabalha_vitoria, 'sim');
        assert.equal(profile.data.data.mascote_preferido, 'saude'); assert.equal(profile.data.historico.length, 1);
        assert.equal((await request('/api/cidadaos/me', { ...fixture('52998224725'), trabalha_vitoria: 'nao' }, token, 'PUT')).status, 400);
        assert.equal((await request('/api/cidadaos/me', { ...fixture('52998224725'), numero: '20', cpf_documento: 'unwanted' }, token, 'PUT')).status, 200);
        assert.equal((await request('/api/cidadaos/me', null, token, 'GET')).data.data.numero, '20');
        assert.equal((await request('/inscricao', { ...fixture('52998224725'), curso_id: 2 })).status, 401);
        assert.equal((await request('/inscricao', { ...fixture('52998224725'), curso_id: 2 }, token)).status, 200);
        assert.equal((await db.readState()).preInscricoes.length, 3);
        const report = await request('/api/admin/relatorios-stats', null, 'test-admin', 'GET');
        assert.equal(report.status, 200); assert.equal(report.data.kpis.total, 3);
        const adminProfile = await request('/api/admin/aluno/completo/52998224725', null, 'test-admin', 'GET');
        assert.equal(adminProfile.data.historico.length, 2);
        const anotherInstance = db.provider === 'firebase' ? await createFirebaseDb({ dataPath: db.testPath }) : db;
        assert.equal((await anotherInstance.readState()).usuarios.find(u => u.cpf === '52998224725').numero, '10');
        await db.mutate(s => { s.sessions[digest(token)].expiresAt = 0; });
        assert.equal((await request('/api/cidadaos/me', null, token, 'GET')).status, 401);
    } finally { await new Promise(resolve => server.close(resolve)); }
}

test('cadastro: reserva concorrente, consentimentos, recuperação, atualização e reuso', async () => {
    const state = createLocalState(); state.cursos[0].vagas = 1;
    await exercise(createLocalDb(state));
});

test('Firebase: transações e persistência real em área isolada', { skip: process.env.TEST_FIREBASE !== 'true' }, async () => {
    require('dotenv').config({ path: '.env.local', quiet: true });
    const testPath = `qualificaVix/testing/${require('crypto').randomUUID()}`;
    const db = await createFirebaseDb({ dataPath: testPath }); db.testPath = testPath;
    try {
        await db.mutate(s => { Object.assign(s, createLocalState()); s.cursos[0].vagas = 1; });
        await exercise(db);
    } finally {
        const { getDatabase } = require('firebase-admin/database');
        const { getApp, deleteApp } = require('firebase-admin/app');
        const app = getApp('qualifica-vix-server');
        try { await getDatabase(app).ref(testPath).remove(); }
        finally { await deleteApp(app); }
    }
});
