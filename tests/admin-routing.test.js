const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const config = require('../vercel.json');

test('Vercel: raiz admin leva ao login e APIs não caem no fallback React', () => {
    for (const path of ['/admin', '/admin/']) {
        const redirect = config.redirects.find(route => route.source === path);
        assert.equal(redirect.destination, '/admin/login.html', path);
        assert.equal(redirect.permanent, false, path);
    }
    const match = (route, path) => new RegExp(`^(?:${route.source.replace('/:path*', '(?:/.*)?')})$`).test(path);
    for (const path of ['/api/admin/me', '/public/categoria', '/cursos', '/cursos/esgotar/1', '/inscritos/1', '/inscricao', '/chat', '/certificado/1']) {
        assert.equal(config.rewrites.find(route => match(route, path)).destination, '/api/index.js', path);
    }
    for (const path of ['/', '/pre-inscricao/1']) {
        assert.equal(config.rewrites.find(route => match(route, path)).destination, '/index.html', path);
    }
});

test('Admin: raiz redireciona, login autoriza painel e listas permanecem privadas', async () => {
    Object.assign(process.env, {
        DB_PROVIDER: 'local', DB_DISABLED: 'true', EMAIL_USER: '', EMAIL_PASS: '', EMAIL_FROM: '',
        ADMIN_USERNAME: 'admin@example.invalid', ADMIN_PASSWORD: 'test-only-password', ADMIN_JWT_SECRET: 'test-only-jwt-secret',
    });
    const createApp = require('../server/server');
    const app = await createApp();
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const get = (path, cookie) => fetch(base + path, { redirect: 'manual', headers: { Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}) } });
    try {
        for (const path of ['/admin', '/admin/', '/admin/menu.html']) {
            const res = await get(path);
            assert.equal(res.status, 302, path);
            assert.equal(res.headers.get('location'), '/admin/login.html', path);
        }
        const loginPage = await get('/admin/login.html');
        assert.equal(loginPage.status, 200);
        assert.match(await loginPage.text(), /Login Admin/);
        for (const path of ['/cursos', '/inscritos/1', '/api/interessados']) assert.equal((await get(path)).status, 401, path);
        const login = await fetch(base + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD }) });
        assert.equal(login.status, 200);
        const cookie = login.headers.get('set-cookie').split(';')[0];
        const root = await get('/admin', cookie);
        assert.equal(root.headers.get('location'), '/admin/menu.html');
        for (const path of ['/admin/menu.html', '/admin/interessados.html', '/admin/inscritos.html', '/admin/adminjs/inscritos.js', '/cursos', '/inscritos/1', '/api/interessados', '/public/categoria']) {
            const res = await get(path, cookie);
            assert.equal(res.status, 200, path);
            if (!path.startsWith('/admin/')) assert.match(res.headers.get('content-type'), /application\/json/, path);
        }
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
