const { test, expect } = require('@playwright/test');
test.beforeEach(async ({ context, request, page }) => {
    await request.post('/__test/reset');
    await context.addCookies([{ name: 'qualifica_vix_admin_session', value: 'test-session', domain: '127.0.0.1', path: '/' }]);
    page.errors = [];
    page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

test('Formulário usa uma única escolha de publicação, campos grandes e informações opcionais recolhidas', async ({ page }) => {
    await page.goto('/admin/menu.html');
    await page.getByRole('button', { name: 'Novo Curso', exact: true }).click();
    const form = page.getByRole('dialog', { name: 'Novo curso', exact: true });
    await expect(form).toBeVisible();
    await expect(form.locator('#status')).toHaveCount(0);
    await expect(form.locator('#situacaoAtualCurso')).toBeHidden();
    await expect(form.locator('#publicacaoModo')).toHaveValue('agora');
    await expect(form.locator('#detalhesCursoOpcionais')).not.toHaveAttribute('open');
    expect(await form.locator('#nome').evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
    await form.locator('#publicacaoModo').selectOption('agendada');
    await expect(form.locator('#data_publicacao')).toBeVisible();
    await expect(form.locator('#data_publicacao')).toBeEnabled();
    await form.locator('#publicacaoModo').selectOption('arquivado');
    await expect(form.locator('#data_publicacao')).toBeHidden();
    await expect(form.locator('#data_publicacao')).toBeDisabled();
    await expect(form.locator('#resumoPublicacao')).toContainText('guardado, sem aparecer no site');
    await page.keyboard.press('Escape');
    await expect(form).toBeHidden();
});

test('Editar turma encerrada mostra a verdade, permite manter e orienta a renovação das datas', async ({ page }) => {
    await page.goto('/admin/menu.html');
    await page.locator('#listaCursos tr').filter({ hasText: 'Enfermagem / Saúde' }).getByRole('button', { name: 'Editar curso', exact: true }).click();
    const form = page.getByRole('dialog', { name: 'Editar curso #5', exact: true });
    await expect(form.locator('#situacaoAtualTexto')).toHaveText('Situação atual: Encerrado');
    await expect(form.locator('#situacaoAtualMotivo')).toContainText('30/09/2026');
    await expect(form.locator('#publicacaoModo')).toHaveValue('manter');
    await expect(form.locator('#resumoPublicacao')).toContainText('Depois de salvar: encerrado');
    await page.screenshot({ path: 'test-results/curso-encerrado-form.png', fullPage: true });
    await form.locator('#publicacaoModo').selectOption('agora');
    await form.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(form.locator('#erroFormularioCurso')).toContainText('último dia de aula que ainda não passou');
    await expect(form.locator('#data_termino')).toBeFocused();
    await form.locator('#data_inicio').fill('2026-11-01');
    await form.locator('#data_termino').fill('2026-12-01');
    await expect(form.locator('#resumoPublicacao')).toContainText('inscrições abertas');
    await form.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(form).toBeHidden();
    const course = await (await page.request.get('/api/cursos-public/5')).json();
    expect(course.aceita_inscricoes).toBe(true); expect(course.data_termino).toBe('01/12/2026');
});

test('Editar curso em lista de espera mantém essa escolha ao salvar outros dados', async ({ page }) => {
    expect((await page.request.put('/cursos/esgotar/1')).status()).toBe(200);
    await page.goto('/admin/menu.html');
    await page.locator('#listaCursos tr').filter({ hasText: 'Turma de teste' }).getByRole('button', { name: 'Editar curso', exact: true }).click();
    await expect(page.locator('#situacaoAtualTexto')).toHaveText('Situação atual: Lista de espera');
    await expect(page.locator('#publicacaoModo')).toHaveValue('manter');
    await page.locator('#nome').fill('Turma editada sem reabrir');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(page.locator('#modalNovoCurso')).not.toHaveClass(/open/);
    expect((await (await page.request.get('/api/cursos-public/1')).json()).status).toBe('esgotado');
});

test('Agendamento orienta sobre data futura e anterior ao término', async ({ page }) => {
    await page.goto('/admin/menu.html');
    await page.locator('#listaCursos tr').filter({ hasText: 'Turma de teste' }).getByRole('button', { name: 'Editar curso', exact: true }).click();
    await page.locator('#publicacaoModo').selectOption('agendada');
    await page.locator('#data_publicacao').fill('2026-10-01T09:00');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(page.locator('#erroFormularioCurso')).toContainText('dia e horário futuros');
    await page.locator('#data_publicacao').fill('2099-12-01T09:00');
    await page.getByRole('button', { name: 'Salvar Curso', exact: true }).click();
    await expect(page.locator('#erroFormularioCurso')).toContainText('antes de terminar');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#data_publicacao').fill('2026-11-01T09:00');
    await page.locator('#publicacaoModo').scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'test-results/curso-form-mobile.png', fullPage: true });
    expect(await page.locator('#modalNovoCurso .modal-content').evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
});

test('Título legível sem espaços artificiais e Prefeitura menor no desktop e no celular', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    for (const [width, height] of [[1920, 1080], [1366, 768], [390, 844]]) {
        await page.setViewportSize({ width, height });
        await expect(page.locator('.hero-title-main')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const sizes = await page.locator('.hero-title').evaluate(node => {
            const main = node.querySelector('.hero-title-main'), city = node.querySelector('.hero-title-city');
            return { main: parseFloat(getComputedStyle(main).fontSize), city: parseFloat(getComputedStyle(city).fontSize), align: getComputedStyle(main).textAlign, titleRight: node.getBoundingClientRect().right, viewport: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth };
        });
        expect(sizes.city).toBeLessThan(sizes.main); expect(sizes.align).toBe('left');
        expect(sizes.titleRight).toBeLessThanOrEqual(sizes.viewport); expect(sizes.overflow).toBe(false);
        await page.screenshot({ path: `test-results/titulo-${width}.png`, fullPage: false });
    }
});
