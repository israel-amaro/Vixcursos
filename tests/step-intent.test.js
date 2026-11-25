const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveStepIntent, isOptionalStep } = require('../src/lib/stepIntent.ts');

const phone = { pergunta: 'Telefone Alternativo? (Opcional — clique em Pular)', mascara: 'telefone' };

test('etapa opcional: negativas são Pular antes de qualquer chamada ao chat', () => {
    for (const text of ['nao', 'não', 'N', 'NAO TENHO!', 'não quero', 'nenhum', 'nenhuma', 'sem',
        'pular', 'pula', 'depois', 'nada', 'Não precisa.']) {
        for (const step of [phone, { pergunta: 'Acessibilidade (ou clique em Pular)' },
            { pergunta: 'Acompanhante?', opcional: true }]) {
            const intent = resolveStepIntent(text, step);
            assert.deepEqual(intent, { kind: 'skip', value: '' });
            // O frontend chama /chat exclusivamente para kind === question.
            assert.notEqual(intent.kind, 'question');
        }
    }
});

test('opções: corresponde sem acentos, pontuação e aceita sim/não abreviados', () => {
    const step = { pergunta: 'Autoriza?', opcoes: [
        { texto: 'Sim, autorizo!', valor: 'sim' }, { texto: 'Não autorizo', valor: 'nao' },
    ] };
    for (const text of ['sim', 'S', 'SIM, AUTORIZO!']) {
        assert.deepEqual(resolveStepIntent(text, step), { kind: 'option', value: 'sim' });
    }
    for (const text of ['não', 'n', 'nao autorizo']) {
        assert.deepEqual(resolveStepIntent(text, step), { kind: 'option', value: 'nao' });
    }
    assert.deepEqual(resolveStepIntent('indigena', { pergunta: 'Raça/cor?', opcoes: [
        { texto: 'Indígena', valor: 'Indígena' },
    ] }), { kind: 'option', value: 'Indígena' });
});

test('dúvidas permanecem dúvidas; campo obrigatório não aceita Pular como intenção', () => {
    for (const text of ['não entendi', 'não tenho, é obrigatório?', 'para que serve?', 'preciso informar telefone']) {
        assert.equal(resolveStepIntent(text, phone).kind, 'question');
    }
    assert.equal(resolveStepIntent('(27) 99999-1234', phone).kind, 'answer');
    assert.equal(resolveStepIntent('texto inválido', phone).kind, 'answer');
    const required = { pergunta: 'Telefone principal?', mascara: 'telefone' };
    assert.equal(isOptionalStep(required), false);
    assert.equal(resolveStepIntent('nao', required).kind, 'answer');
});
