const { test, expect } = require('@playwright/test');

test('Catálogo mobile permite buscar, filtrar e abrir detalhes sem transbordar', async ({ page, request }) => {
    await request.post('/__test/reset');
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/');
    await expect(page.getByText('Última vaga', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('searchbox').fill('costura');
    await expect(page.locator('#cursos-list-section')).toContainText('1 curso encontrado');
    await page.getByRole('button', { name: 'Limpar', exact: true }).click();
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
    const filters = page.getByRole('dialog', { name: 'Filtros' });
    await filters.getByRole('button', { name: 'Manhã', exact: true }).click();
    await filters.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(filters).toBeHidden();
    await expect(page.locator('#cursos-list-section')).toContainText('1 curso encontrado');
    await page.getByRole('button', { name: 'Ver detalhes do curso', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
});

test('Falha do catálogo informa indisponibilidade sem anunciar ausência de turmas', async ({ page }) => {
    await page.route('**/api/cursos-public', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar os cursos');
    await expect(page.getByText('Nenhum curso encontrado', { exact: true })).toHaveCount(0);
});
test('Movimento respeita preferência reduzida e mantém navegação mobile acessível', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const title = page.locator('#hero-title');
    await expect(title).toBeVisible();
    expect(await title.locator('.hero-line > span').first().evaluate(node => getComputedStyle(node).animationName)).toBe('none');
    await expect(page.locator('.photo-curtain')).toHaveCount(0);
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Menu', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Menu', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
