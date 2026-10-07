const { test, expect } = require('@playwright/test');
const { adminFixture } = require('../helpers/admin-fixture');
const student = adminFixture().preInscricoes[0].nome;

test.beforeEach(async ({ context, request, page }) => {
    await request.post('/__test/reset');
    await context.addCookies([{ name: 'qualifica_vix_admin_session', value: 'test-session', domain: '127.0.0.1', path: '/' }]);
    page.errors = [];
    page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(page.errors).toEqual([]); });

test('Site sem link administrativo; /admin e páginas privadas vão ao login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('a[href*="/admin"]')).toHaveCount(0);
    for (const path of ['/admin', '/admin/', '/admin/menu.html', '/admin/inscritos.html']) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/admin\/login.html$/);
        await expect(page.locator('#loginForm')).toBeVisible();
        await expect(page.locator('body')).not.toContainText(/Firebase|Authentication|Vercel/);
    }
});

test('Login mostra erro compreensível e permite tentar novamente', async ({ page, context }) => {
    await context.clearCookies();
    await page.route('**/identitytoolkit.googleapis.com/**', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS' } }) }));
    await page.goto('/admin/login.html');
    await page.locator('#username').fill('admin@example.invalid');
    await page.locator('#password').fill('invalid-password');
    await page.locator('#submitBtn').click();
    await expect(page.locator('#statusMsg')).toContainText('Confira o e-mail e a senha');
    await expect(page.locator('#password')).toHaveValue('');
    await expect(page.locator('#submitBtn')).toBeEnabled();
});

test('Dashboard abre diretamente inscritos da turma e permite voltar e recarregar', async ({ page }) => {
    await page.goto('/admin/menu.html');
    const row = page.locator('#listaCursos tr').filter({ hasText: 'Turma de teste' });
    await row.getByRole('link', { name: 'Ver inscritos', exact: true }).click();
    await expect(page).toHaveURL(/inscritos.html\?curso=1$/);
    await expect(page.locator('#telaAlunos')).toBeVisible();
    await expect(page.locator('#tituloCursoDetalhe')).toHaveText('#1 — Turma de teste');
    await expect(page.locator('#tabelaAlunosBody')).toContainText(student);
    await page.reload();
    await expect(page.locator('#telaAlunos')).toBeVisible();
    await page.getByRole('button', { name: 'Todas as inscrições', exact: true }).click();
    await expect(page).toHaveURL(/inscritos.html$/);
    await expect(page.locator('#tituloCursoDetalhe')).toHaveText('Todas as inscrições');
    await expect(page.locator('#tabelaCursosBody')).toHaveCount(0);
    await page.locator('#filtroTurma').selectOption('1');
    await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(2);
});

test('Turma inexistente avisa e mantém seleção útil', async ({ page }) => {
    await page.goto('/admin/inscritos.html?curso=999999');
    await expect(page.locator('#tituloPaginaInscritos')).toHaveText('Turma não encontrada');
    await expect(page.locator('#tabelaAlunosBody')).toContainText('Turma não encontrada');
    await expect(page).toHaveURL(/inscritos.html\?curso=999999$/);
    await page.getByRole('button', { name: 'Todas as inscrições' }).click();
    await expect(page.locator('#tabelaAlunosBody')).toContainText(student);
});

test('Novo curso, edição, banner público e esgotamento por cliques', async ({ page }) => {
    await page.goto('/admin/menu.html');
    await page.getByRole('button', { name: 'Novo Curso', exact: true }).click();
    await expect(page.locator('#curso option')).not.toHaveCount(0);
    await page.locator('#curso').selectOption('4');
    await page.locator('#nome').fill('Curso criado no navegador');
    await page.locator('#local').selectOption('12');
    await page.locator('#modalidade').selectOption('1');
    await page.locator('#vagas').fill('8');
    await page.locator('#idade_min').selectOption('7');
    await page.locator('#idade_max').selectOption('71');
    await page.locator('#data_inicio').fill('2026-11-01');
    await page.locator('#data_termino').fill('2026-12-01');
    await page.locator('#horario_inicio').fill('08:00');
    await page.locator('#horario_termino').fill('12:00');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    const row = page.locator('#listaCursos tr').filter({ hasText: 'Curso criado no navegador' });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Editar curso', exact: true }).click();
    await expect(page.locator('#vagas')).toHaveValue('8');
    await expect(page.locator('#data_inicio')).toHaveValue('2026-11-01');
    await page.locator('#nome').fill('Curso editado no navegador');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    const edited = page.locator('#listaCursos tr').filter({ hasText: 'Curso editado no navegador' });
    await expect(edited).toBeVisible();
    const href = await edited.getByRole('link', { name: 'Ver no site' }).getAttribute('href');
    await edited.getByRole('button', { name: 'Esgotar vagas' }).click();
    await page.getByRole('button', { name: 'Sim, esgotar', exact: true }).click();
    await expect(edited).toContainText('Lista de espera');
    await page.goto(href);
    await expect(page.locator('body')).toContainText('Curso editado no navegador');
});

test('Configurações podem ser salvas e reabertas', async ({ page }) => {
    await page.goto('/admin/menu.html');
    await page.getByRole('link', { name: 'Regras de Negócio' }).click();
    await expect(page.locator('#limite_inscricoes_semestre')).toHaveValue('4');
    await page.locator('#limite_inscricoes_semestre').fill('3');
    await page.locator('#prazo_confirmacao_horas').fill('72');
    await page.getByRole('button', { name: 'Salvar Configurações' }).click();
    await expect(page.locator('#modalConfiguracoes')).not.toHaveClass(/open/);
    await page.getByRole('link', { name: 'Regras de Negócio' }).click();
    await expect(page.locator('#limite_inscricoes_semestre')).toHaveValue('3');
    await expect(page.locator('#prazo_confirmacao_horas')).toHaveValue('72');
});

test('Ficha completa, busca por CPF, escape de texto e fechamento por teclado', async ({ page }) => {
    await page.goto('/admin/inscritos.html?curso=1');
    await page.locator('.btn-ficha').first().click();
    await expect(page.locator('#modalDetalhes')).toBeVisible();
    await expect(page.locator('#conteudoDetalhes')).toContainText(student);
    await expect(page.locator('#conteudoDetalhes')).toContainText('Turma de teste');
    await expect(page.locator('#conteudoDetalhes img[src="x"]')).toHaveCount(0);
    await expect(page.locator('#btnImprimirFicha')).toBeEnabled();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modalDetalhes')).toBeHidden();
    await page.locator('#buscaCpfInput').fill('529.982.247-25');
    await page.locator('#buscaCpfInput').press('Enter');
    await expect(page.locator('#resumoFicha')).toContainText(student);
});

test('Status salva, cancelar mantém situação e remover tira inscrição da lista', async ({ page }) => {
    await page.goto('/admin/inscritos.html?curso=1');
    const select = page.locator('.admin-status-select').first();
    await expect(select).toHaveValue('inscrito');
    await select.selectOption('matriculado');
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(select).toHaveValue('inscrito');
    await select.selectOption('matriculado');
    await page.getByRole('button', { name: 'Sim, alterar', exact: true }).click();
    await expect(select).toHaveValue('matriculado');
    await page.locator('.acoes-toggle').first().click();
    await page.getByRole('menuitem', { name: 'Excluir inscrição' }).click();
    await expect(page.locator('.admin-confirm-text')).toContainText(student);
    await page.getByRole('button', { name: 'Sim, excluir', exact: true }).click();
    await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(1);
    await expect(page.locator('#vagasCursoDetalhe')).toHaveText('2 vagas restantes');
});

test('Exportação da turma baixa arquivo Excel e PDF válidos', async ({ page }) => {
    await page.goto('/admin/inscritos.html?curso=1');
    const excel = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Excel Turma' }).click();
    const workbook = await excel; expect(workbook.suggestedFilename()).toMatch(/\.xlsx$/); expect(await workbook.failure()).toBeNull();
    const pdf = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Gerar PDF' }).click();
    const document = await pdf; expect(document.suggestedFilename()).toMatch(/\.pdf$/); expect(await document.failure()).toBeNull();
});

test('Monitoramento mostra vagas e ocupação corretas', async ({ page }) => {
    await page.goto('/admin/cursos.html');
    const row = page.locator('#tabelaCursos tr').filter({ hasText: 'Turma de teste' });
    await expect(row.locator('td').nth(2).locator('strong')).toHaveText('2');
    await expect(row.locator('td').nth(2)).toContainText('1 vagas ocupadas');
    await expect(row.locator('td').nth(3)).toHaveText('1');
    await expect(page.locator('.progresso-item').filter({ hasText: 'Turma de teste' })).toContainText('50%');
    expect(Number(await page.locator('#kpiVagas').textContent())).toBeGreaterThan(0);
});

test('Interessados: busca, filtros, alteração e gráfico', async ({ page }) => {
    await page.goto('/admin/interessados.html');
    await expect(page.locator('.tabela-admin tbody')).toContainText('Carla Teste');
    await page.locator('#buscaInteressados').fill('ninguém');
    await expect(page.locator('.tabela-admin tbody')).toContainText('Nenhum interessado encontrado');
    await page.locator('#buscaInteressados').fill('carla');
    await page.locator('[data-lead="1"]').selectOption('contatado');
    await expect(page.locator('[data-lead="1"]')).toHaveValue('contatado');
    await page.locator('#statusInteressados').selectOption('aguardando');
    await expect(page.locator('.tabela-admin tbody')).toContainText('Nenhum interessado encontrado');
    await page.locator('#statusInteressados').selectOption('contatado');
    await expect(page.locator('.tabela-admin tbody')).toContainText('Carla Teste');
    await page.evaluate(() => abrirModalGrafico());
    await expect(page.locator('#modalGrafico')).toBeVisible();
    await page.locator('#btnLinha').click();
    await page.evaluate(() => fecharModalGrafico());
});

test('Relatórios carregam gráficos e aplicam e limpam filtros', async ({ page }) => {
    await page.goto('/admin/relatorios.html');
    await expect(page.locator('#kpiTotal')).toHaveText('2');
    await expect(page.locator('#chartGenero')).toBeVisible();
    await page.locator('#filtroGenero').selectOption('Feminino');
    await page.locator('#formFiltroRelatorios').evaluate(form => form.requestSubmit());
    await expect(page.locator('#kpiTotal')).toHaveText('1');
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await expect(page.locator('#kpiTotal')).toHaveText('2');
    await page.evaluate(() => prepararRelatorio());
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#relatorioImpressao')).toBeVisible();
    await expect(page.locator('.admin-sidebar')).toBeHidden();
    await expect(page.locator('#relatorioImpressao')).toContainText('Relatório de qualificação');
    await expect(page.locator('#relatorioImpressao')).toContainText('2 inscrição(ões)');
    await page.screenshot({ path: 'test-results/relatorio-impressao.png', fullPage: true });
    await page.pdf({ path: 'test-results/relatorio-impressao.pdf', preferCSSPageSize: true, printBackground: true });
});

test('Agendamento é salvo, preservado ao editar e mantém curso oculto antes da publicação', async ({ page, request }) => {
    await page.goto('/admin/menu.html');
    const row = page.locator('#listaCursos tr').filter({ hasText: 'Turma de teste' });
    await row.getByRole('button', { name: 'Editar curso', exact: true }).click();
    await page.locator('#publicacaoModo').selectOption('agendada');
    await expect(page.locator('#data_publicacao')).toBeVisible();
    await page.locator('#data_inicio').fill('2099-11-02');
    await page.locator('#data_termino').fill('2099-12-01');
    await page.locator('#data_publicacao').fill('2099-11-01T09:00');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(row).toContainText('Agendado para 01/11/2099, 09:00');
    expect((await request.get('/api/cursos-public/1')).status()).toBe(404);
    await row.getByRole('button', { name: 'Editar curso', exact: true }).click();
    await expect(page.locator('#data_publicacao')).toHaveValue('2099-11-01T09:00');
    await page.locator('#publicacaoModo').selectOption('agora');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(row).not.toContainText('Agendado para');
    expect((await request.get('/api/cursos-public/1')).status()).toBe(200);
});

test('Interesse enviado pelo site aparece no painel e no dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Quero receber avisos de cursos' }).click();
    const dialog = page.getByRole('dialog', { name: 'Quero receber novidades' });
    await dialog.locator('[name="nome"]').fill('Pessoa do interesse no navegador');
    await dialog.locator('[name="email"]').fill('interesse@example.invalid');
    await dialog.locator('[name="perfil"]').selectOption({ label: 'Beleza' });
    await dialog.locator('[name="autoriza_contato"]').check();
    await dialog.getByRole('button', { name: 'Registrar meu interesse' }).click();
    await expect(page.getByRole('heading', { name: 'Interesse registrado!' })).toBeVisible();
    await page.goto('/admin/interessados.html');
    await expect(page.locator('.tabela-admin tbody')).toContainText('Pessoa do interesse no navegador');
    await page.goto('/admin/menu.html');
    await expect(page.locator('#kpiLeads')).toHaveText('2');
});

test('Pré-inscrição pelo formulário chega à turma, ao dashboard e ao relatório sem SMTP', async ({ page }) => {
    test.setTimeout(90000);
    await page.route('**/api/cep/29010000', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ cep: '29010-000', logradouro: 'Rua de teste', bairro: 'Centro', localidade: 'Vitória', uf: 'ES' }) }));
    await page.goto('/pre-inscricao/1');
    const answer = async (value, label = 'Sua resposta') => {
        const input = page.getByRole('textbox', { name: label, exact: true });
        await expect(input).toBeEnabled();
        await input.fill(value); await input.press('Enter');
    };
    await answer('12345678909', 'CPF');
    await answer('29010000', 'CEP de residência');
    await answer('10'); await answer('Pessoa da inscrição no navegador'); await answer('1234567');
    await answer('inscricao@example.invalid'); await answer('inscricao@example.invalid'); await answer('27999998888');
    await page.getByRole('button', { name: 'Pular', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Sua resposta', exact: true })).toHaveAttribute('placeholder', 'DD/MM/AAAA');
    await answer('01011990');
    await page.getByRole('button', { name: 'Feminino', exact: true }).click();
    await page.getByRole('button', { name: 'Parda', exact: true }).click();
    await page.getByRole('button', { name: 'Ensino Médio Completo', exact: true }).click();
    await page.getByRole('button', { name: 'Conseguir emprego', exact: true }).click();
    await page.getByRole('button', { name: 'Confirmar (Somente 1)', exact: true }).click();
    await page.getByRole('button', { name: 'Não', exact: true }).click();
    await page.getByRole('button', { name: 'Não autorizo', exact: true }).click();
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(1).check();
    await page.getByRole('button', { name: 'Finalizar Pré-Inscrição', exact: true }).click();
    await expect(page.locator('body')).toContainText('INSCRIÇÃO REALIZADA!', { timeout: 15000 });
    await page.goto('/admin/inscritos.html?curso=1');
    await expect(page.locator('#tabelaAlunosBody')).toContainText('Pessoa da inscrição no navegador');
    await expect(page.locator('#vagasCursoDetalhe')).toHaveText('0 vagas restantes');
    await page.goto('/admin/menu.html'); await expect(page.locator('#kpiInscritos')).toHaveText('3');
    await page.goto('/admin/relatorios.html'); await expect(page.locator('#kpiTotal')).toHaveText('3');
    await page.goto('/pre-inscricao/2');
    await answer('12345678909', 'CPF');
    await expect(page.getByRole('button', { name: 'Auto-preencher', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('FAQ cria, edita e exclui com confirmação funcional', async ({ page }) => {
    await page.goto('/admin/faq.html');
    await page.getByRole('button', { name: 'Novo FAQ' }).click();
    await page.locator('#pergunta').fill('Pergunta do navegador?');
    await page.locator('#resposta').fill('Resposta do navegador <script>alert(1)</script>');
    await page.getByRole('button', { name: 'Salvar FAQ' }).click();
    const row = page.locator('#tabelaFaqBody tr').filter({ hasText: 'Pergunta do navegador?' });
    await expect(row).toContainText('<script>alert(1)</script>');
    await row.getByRole('button', { name: 'Editar' }).click();
    await page.locator('#resposta').fill('Resposta editada');
    await page.getByRole('button', { name: 'Salvar FAQ' }).click();
    await expect(row).toContainText('Resposta editada');
    await row.getByRole('button', { name: 'Deletar' }).click();
    await page.getByRole('button', { name: 'Cancelar', exact: true }).last().click();
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Deletar' }).click();
    await page.getByRole('button', { name: 'Sim, deletar', exact: true }).click();
    await expect(row).toHaveCount(0);
});

test('Sessão expirada volta ao login; sair encerra acesso', async ({ page, context }) => {
    await page.goto('/admin/menu.html');
    await page.getByRole('button', { name: 'Sair do painel' }).click();
    await expect(page).toHaveURL(/login.html$/);
    await page.goto('/admin/menu.html');
    await expect(page).toHaveURL(/login.html$/);
    await context.addCookies([{ name: 'qualifica_vix_admin_session', value: 'test-session', domain: '127.0.0.1', path: '/' }]);
    await page.goto('/admin/inscritos.html?curso=1');
    await expect(page.locator('#telaAlunos')).toBeVisible();
    await context.clearCookies();
    await page.locator('.btn-ficha').first().click();
    await expect(page).toHaveURL(/login.html$/);
});

test('Painel em tela pequena mantém navegação e lista utilizáveis', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/admin/menu.html');
    await page.locator('#listaCursos tr').filter({ hasText: 'Turma de teste' }).getByRole('link', { name: 'Ver inscritos', exact: true }).click();
    await expect(page.locator('#telaAlunos')).toBeVisible();
    await page.locator('.btn-ficha').first().click();
    await expect(page.locator('#conteudoDetalhes')).toContainText(student);
    await page.getByRole('button', { name: 'Fechar Ficha', exact: true }).click();
    await expect(page.locator('#modalDetalhes')).toBeHidden();
});
