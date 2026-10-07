const { createLocalDb, createLocalState } = require('../../server/local-db');

function adminFixture() {
    const state = createLocalState();
    Object.assign(state.cursos[0], { nome: 'Turma de teste', vagas: 2, data_inicio: '2026-11-01', data_termino: '2026-12-01' });
    Object.assign(state.cursos[1], { data_inicio: '2026-11-01', data_termino: '2026-12-01' });
    const person = { cpf: '52998224725', nome: `Ana "Teste" D'Ávila <img src=x onerror=alert(1)>`, email: 'ana@example.invalid', telefone: '27999999999', bairro: 'Centro', municipio: 'Vitória', data_nascimento: '1995-04-15', genero: 'Feminino', raca_cor: 'Parda', escolaridade: 'Ensino médio', possui_necessidade_especial: 'nao' };
    state.usuarios = [{ id: 1, ...person }];
    state.preInscricoes = [
        { id: 1, ...person, curso_id: 1, status: 'pendente_validacao', situacao_final: 'inscrito', status_inscricao: 'titular', matricula_confirmada: 0, criado_em: '2026-10-01T12:00:00Z', aceitou_aviso_lgpd: true },
        { id: 2, cpf: '11144477735', nome: 'Bruno Teste', curso_id: 1, status: 'pendente_validacao', situacao_final: 'inscrito', status_inscricao: 'suplente', matricula_confirmada: 0, criado_em: '2026-10-02T12:00:00Z', genero: 'Masculino', bairro: 'Jardim Camburi', data_nascimento: '15/04/2008' },
    ];
    state.interessados = [{ id: 1, nome: 'Carla Teste', email: 'carla@example.invalid', whatsapp: '27988888888', perfil_curso: 'Beleza', curso_id: 1, origem: 'site_curso', status: 'aguardando', criado_em: '2026-10-01T12:00:00Z' }];
    return state;
}
const identity = { uid: 'test-admin', email: 'admin@example.invalid', auth_time: Math.floor(Date.now() / 1000) };
const adminAuth = { allowedUids: ['test-admin'], secure: false, getAuth: () => ({
    verifyIdToken: async token => { if (token !== 'test-id-token') throw new Error('Invalid test token'); return identity; },
    createSessionCookie: async () => 'test-session',
    verifySessionCookie: async token => { if (token !== 'test-session') throw new Error('Invalid test session'); return identity; },
}) };
const cookie = 'qualifica_vix_admin_session=test-session';
function disableNotifications() {
    Object.assign(process.env, { EMAIL_USER: '', EMAIL_PASS: '', EMAIL_FROM: '', TWILIO_ACCOUNT_SID: '', TWILIO_AUTH_TOKEN: '' });
}
module.exports = { adminFixture, adminAuth, cookie, disableNotifications, createLocalDb };
