const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calendarDate, courseState, localDay } = require('../server/course-state');
const { createLocalState } = require('../server/local-db');
const { enroll } = require('../server/citizen-service');

test('Datas ISO e brasileiras preservam o dia e rejeitam datas inexistentes', () => {
    for (const [input, output] of [['2026-07-12', '2026-07-12'], ['12/07/2026', '2026-07-12'], ['2026-07-12T00:00:00.000Z', '2026-07-12'], ['2028-02-29', '2028-02-29']]) assert.equal(calendarDate(input), output);
    for (const input of ['2026-02-29', '2026-02-30', '2026-13-01', '31/04/2026', 'amanhã']) assert.equal(calendarDate(input), null);
});

test('Turma permanece aberta durante todo o último dia em Brasília e mantém o cadastro', () => {
    const course = { status: 'ativo', data_inicio: '2026-07-12', data_termino: '30/09/2026', vagas_disponiveis: 4 };
    assert.equal(localDay('2026-10-01T02:59:59Z'), '2026-09-30');
    assert.equal(courseState(course, Date.parse('2026-10-01T02:59:59Z')).situacao, 'aberto');
    assert.equal(courseState(course, Date.parse('2026-10-01T03:00:00Z')).situacao, 'encerrado');
    assert.equal(courseState(course, Date.parse('2026-10-07T12:00:00Z')).aceita_inscricoes, false);
    assert.equal(course.status, 'ativo'); assert.equal(course.data_termino, '30/09/2026');
});

test('Publicação e janelas de inscrição obedecem ao instante ou dia cadastrados', () => {
    const course = { status: 'ativo', data_publicacao: '2026-10-07T09:00:00-03:00', vagas_disponiveis: 4 };
    assert.equal(courseState(course, Date.parse('2026-10-07T11:59:59Z')).situacao, 'agendado');
    assert.equal(courseState(course, Date.parse('2026-10-07T12:00:00Z')).aceita_inscricoes, true);
    const day = Date.parse('2026-10-07T12:00:00Z');
    assert.equal(courseState({ ...course, data_abertura_inscricao: '2026-10-08' }, day).situacao, 'inscricoes_futuras');
    assert.equal(courseState({ ...course, data_encerramento_inscricao: '2026-10-06' }, day).situacao, 'inscricoes_encerradas');
    assert.equal(courseState({ ...course, data_encerramento_inscricao: '2026-10-07T12:00:00Z' }, day).aceita_inscricoes, false);
    assert.equal(courseState({ ...course, vagas_disponiveis: 0 }, day).situacao, 'esgotado');
    assert.equal(courseState({ ...course, status: 'arquivado' }, day).aceita_inscricoes, false);
});

test('Inscrição em curso encerrado é recusada sem criar cadastro ou reserva', () => {
    const state = createLocalState();
    const body = { cpf: '52998224725', nome: 'Pessoa do teste isolado', email: 'teste@example.invalid', telefone: '27999999999', rg: '123456', cep: '29010000', municipio: 'Vitória', uf: 'ES', data_nascimento: '01/01/1990', curso_id: 5, aceitou_termos_ciencia: true, aceitou_aviso_lgpd: true };
    assert.throws(() => enroll(state, body, { headers: {} }, Date.parse('2026-10-07T12:00:00Z')), /encerrado/);
    assert.equal(state.usuarios.length, 0); assert.equal(state.preInscricoes.length, 0);
});
