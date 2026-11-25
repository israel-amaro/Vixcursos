const { test, expect } = require('@playwright/test');
test.beforeEach(async ({ context, request, page }) => {
    await request.post('/__test/reset');
    await context.addCookies([{ name: 'qualifica_vix_admin_session', value: 'test-session', domain: '127.0.0.1', path: '/' }]);
    page.errors = [];
    page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

test('Header centraliza a navegação e preserva o espaço dos logos e ações', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.site-header');
    const nav = header.getByRole('navigation', { name: 'Principal', exact: true });
    const brand = header.getByRole('link', { name: 'Qualifica Vix, página inicial' });
    const action = header.getByRole('button', { name: 'Encontrar curso', exact: true });

    for (const width of [1200, 1280, 1366, 1440, 1920]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(nav).toBeVisible();
        await expect(action).toBeVisible();
        const navBox = await nav.boundingBox();
        const brandBox = await brand.boundingBox();
        const actionBox = await action.boundingBox();
        expect(Math.abs(navBox.x + navBox.width / 2 - width / 2)).toBeLessThanOrEqual(4);
        expect(brandBox.x + brandBox.width).toBeLessThan(navBox.x);
        expect(navBox.x + navBox.width).toBeLessThan(actionBox.x);
        const linkBoxes = await nav.locator(':scope > *').evaluateAll(nodes => nodes.map(node => {
            const rect = node.getBoundingClientRect();
            return { y: rect.y, height: rect.height, scrollWidth: node.scrollWidth, width: node.clientWidth };
        }));
        expect(linkBoxes).toHaveLength(4);
        for (const box of linkBoxes) {
            expect(box.y).toBe(linkBoxes[0].y);
            expect(box.height).toBe(44);
            expect(box.scrollWidth).toBeLessThanOrEqual(box.width);
        }
    }

    for (const width of [320, 375, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        const menu = header.getByRole('button', { name: 'Menu', exact: true });
        await expect(menu).toBeVisible();
        await expect(nav).toBeHidden();
        await expect(action).toBeHidden();
        const brandBox = await brand.boundingBox();
        const menuBox = await menu.boundingBox();
        expect(brandBox.x).toBeGreaterThanOrEqual(0);
        expect(brandBox.x + brandBox.width).toBeLessThan(menuBox.x);
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
});

test('Todas as páginas compartilham o mesmo menu, ordem, ícones, posição e destino', async ({ page }) => {
    let reference;
    for (const file of ['menu', 'inscritos', 'cursos', 'interessados', 'relatorios', 'faq']) {
        await page.goto(`/admin/${file}.html`);
        const sidebar = page.getByRole('navigation', { name: 'Navegação administrativa' });
        await expect(sidebar.locator('.nav-link')).toHaveCount(9);
        const signature = await sidebar.evaluate(node => [...node.querySelectorAll('.nav-link')].map(link => {
            const rect = link.getBoundingClientRect();
            return { text: link.textContent.trim(), href: link.getAttribute('href'), icon: link.querySelector('i').className, x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
        }));
        if (reference) expect(signature).toEqual(reference); else reference = signature;
        await expect(sidebar.locator('[aria-current="page"]')).toHaveCount(1);
        await expect(sidebar.locator('[aria-current="page"]')).toHaveAttribute('data-page', `${file}.html`);
    }
    await page.screenshot({ path: 'test-results/faq-menu-unico.png', fullPage: true });
    await page.getByRole('link', { name: 'Regras de Negócio' }).click();
    await expect(page.locator('#modalConfiguracoes')).toHaveClass(/open/);
    await expect(page.locator('.admin-sidebar [aria-current="page"]')).toHaveText('Regras de Negócio');
});

test('Ver inscritos de cada turma abre somente seus alunos, inclusive a turma vazia #5', async ({ page, request }) => {
    const response = await page.request.get('/cursos');
    expect(response.status()).toBe(200);
    const courses = await response.json();
    for (const course of courses) {
        await page.goto('/admin/menu.html');
        await page.locator(`a[href="/admin/inscritos.html?curso=${course.id}"]`).click();
        await expect(page.locator('#tituloCursoDetalhe')).toHaveText(`#${course.id} — ${course.nome}`);
        await expect(page.locator('#periodoCursoDetalhe')).toContainText(course.data_inicio);
        await expect(page.locator('#periodoCursoDetalhe')).toContainText(course.data_termino);
        await expect(page.locator('#statusCursoDetalhe')).toHaveText(course.situacao_label);
        await expect(page.locator('#tabelaCursosBody')).toHaveCount(0);
        const students = await (await page.request.get(`/inscritos/${course.id}`)).json();
        if (students.length) {
            await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(students.length);
            for (const row of students) await expect(page.locator('#tabelaAlunosBody')).toContainText(row.nome);
        } else await expect(page.locator('#tabelaAlunosBody')).toContainText('Nenhum aluno inscrito ainda');
        await page.reload();
        await expect(page.locator('#tituloCursoDetalhe')).toHaveText(`#${course.id} — ${course.nome}`);
    }
    await page.goto('/admin/inscritos.html?curso=1');
    await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(2);
    await page.screenshot({ path: 'test-results/inscritos-direto.png', fullPage: true });
});

test('Datas e encerramento são iguais no dashboard, inscritos, monitoramento e site', async ({ page, request }) => {
    await page.goto('/admin/menu.html');
    await expect(page.locator('#kpiAtivos')).toHaveText('2');
    const row = page.locator('#listaCursos tr').filter({ hasText: 'Enfermagem / Saúde' });
    await expect(row).toContainText('12/07/2026 até 30/09/2026');
    await expect(row).toContainText('Encerrado');
    await row.getByRole('button', { name: 'Editar curso', exact: true }).click();
    await expect(page.locator('#data_inicio')).toHaveValue('2026-07-12');
    await expect(page.locator('#data_termino')).toHaveValue('2026-09-30');
    await page.goto('/admin/inscritos.html?curso=5');
    await expect(page.locator('#periodoCursoDetalhe')).toContainText('12/07/2026 até 30/09/2026');
    await expect(page.locator('#statusCursoDetalhe')).toHaveText('Encerrado');
    await page.goto('/admin/cursos.html');
    await expect(page.locator('#tabelaCursos tr').filter({ hasText: 'Enfermagem / Saúde' })).toContainText('Encerrado');
    await expect(page.locator('#kpiInscritos')).toHaveText('2');
    expect((await (await request.get('/api/cursos-public')).json()).map(c => c.id)).toEqual([2, 1]);
    await page.goto('/detalhes/5');
    await expect(page.locator('body')).toContainText('12/07/2026');
    await expect(page.locator('body')).toContainText('30/09/2026');
    await expect(page.getByRole('button', { name: 'Encerrado', exact: true })).toBeDisabled();
    await page.goto('/pre-inscricao/5');
    await expect(page.getByRole('heading', { name: 'Inscrições Encerradas' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'CPF', exact: true })).toHaveCount(0);
});

test('Lista geral exibe os alunos e o filtro não conserva alunos da turma anterior', async ({ page }) => {
    await page.goto('/admin/inscritos.html');
    await expect(page.locator('#tituloCursoDetalhe')).toHaveText('Todas as inscrições');
    await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(2);
    await page.locator('#filtroTurma').selectOption('5');
    await expect(page).toHaveURL(/\?curso=5$/);
    await expect(page.locator('#tabelaAlunosBody')).toContainText('Nenhum aluno inscrito ainda');
    await expect(page.locator('#tabelaAlunosBody')).not.toContainText('Bruno');
    await page.getByRole('button', { name: 'Todas as inscrições' }).click();
    await expect(page).toHaveURL(/inscritos.html$/);
    await expect(page.locator('#tabelaAlunosBody tr')).toHaveCount(2);
});
