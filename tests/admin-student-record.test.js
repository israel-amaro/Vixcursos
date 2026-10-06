const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createLocalDb, createLocalState } = require('../server/local-db');

async function exercise(db) {
    await db.mutate(state => {
        const fixture = createLocalState();
        fixture.cursos[3].nome = 'Desenvolvimento de sistemas';
        Object.assign(state, fixture);
        state.usuarios.push({ id: 1, cpf: '52998224725', nome: 'Pessoa de demonstração', email: 'atual@example.invalid', possui_necessidade_especial: 'sim', tipo_necessidade_especial: 'Informação de teste' });
        state.usuarios.push({ id: 2, cpf: '11144477735', nome: 'Cadastro antigo', possui_deficiencia: 'nao', tipo_deficiencia: '' });
        state.preInscricoes.push({ id: 1, cpf: '52998224725', nome: 'Nome anterior', curso_id: 4, criado_em: '2026-09-01T10:00:00Z', autoriza_lgpd: 'sim', autoriza_uso_imagem: 'sim' });
        state.preInscricoes.push({ id: 2, cpf: '52998224725', nome: 'Nome anterior', curso_id: 3, criado_em: '2026-10-01T10:00:00Z', autoriza_lgpd: 'nao', autoriza_uso_imagem: 'nao', aceitou_aviso_lgpd: true, aceitou_termos_ciencia: true, pesquisa_satisfacao_respondida: 1, nota_satisfacao_geral: 0 });
        state.preInscricoes.push({ id: 3, cpf: '12345678909', nome: 'Somente inscrição antiga', curso_id: 4, criado_em: '2026-09-02T10:00:00Z', possui_necessidade_especial: 'nao' });
    });
    const before = await db.readState();
    const app = await require('../server/server')({ db, adminAuth: { getAuth: () => ({ verifySessionCookie: async () => ({ uid: 'test-admin' }) }), allowedUids: ['test-admin'] } });
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const request = async (cpf, admin = true) => {
        const res = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/aluno/completo/${encodeURIComponent(cpf)}`, { headers: admin ? { Cookie: 'qualifica_vix_admin_session=test-session' } : {} });
        return { status: res.status, data: await res.json(), cache: res.headers.get('cache-control') };
    };
    try {
        assert.equal((await request('52998224725', false)).status, 401);
        assert.equal((await request('123')).status, 400);
        assert.equal((await request('39053344705')).status, 404);
        const record = await request('529.982.247-25');
        assert.equal(record.status, 200);
        assert.equal(record.cache, 'no-store');
        assert.equal(record.data.aluno.nome, 'Pessoa de demonstração');
        assert.equal(record.data.aluno.email, 'atual@example.invalid');
        assert.equal(record.data.aluno.possui_necessidade_especial, 'sim');
        assert.equal(record.data.aluno.tipo_necessidade_especial, 'Informação de teste');
        assert.equal(record.data.aluno.autoriza_lgpd, 'nao');
        assert.equal(record.data.aluno.autoriza_uso_imagem, 'nao');
        assert.equal(record.data.aluno.aceitou_aviso_lgpd, true);
        assert.equal(record.data.aluno.nota_satisfacao_geral, 0);
        assert.deepEqual(record.data.historico.map(row => row.id), [2, 1]);
        assert.equal(record.data.historico[1].curso_nome, 'Desenvolvimento de sistemas');
        assert.equal(record.data.historico[1].local_nome, 'SENAI Cícero Freire');
        const legacy = await request('11144477735');
        assert.equal(legacy.data.aluno.possui_necessidade_especial, 'nao');
        assert.deepEqual(legacy.data.historico, []);
        assert.equal((await request('12345678909')).data.aluno.nome, 'Somente inscrição antiga');
        assert.deepEqual(await db.readState(), before, 'Reading a record must not change citizen data');
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('Ficha administrativa preserva perfil atual, necessidades, consentimentos e histórico completo', async () => {
    await exercise(createLocalDb(createLocalState(false)));
});

test('Firebase real: ficha administrativa em área isolada', { skip: process.env.TEST_FIREBASE !== 'true' }, async () => {
    require('dotenv').config({ path: '.env.local', quiet: true });
    const { createLazyFirebaseDb } = require('../server/firebase-db');
    const testPath = `qualificaVix/testing/${require('crypto').randomUUID()}`;
    try { await exercise(createLazyFirebaseDb({ dataPath: testPath })); }
    finally {
        const { getDatabase } = require('firebase-admin/database');
        const { getApp, deleteApp } = require('firebase-admin/app');
        const app = getApp('qualifica-vix-server');
        try { await getDatabase(app).ref(testPath).remove(); }
        finally { await deleteApp(app); }
    }
});
