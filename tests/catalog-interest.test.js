const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createLocalDb, createLocalState } = require('../server/local-db');
const { importExistingCourses } = require('../server/catalog-import');

async function exercise(db) {
    assert.deepEqual(await importExistingCourses(db), { imported: 5, existing: 0 });
    assert.deepEqual(await importExistingCourses(db), { imported: 0, existing: 5 });
    await db.mutate(s => { s.cursos.forEach(c => Object.assign(c, { data_inicio: '2099-01-01', data_termino: '2099-12-31' })); });
    const createApp = require('../server/server');
    const app = await createApp({ db, adminAuth: { getAuth: () => ({ verifySessionCookie: async () => ({ uid: 'test-admin' }) }), allowedUids: ['test-admin'] } });
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, body, admin = false, method = body ? 'POST' : 'GET') => {
        const response = await fetch(base + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(admin ? { Cookie: 'qualifica_vix_admin_session=test-session' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
        return { status: response.status, data: await response.json(), headers: response.headers };
    };
    try {
        const publicList = await request('/api/cursos-public');
        const adminList = await request('/cursos', null, true);
        assert.equal(publicList.data.length, 5);
        assert.deepEqual(publicList.data.map(c => c.id), adminList.data.map(c => c.id));
        assert.deepEqual(new Set(publicList.data.map(c => c.mascote_id)), new Set(['beleza', 'moda', 'chef', 'tecnologia', 'saude']));
        const body = { curso: 19, nome: 'Cozinha profissional', vagas: 20, idade_min: 9, idade_max: 71,
            local: 12, modalidade: 1, mascote_id: 'chef', descricao: 'Aprenda cozinha', ementa: 'Boas práticas', pre_requisitos: 'Ensino fundamental', status: 'ativo' };
        assert.equal((await request('/cursos/3', body, false, 'PUT')).status, 401);
        assert.equal((await request('/cursos/3', body, true, 'PUT')).status, 200);
        const detail = await request('/api/cursos-public/3');
        assert.equal(detail.data.nome, body.nome); assert.equal(detail.data.mascote_id, body.mascote_id);
        assert.equal(detail.data.ementa, body.ementa); assert.equal(detail.headers.get('cache-control'), 'no-store');
        const lead = { nome: 'Pessoa de teste', email: 'teste@example.invalid', whatsapp: '27999990000', perfil: 'Gastronomia', curso_id: 3, origem: 'site_curso', autoriza_contato: true };
        assert.equal((await request('/api/interessados', { ...lead, autoriza_contato: false })).status, 400);
        assert.equal((await request('/api/interessados', { ...lead, curso_id: 9999 })).status, 404);
        assert.equal((await request('/api/interessados', lead)).status, 200);
        assert.equal((await request('/api/interessados', lead)).status, 200);
        assert.equal((await request('/api/interessados')).status, 401);
        const leads = await request('/api/interessados', null, true);
        assert.equal(leads.data.length, 1); assert.equal(leads.data[0].curso_nome, body.nome);
        assert.equal(leads.data[0].origem, 'site_curso'); assert.equal(leads.data[0].autoriza_contato, true);
        const statusPath = `/api/interessados/${leads.data[0].id}/status`;
        assert.equal((await request(statusPath, { status: 'contatado' }, false, 'PUT')).status, 401);
        assert.equal((await request(statusPath, { status: 'invalid' }, true, 'PUT')).status, 400);
        assert.equal((await request(statusPath, { status: 'contatado' }, true, 'PUT')).status, 200);
        assert.equal((await request('/api/admin/stats', null, true)).data.leads, 0);
        assert.equal((await request('/api/admin/interessados/exportar-excel')).status, 401);
        const excel = await fetch(base + '/api/admin/interessados/exportar-excel', { headers: { Cookie: 'qualifica_vix_admin_session=test-session' } });
        assert.equal(excel.status, 200); assert.match(excel.headers.get('content-type'), /spreadsheetml/);
        assert.equal((await request('/cursos/3', { ...body, status: 'arquivado' }, true, 'PUT')).status, 200);
        assert.equal((await request('/api/cursos-public')).data.length, 4);
        assert.equal((await request('/api/cursos-public/3')).status, 404);
        assert.equal((await request('/cursos', null, true)).data.length, 5);
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('Catálogo único: importação sem duplicação, edição no admin, banner público e interessados privados', async () => {
    await exercise(createLocalDb(createLocalState(false)));
});

test('Firebase real: catálogo e interessados integrados em área isolada', { skip: process.env.TEST_FIREBASE !== 'true' }, async () => {
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
