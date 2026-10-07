const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const XLSX = require('xlsx');
const { adminFixture, adminAuth, cookie, disableNotifications, createLocalDb } = require('./helpers/admin-fixture');

async function exercise(db, t) {
    disableNotifications();
    await db.mutate(s => Object.assign(s, adminFixture()));
    const app = await require('../server/server')({ db, adminAuth });
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, method = 'GET', body, authenticated = true) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Cookie: cookie } : {}) }, ...(body && !['GET', 'HEAD'].includes(method) ? { body: JSON.stringify(body) } : {}) });
    const json = async (path, method = 'GET', body, expected = 200) => { const response = await request(path, method, body); const result = await response.json(); assert.equal(response.status, expected, JSON.stringify(result)); return result; };
    const reset = () => db.mutate(s => Object.assign(s, adminFixture()));
    try {
        await t.test('Todos os endpoints administrativos exigem sessão', async () => {
            for (const [path, method] of [['/api/admin/inscricoes', 'GET'], ['/cursos', 'POST'], ['/cursos/1', 'PUT'], ['/cursos/esgotar/1', 'PUT'], ['/cursos/1', 'DELETE'], ['/inscritos/1', 'GET'], ['/api/inscricoes/1/confirmar', 'PUT'], ['/api/inscricoes/1/status-final', 'PUT'], ['/api/inscricoes/1', 'DELETE'], ['/api/admin/configuracoes', 'PUT'], ['/api/admin/stats', 'GET'], ['/api/admin/cursos-stats', 'GET'], ['/api/admin/relatorios-stats', 'GET'], ['/api/admin/exportar-excel', 'GET'], ['/api/admin/faq', 'POST'], ['/api/admin/faq/1', 'PUT'], ['/api/admin/faq/1', 'DELETE'], ['/api/interessados/1/status', 'PUT']]) {
                assert.equal((await request(path, method, {}, false)).status, 401, path);
            }
        });
        await t.test('Cadastro, edição, arquivamento, esgotamento e exclusão de turmas', async () => {
            const body = { nome: 'Nova turma', curso: 4, categoria_id: 4, local: 12, modalidade: 1, idade_min: 7, idade_max: 71, vagas: 3, data_inicio: '2026-11-01', data_termino: '2026-12-01', horario_inicio: '08:00', horario_termino: '12:00', mascote_id: null };
            const { id } = await json('/cursos', 'POST', body);
            assert.equal((await json(`/api/cursos-public/${id}`)).nome, 'Nova turma');
            await json(`/cursos/${id}`, 'PUT', { ...body, nome: 'Turma editada', status: 'arquivado' });
            await json(`/api/cursos-public/${id}`, 'GET', undefined, 404);
            await json(`/cursos/${id}`, 'PUT', { ...body, nome: 'Turma editada' });
            await json(`/cursos/esgotar/${id}`, 'PUT', {});
            assert.equal((await json(`/api/cursos-public/${id}`)).status, 'esgotado');
            await json(`/cursos/${id}`, 'DELETE');
            await json('/cursos/1', 'DELETE', undefined, 409);
            for (const invalid of [{ vagas: 0 }, { idade_max: 1 }, { local: 9999 }, { status: 'invalid' }, { data_termino: '2026-10-01' }, { horario_inicio: '25:00' }]) await json('/cursos', 'POST', { ...body, ...invalid }, 400);
        });
        await t.test('Datas, situações, contadores e listas concordam sem modificar o curso encerrado', async () => {
            await reset();
            const raw = (await db.readState()).cursos.find(c => c.id === 5);
            const course = (await json('/cursos?id=5'))[0];
            assert.equal(course.data_inicio, '12/07/2026'); assert.equal(course.data_inicio_iso, '2026-07-12');
            assert.equal(course.data_termino, '30/09/2026'); assert.equal(course.situacao, 'encerrado');
            assert.equal(course.aceita_inscricoes, false);
            assert.equal((await json('/api/cursos-public')).some(c => c.id === 5), false);
            assert.equal((await json('/api/cursos-public/5')).situacao, 'encerrado');
            assert.equal((await json('/api/cursos-public/5/vagas')).aceita_inscricoes, false);
            assert.equal((await json('/api/admin/stats')).ativos, 2);
            const monitor = await json('/api/admin/cursos-stats');
            assert.equal(monitor.find(c => c.id === 5).situacao, course.situacao);
            assert.equal(monitor.reduce((n, c) => n + c.total_inscritos, 0), (await json('/api/admin/stats')).inscritos);
            assert.deepEqual((await db.readState()).cursos.find(c => c.id === 5), raw);
        });
        await t.test('Escolha única de publicação preserva histórico e rejeita combinações confusas', async () => {
            await reset();
            const body = { nome: 'Curso com escolha simples', curso: 4, categoria_id: 4, local: 12, modalidade: 1, idade_min: 7, idade_max: 71, vagas: 30, data_inicio: '2026-07-12', data_termino: '2026-09-30', status: 'ativo', publicacao_modo: 'manter' };
            await json('/cursos/5', 'PUT', body);
            assert.equal((await json('/cursos?id=5'))[0].situacao, 'encerrado');
            await json('/cursos/5', 'PUT', { ...body, publicacao_modo: 'agora' }, 400);
            const renewed = { ...body, data_inicio: '2026-11-01', data_termino: '2026-12-01', publicacao_modo: 'agora' };
            await json('/cursos/5', 'PUT', renewed);
            assert.equal((await json('/api/cursos-public/5')).aceita_inscricoes, true);
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'arquivado', status: 'arquivado' });
            await json('/api/cursos-public/5', 'GET', undefined, 404);
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'espera', status: 'esgotado' });
            assert.equal((await json('/api/cursos-public/5')).situacao, 'esgotado');
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'agora', status: 'arquivado' }, 400);
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'agendada', data_publicacao: '2026-10-01T09:00:00-03:00' }, 400);
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'agendada', data_publicacao: null }, 400);
            await json('/cursos/5', 'PUT', { ...renewed, publicacao_modo: 'agora', data_publicacao: '2026-11-01T09:00:00-03:00' }, 400);
            await reset();
        });
        await t.test('Lista, ficha por CPF e erros de turma inexistente', async () => {
            const list = await json('/inscritos/1'); assert.equal(list.length, 2); assert.match(list[0].nome, /D'Ávila/);
            const record = await json('/api/admin/aluno/completo/529.982.247-25'); assert.equal(record.historico.length, 1); assert.equal(record.aluno.aceitou_aviso_lgpd, true);
            await json('/inscritos/999999', 'GET', undefined, 404);
        });
        await t.test('Publicação agendada aparece automaticamente no horário de Brasília', async () => {
            const body = { nome: 'Curso agendado', curso: 4, categoria_id: 4, local: 12, modalidade: 1, idade_min: 7, idade_max: 71, vagas: 3, data_publicacao: '2099-11-01T09:00:00-03:00' };
            const { id } = await json('/cursos', 'POST', body);
            assert.equal((await json(`/cursos?id=${id}`))[0].data_publicacao, '2099-11-01T12:00:00.000Z');
            await json(`/api/cursos-public/${id}`, 'GET', undefined, 404);
            assert.equal((await json('/api/cursos-public')).some(c => c.id === id), false);
            await json('/api/interessados', 'POST', { nome: 'Pessoa teste', perfil: 'Beleza', email: 'scheduled@example.invalid', curso_id: id, autoriza_contato: true }, 404);
            const clock = t.mock.method(Date, 'now', () => Date.parse('2099-11-01T12:00:00.000Z'));
            try {
                assert.equal((await json(`/api/cursos-public/${id}`)).nome, 'Curso agendado');
                assert.equal((await json('/api/cursos-public')).some(c => c.id === id), true);
            } finally { clock.mock.restore(); }
            await json('/cursos', 'POST', { ...body, data_publicacao: 'invalid' }, 400);
        });
        await t.test('Confirmação idempotente, bloqueio de suplente e consistência de matrícula', async () => {
            assert.equal((await json('/api/inscricoes/1/confirmar', 'PUT')).status, 'ok');
            const timestamp = (await db.readState()).preInscricoes[0].matricula_confirmada_em;
            assert.equal((await json('/api/inscricoes/1/confirmar', 'PUT')).status, 'ja-confirmada');
            assert.equal((await db.readState()).preInscricoes[0].matricula_confirmada_em, timestamp);
            await json('/api/inscricoes/2/confirmar', 'PUT', undefined, 409);
            await json('/api/inscricoes/99999/confirmar', 'PUT', undefined, 404);
        });
        await t.test('Status oferecidos no painel, normalização, capacidade e certificado', async () => {
            await reset();
            await json('/api/inscricoes/1/status-final', 'PUT', { status: 'certificado_emitido' }, 409);
            for (const status of ['titular', 'suplente', 'inscrito', 'matriculado', 'desistente', 'não compareceu', 'não concluído', 'concluído', 'certificado emitido']) {
                await json('/api/inscricoes/1/status-final', 'PUT', { status });
            }
            let row = (await db.readState()).preInscricoes[0]; assert.equal(row.status, 'certificado_emitido'); assert.equal(row.situacao_final, 'concluido');
            await json('/api/inscricoes/1/status-final', 'PUT', { status: 'unknown' }, 400);
            await reset(); await db.mutate(s => { s.cursos[0].vagas = 1; });
            await json('/api/inscricoes/2/status-final', 'PUT', { status: 'titular' }, 409);
            await json('/api/inscricoes/1/status-final', 'PUT', { status: 'desistente' });
            await json('/api/inscricoes/2/status-final', 'PUT', { status: 'titular' });
            await json('/api/inscricoes/1/status-final', 'PUT', { status: 'matriculado' }, 409);
            assert.equal((await json('/api/cursos-public/1/vagas')).vagas_disponiveis, 0);
        });
        await t.test('Remover inscrição libera vaga uma vez e preserva histórico e arquivamento', async () => {
            await reset(); await db.mutate(s => { s.cursos[0].status = 'arquivado'; });
            await json('/api/inscricoes/1', 'DELETE'); await json('/api/inscricoes/1', 'DELETE');
            assert.equal((await json('/inscritos/1')).length, 1);
            const state = await db.readState(); assert.equal(state.cursos[0].status, 'arquivado'); assert.equal(state.cursos[0].vagas, 2);
            assert.equal((await json('/api/admin/aluno/completo/52998224725')).historico[0].situacao_final, 'cancelado');
            assert.equal((await json('/api/admin/stats')).inscritos, 1);
            await json('/api/inscricoes/1/confirmar', 'PUT', undefined, 409);
        });
        await t.test('Configurações persistem e rejeitam limites inválidos', async () => {
            await json('/api/admin/configuracoes', 'PUT', { limite_inscricoes_semestre: 3, prazo_confirmacao_horas: 72 });
            assert.equal((await json('/api/admin/configuracoes')).prazo_confirmacao_horas, 72);
            assert.equal((await json('/api/configuracoes-public')).limite_inscricoes_semestre, 3);
            await json('/api/admin/configuracoes', 'PUT', { limite_inscricoes_semestre: 0, prazo_confirmacao_horas: 169 }, 400);
        });
        await t.test('Relatórios filtram dados, reconhecem datas e exportam planilha válida', async () => {
            await reset(); await json('/api/inscricoes/1/status-final', 'PUT', { status: 'concluido' });
            const report = await json('/api/admin/relatorios-stats?curso_id=1'); assert.equal(report.kpis.total, 2); assert.equal(report.kpis.concluidos, 1); assert.equal(report.faixa_etaria.some(g => g.label === 'Não informada'), false);
            assert.equal((await json('/api/admin/relatorios-stats?genero=Feminino&bairro=centro&data_inicio=2026-10-01&data_fim=2026-10-01')).kpis.total, 1);
            assert.equal((await json('/api/admin/relatorios-stats?curso_id=999')).kpis.total, 0);
            const response = await request('/api/admin/exportar-excel?genero=Feminino');
            assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /spreadsheet/);
            const wb = XLSX.read(Buffer.from(await response.arrayBuffer())); const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            assert.equal(rows.length, 1); assert.equal(rows[0].cpf, '52998224725');
            await db.mutate(s => { s.preInscricoes[0].criado_em = '2026-10-01T02:00:00Z'; });
            assert.equal((await json('/api/admin/relatorios-stats?data_inicio=2026-09-30&data_fim=2026-09-30')).kpis.total, 1);
            assert.equal((await json('/api/admin/relatorios-stats?data_inicio=2026-10-01&data_fim=2026-10-01')).kpis.total, 0);
        });
        await t.test('FAQ: criação, edição, ordem, exclusão e validação', async () => {
            const { id } = await json('/api/admin/faq', 'POST', { pergunta: 'Teste?', resposta: 'Resposta de teste', ordem: 0 });
            await json(`/api/admin/faq/${id}`, 'PUT', { pergunta: 'Editada?', resposta: 'Nova resposta', ordem: 0 });
            assert.equal((await json('/api/faq')).find(f => f.id === id).resposta, 'Nova resposta');
            await json('/api/admin/faq', 'POST', { pergunta: ' ', resposta: '', ordem: -1 }, 400);
            await json(`/api/admin/faq/${id}`, 'DELETE'); await json(`/api/admin/faq/${id}`, 'DELETE', undefined, 404);
        });
        await t.test('Interessados: alteração, filtros do relatório e exportação', async () => {
            for (const status of ['contatado', 'enviado', 'matriculado', 'desinteressado', 'aguardando']) {
                await json('/api/interessados/1/status', 'PUT', { status });
                assert.equal((await json('/api/interessados'))[0].status, status);
            }
            await json('/api/interessados/1/status', 'PUT', { status: 'unknown' }, 400);
            assert.equal((await json('/api/admin/stats')).leads, 1);
        });
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}
test('Painel administrativo: operações, validação, vagas, relatórios e FAQ', t => exercise(createLocalDb(adminFixture()), t));
test('Firebase real: todos os fluxos administrativos em área isolada', { skip: process.env.TEST_FIREBASE !== 'true' }, async t => {
    require('dotenv').config({ path: '.env.local', quiet: true });
    const { createLazyFirebaseDb } = require('../server/firebase-db');
    const dataPath = `qualificaVix/testing/${require('crypto').randomUUID()}`;
    try { await exercise(createLazyFirebaseDb({ dataPath }), t); }
    finally {
        const { getDatabase } = require('firebase-admin/database');
        const { getApp, deleteApp } = require('firebase-admin/app');
        const app = getApp('qualifica-vix-server');
        try { await getDatabase(app).ref(dataPath).remove(); }
        finally { await deleteApp(app); }
    }
});
