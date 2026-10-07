const { test, expect } = require('@playwright/test');
test.beforeEach(async ({ context, request, page }) => {
    await request.post('/__test/reset');
    await context.addCookies([{ name: 'qualifica_vix_admin_session', value: 'test-session', domain: '127.0.0.1', path: '/' }]);
    page.errors = [];
    page.on('pageerror', error => page.errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.errors).toEqual([]));

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
