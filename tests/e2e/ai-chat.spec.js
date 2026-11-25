const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page, request }) => {
    await request.post('/__test/reset');
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('Vitoruga envia texto livre e histórico, cria botão e Escape devolve o foco', async ({ page }) => {
    const bodies = [];
    await page.route('**/chat', async route => {
        bodies.push(route.request().postDataJSON());
        await route.fulfill({ json: { reply: 'Veja Informática: /pre-inscricao/2', fonte: 'ia' } });
    });
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Abrir chatbot do Vitoruga' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Conversa com Vitoruga' });
    const input = dialog.getByRole('textbox');
    await expect(dialog).toContainText('Eu sou o');
    await input.fill('como me inscrever em informátca?'); await input.press('Enter');
    await expect(dialog).toContainText('Veja Informática');
    await expect(dialog.getByRole('button', { name: /inscri/i }).first()).toBeVisible();
    await expect(input).toBeEnabled();
    await input.fill('e o horario?'); await input.press('Enter');
    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[1].history.map(m => m.role)).toEqual(['user', 'assistant']);
    expect(bodies[1].history[0].content).toContain('informátca');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
});

test('Dúvida na etapa CPF mantém progresso e não cria balão vazio', async ({ page }) => {
    const bodies = [];
    await page.route('**/chat', async route => {
        bodies.push(route.request().postDataJSON());
        await route.fulfill({ json: { reply: 'Os cursos são gratuitos e têm certificado. /pre-inscricao/2', fonte: 'ia' } });
    });
    await page.goto('/pre-inscricao/2');
    const input = page.getByRole('textbox', { name: 'CPF', exact: true });
    await expect(input).toBeEnabled();
    await expect(input).toHaveAttribute('type', 'text');
    await expect(input).toHaveAttribute('inputmode', 'numeric');
    await expect(page.locator('.registration-shell .self-end')).toHaveCount(0);
    await input.fill('por que precisa do cpf?'); await input.press('Enter');
    await expect(page.locator('.registration-shell')).toContainText('Os cursos são gratuitos');
    await expect(input).toBeEnabled();
    await input.fill('tem certificado?'); await input.press('Enter');
    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[0].contexto).toMatchObject({ modo: 'pre-inscricao', cursoId: '2', etapa: 'cpf', opcional: false });
    expect(bodies[0].contexto.pergunta_etapa).not.toContain('<strong>');
    await expect(page.getByRole('link', { name: 'Ver pré-inscrição', exact: true })).toHaveCount(0);
    expect(JSON.stringify(bodies[1].history)).toContain('por que precisa');
    await expect(input).toBeEnabled();
    await input.fill('52998224725'); await input.press('Enter');
    await expect(page.getByText('Encontramos um cadastro existente', { exact: false })).toBeVisible();
    expect(bodies.length).toBe(2);
});

test('Telefone alternativo: dúvida envia contexto; nao pula sem chamar chat', async ({ page }) => {
    const bodies = [];
    await page.route('**/api/cidadaos/localizar', route => route.fulfill({ json: { localizou: false } }));
    await page.route('**/api/cep/*', route => route.fulfill({ json: {
        localidade: 'Vitória', uf: 'ES', logradouro: 'Rua de teste', bairro: 'Centro',
    } }));
    await page.route('**/chat', async route => {
        bodies.push(route.request().postDataJSON());
        await route.fulfill({ json: { reply: 'É um contato extra. Se não tiver, toque em Pular.', fonte: 'ia' } });
    });
    await page.goto('/pre-inscricao/2');
    const answer = page.getByRole('textbox', { name: 'Sua resposta', exact: true });
    const submit = async (input, value) => {
        await expect(input).toBeEnabled();
        await input.fill(value); await input.press('Enter');
    };
    await submit(page.getByRole('textbox', { name: 'CPF', exact: true }), '52998224725');
    await submit(page.getByRole('textbox', { name: 'CEP de residência' }), '29010000');
    for (const value of ['10', 'Pessoa de Teste', '1234567', 'teste@example.invalid', 'teste@example.invalid', '27999991234']) {
        await submit(answer, value);
    }
    await expect(page.getByRole('button', { name: 'Pular', exact: true })).toBeVisible();
    await submit(answer, 'para que serve esse telefone?');
    await expect(answer).toBeEnabled();
    expect(bodies).toHaveLength(1);
    expect(bodies[0].contexto).toMatchObject({ modo: 'pre-inscricao', cursoId: '2',
        etapa: 'telefone_alternativo', opcional: true });
    expect(JSON.stringify(bodies[0])).not.toMatch(/52998224725|teste@example.invalid|27999991234/);
    await submit(answer, 'nao');
    await expect(answer).toHaveAttribute('placeholder', 'DD/MM/AAAA');
    await expect(answer).toBeEnabled();
    await expect(page.locator('.registration-shell .self-end').last()).toContainText('nao');
    expect(bodies).toHaveLength(1);
});

test('Segunda inscrição exige código, valida sessão e oferece autopreenchimento', async ({ page }) => {
    let verified = false;
    await page.route('**/api/cidadaos/enviar-codigo', route => route.fulfill({ json: { sucesso: true } }));
    await page.route('**/api/cidadaos/validar-codigo', async route => {
        expect(route.request().postDataJSON().codigo).toBe('123456'); verified = true;
        await route.fulfill({ json: { sessionToken: 'sessao-ficticia' } });
    });
    await page.route('**/api/cidadaos/me', async route => {
        expect(verified).toBe(true);
        expect(route.request().headers().authorization).toBe('Bearer sessao-ficticia');
        await route.fulfill({ json: { data: { cpf: '52998224725', nome: 'Pessoa de teste', email: 'teste@example.invalid', cep: '29010000' }, historico: [] } });
    });
    await page.goto('/pre-inscricao/2');
    const cpf = page.getByRole('textbox', { name: 'CPF', exact: true });
    await expect(cpf).toBeEnabled(); await cpf.fill('52998224725'); await cpf.press('Enter');
    await page.getByRole('button', { name: /Enviar.*código/i }).click();
    await page.getByRole('textbox', { name: 'Código de verificação' }).fill('123456');
    await page.getByRole('button', { name: /Validar Código e Acessar/i }).click();
    await expect(page.getByRole('button', { name: 'Auto-preencher', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Auto-preencher', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'CEP de residência' })).toHaveValue('29010000');
});

test('Sem SMTP explica indisponibilidade e permite preencher manualmente', async ({ page }) => {
    await page.goto('/pre-inscricao/2');
    const cpf = page.getByRole('textbox', { name: 'CPF', exact: true });
    await expect(cpf).toBeEnabled(); await cpf.fill('52998224725'); await cpf.press('Enter');
    await page.getByRole('button', { name: /Enviar.*código/i }).click();
    await expect(page.getByText(/O envio de código por e-mail está indisponível/)).toBeVisible();
    await page.getByRole('button', { name: /preencher.*manual|do zero/i }).click();
    await expect(page.getByRole('textbox', { name: 'CEP de residência' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Auto-preencher', exact: true })).toHaveCount(0);
});
