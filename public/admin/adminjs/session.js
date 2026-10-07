async function logout() {
    try {
        const response = await fetch('/api/admin/logout', { method: 'POST', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Não foi possível sair. Tente novamente.');
        window.location.replace('/admin/login.html');
    } catch (error) { alert(error.message || 'O servidor não respondeu. Tente sair novamente.'); }
}

function marcarNavegacaoAdmin(configuracoes = false) {
    document.querySelectorAll('.admin-sidebar a[data-page]').forEach(link => {
        const active = configuracoes ? link.dataset.page === 'configuracoes' :
            link.dataset.page === window.location.pathname.split('/').pop();
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.admin-sidebar');
    const link = (page, icon, label, href = `/admin/${page}`) =>
        `<a href="${href}" class="nav-link" data-page="${page}"><span class="ni"><i class="bi bi-${icon}" aria-hidden="true"></i></span><span>${label}</span></a>`;
    if (sidebar) {
        sidebar.setAttribute('aria-label', 'Navegação administrativa');
        sidebar.innerHTML = `<a href="/admin/menu.html" class="sidebar-brand">
            <img class="sidebar-logo" src="/imagem/logo.png" alt="Qualifica Vix">
            <div><span class="brand-name">Qualifica Vix</span><span class="brand-sub">Área administrativa</span></div></a>
            <div class="sidebar-nav"><div class="nav-section">Principal</div>
            ${link('menu.html', 'house-door-fill', 'Dashboard')}
            <div class="nav-section">Academia</div>
            ${link('inscritos.html', 'people-fill', 'Alunos Inscritos')}
            ${link('interessados.html', 'clipboard-data', 'Interessados')}
            ${link('cursos.html', 'bar-chart-line-fill', 'Monitoramento')}
            ${link('relatorios.html', 'graph-up-arrow', 'Relatórios')}
            <div class="nav-section">Configuração</div>
            ${link('configuracoes', 'gear-fill', 'Regras de Negócio', '/admin/menu.html?configuracoes=1')}
            ${link('faq.html', 'question-circle-fill', 'Gerenciar FAQ')}
            <div class="sidebar-sep"></div>${link('site', 'globe-americas', 'Ver Site', '/')}
            <button type="button" class="nav-link" data-admin-logout aria-label="Sair do painel"><span class="ni"><i class="bi bi-box-arrow-right" aria-hidden="true"></i></span><span>Sair</span></button></div>`;
        sidebar.querySelector('[data-admin-logout]').addEventListener('click', logout);
        sidebar.querySelector('[data-page="configuracoes"]').addEventListener('click', event => {
            if (window.location.pathname.endsWith('/menu.html')) abrirModalConfig(event);
        });
        marcarNavegacaoAdmin(new URLSearchParams(window.location.search).has('configuracoes'));
    }
    fetch('/api/admin/me', { signal: AbortSignal.timeout(15000) }).then(response => {
        if (response.status === 401 || response.status === 403) window.location.replace('/admin/login.html');
    }).catch(() => {});
});
