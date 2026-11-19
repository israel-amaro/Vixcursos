const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { adminFixture, adminAuth, cookie, disableNotifications, createLocalDb } = require('./helpers/admin-fixture');
const { createLinkToken } = require('../server/survey-certificate-router');
const { courseState } = require('../server/course-state');
const { enroll } = require('../server/citizen-service');

test('Fase 1: acesso assinado, escape, rotas removidas, limite persistente e cancelamento', async () => {
    disableNotifications();
    process.env.CERT_LINK_SECRET = 'segredo-exclusivo-dos-testes-fase1';
    const state = adminFixture();
    state.cursos[0].vagas = 1;
    state.cursos[0].data_termino = '2099-12-31';
    const db = createLocalDb(state);
    const app = await require('../server/server')({ db, adminAuth });
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (url, method = 'GET', body, admin = false) => fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(admin ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    try {
        for (const path of ['/api/pre-inscricoes/por-cpf/52998224725', '/cursos-detalhes/1']) assert.equal((await request(path)).status, 404);
        assert.equal((await request('/certificado/1')).status, 401);
        assert.equal((await request('/api/pre-inscricoes/1/pesquisa-conclusao', 'POST', {})).status, 401);
        const token = createLinkToken(1);
        assert.equal((await request(`/certificado/1?token=${token}`)).status, 403);
        assert.equal((await request(`/certificado/1?token=${createLinkToken(1, Date.now() - 1)}`)).status, 401);
        assert.equal((await request(`/certificado/2?token=${token}`)).status, 401);
        await db.mutate(s => { s.preInscricoes[0].situacao_final = 'concluido'; });
        const cert = await request(`/certificado/1?token=${token}`);
        assert.equal(cert.status, 200);
        const html = await cert.text(); assert.ok(html.includes('&lt;img')); assert.ok(!html.includes('<img src=x'));
        assert.equal((await request(`/api/pre-inscricoes/1/pesquisa-conclusao?token=${token}`, 'POST', { recomendaria: 'sim' })).status, 200);
        for (let n = 0; n < 10; n++) assert.equal((await request('/api/cidadaos/localizar', 'POST', { cpf: '52998224725' })).status, 200);
        assert.equal((await request('/api/cidadaos/localizar', 'POST', { cpf: '52998224725' })).status, 429);
        assert.ok(Object.keys((await db.readState()).rateLimits).length);
        // Repeated calls retain the counter in the database.
        assert.equal((await request('/api/cidadaos/localizar', 'POST', { cpf: '52998224725' })).status, 429);
        await db.mutate(s => { s.preInscricoes[0].situacao_final = 'inscrito'; });
        let course = db.getPublicCourses().find(c => c.id === 1);
        assert.equal(course.vagas_disponiveis, 0); assert.equal(courseState(course).situacao, 'esgotado');
        assert.equal((await request('/api/inscricoes/1', 'DELETE', undefined, true)).status, 200);
        course = db.getPublicCourses().find(c => c.id === 1);
        assert.equal(course.vagas_disponiveis, 1); assert.equal(courseState(course).situacao, 'aberto');
        await db.mutate(s => { s.cursos[0].status = 'esgotado'; });
        assert.equal(courseState(db.getPublicCourses().find(c => c.id === 1)).situacao, 'esgotado');
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('Fase 1: ultima vaga preserva status e limites cobrem todas as rotas', async () => {
    const { createRateLimit } = require('../server/rate-limit');
    const s = adminFixture(); s.preInscricoes = []; s.usuarios = [];
    Object.assign(s.cursos[0], { status: 'ativo', vagas: 1, data_inicio: '2099-01-01', data_termino: '2099-12-31' });
    enroll(s, { cpf: '52998224725', curso_id: 1, nome: 'Ana', email: 'ana@example.invalid', telefone: '27999999999', rg: '123456', cep: '29000000', municipio: 'Vitória', uf: 'ES', data_nascimento: '15/04/1995', aceitou_termos_ciencia: true, aceitou_aviso_lgpd: true }, { headers: {} });
    assert.equal(s.cursos[0].status, 'ativo');
    assert.equal(createLocalDb(s).getPublicCourses()[0].vagas_disponiveis, 0);
    s.preInscricoes[0].status = 'cancelado';
    assert.equal(createLocalDb(s).getPublicCourses()[0].vagas_disponiveis, 1);
    const db = createLocalDb(s);
    await db.mutate(state => { state.rateLimits = { expirado: { count: 100, expiresAt: 1 } }; });
    for (const [path, { ip: limit }] of Object.entries(require('../server/rate-limit').limits)) {
        for (let n = 0; n <= limit; n++) {
            let passed = false;
            const response = { code: 200, status(code) { this.code = code; return this; }, set() { return this; }, json() { return this; } };
            await createRateLimit(db)({ method: 'POST', path: n % 2 ? path.toUpperCase() + '/' : path, headers: {}, socket: { remoteAddress: '127.0.0.9' } }, response, () => { passed = true; });
            assert.equal(passed, n < limit); assert.equal(response.code, n < limit ? 200 : 429);
        }
    }
    assert.equal((await db.readState()).rateLimits.expirado, undefined);
});

test('Rate limit: mesmo IP (CRAS) atende varios CPFs, mas limita repeticao por CPF', async () => {
    const { createRateLimit, limits } = require('../server/rate-limit');
    const db = createLocalDb(adminFixture());
    const call = async cpf => {
        let passed = false;
        const response = { code: 200, status(code) { this.code = code; return this; }, set() { return this; }, json() { return this; } };
        await createRateLimit(db)({ method: 'POST', path: '/inscricao', body: { cpf }, headers: {}, socket: { remoteAddress: '10.0.0.1' } }, response, () => { passed = true; });
        return passed;
    };
    const cpfs = ['52998224725', '11144477735', '39053344705', '15350946056', '86288366757', '45317828791', '71428793860'];
    for (const cpf of cpfs) assert.equal(await call(cpf), true, `CPF ${cpf} deveria passar no mesmo IP`);
    for (let n = 1; n < limits['/inscricao'].cpf; n++) assert.equal(await call('52998224725'), true);
    assert.equal(await call('52998224725'), false);
    assert.equal(await call('11144477735'), true);
});

test('Chat do Vitoruga devolve links de inscricao', () => {
    const { chatReply } = require('../server/server');
    const courses = [
        { id: 5, nome: 'Informática Básica', categoria: 'Tecnologia', local: 'SENAI', vagas_disponiveis: 3, vagas_totais: 20, situacao_label: 'Inscrições abertas' },
        { id: 7, nome: 'Gastronomia', local: 'CRAS Jucutuquara', vagas_disponiveis: 0, vagas_totais: 10 },
    ];
    assert.match(chatReply(courses, 'curso 5'), /\/pre-inscricao\/5/);
    assert.match(chatReply(courses, 'quero fazer informatica'), /\/pre-inscricao\/5/);
    assert.match(chatReply(courses, 'quero me inscrever'), /\/pre-inscricao\/5[\s\S]*\/pre-inscricao\/7/);
    const vagas = chatReply(courses, 'tem vagas?');
    assert.match(vagas, /3 vagas livres/); assert.doesNotMatch(vagas, /pre-inscricao\/7/);
    assert.match(chatReply(courses, 'onde sao as aulas'), /CRAS Jucutuquara/);
    assert.match(chatReply([], 'vagas'), /não há cursos/);
    assert.match(chatReply(courses, 'xyz'), /Não entendi/);
});
