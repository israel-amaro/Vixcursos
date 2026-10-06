async function logout() {
    try {
        const response = await fetch('/api/admin/logout', { method: 'POST', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Não foi possível sair. Tente novamente.');
        window.location.replace('/admin/login.html');
    } catch (error) { alert(error.message || 'O servidor não respondeu. Tente sair novamente.'); }
}

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.sidebar-nav');
    if (nav && !nav.querySelector('[data-admin-logout]')) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-link';
        button.dataset.adminLogout = 'true';
        button.style.cssText = 'border:0;background:transparent;width:100%;cursor:pointer;text-align:left';
        button.setAttribute('aria-label', 'Sair do painel');
        button.innerHTML = '<span class="ni"><i class="bi bi-box-arrow-right" aria-hidden="true"></i></span><span>Sair</span>';
        button.addEventListener('click', logout);
        nav.appendChild(button);
    }
    fetch('/api/admin/me', { signal: AbortSignal.timeout(15000) }).then(response => {
        if (response.status === 401 || response.status === 403) window.location.replace('/admin/login.html');
    }).catch(() => {});
});
