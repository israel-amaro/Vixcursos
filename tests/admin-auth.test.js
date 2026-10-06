const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');
const { createAdminAuth } = require('../server/admin-auth');

test('Firebase Auth: UID, sessão revogada, acesso recente, origem e logout', async () => {
    let sessionsCreated = 0;
    const identity = { uid: 'allowed-admin', auth_time: Math.floor(Date.now() / 1000) };
    const failure = code => { throw Object.assign(new Error('token recusado'), { code }); };
    const service = {
        verifyIdToken: async (token, revoked) => {
            assert.equal(revoked, true);
            if (token === 'expired') return failure('auth/id-token-expired');
            if (token === 'disabled') return failure('auth/user-disabled');
            if (token === 'old-login') return { ...identity, auth_time: identity.auth_time - 600 };
            return token === 'valid' ? identity : { uid: 'ordinary-user', auth_time: identity.auth_time };
        },
        createSessionCookie: async (_token, options) => { sessionsCreated++; assert.equal(options.expiresIn, 28800000); return 'valid-session'; },
        verifySessionCookie: async (token, revoked) => {
            assert.equal(revoked, true);
            if (token === 'revoked') return failure('auth/session-cookie-revoked');
            return token === 'valid-session' ? identity : { uid: 'ordinary-user' };
        },
    };
    const auth = createAdminAuth({ allowedUids: ['allowed-admin'], getAuth: () => service, secure: true });
    const app = express(); app.use(express.json()); app.use(auth.router);
    app.get('/private', auth.requireAuth, (_req, res) => res.json({ ok: true }));
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const login = (idToken, origin) => fetch(base + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify({ idToken }) });
    const get = (token, route = '/private') => fetch(base + route, { headers: token ? { Cookie: `qualifica_vix_admin_session=${token}` } : {} });
    try {
        assert.equal((await get()).status, 401);
        assert.equal((await get('ordinary')).status, 401);
        assert.equal((await get('revoked')).status, 401);
        assert.equal((await login('ordinary')).status, 403);
        assert.equal((await login('expired')).status, 401);
        assert.equal((await login('disabled')).status, 401);
        assert.equal((await login('old-login')).status, 401);
        assert.equal((await login('valid', 'https://untrusted.example')).status, 403);
        assert.equal(sessionsCreated, 0);
        const permitted = await login('valid', base);
        assert.equal(permitted.status, 200);
        assert.equal(sessionsCreated, 1);
        assert.match(permitted.headers.get('set-cookie'), /HttpOnly/);
        assert.match(permitted.headers.get('set-cookie'), /SameSite=Lax/);
        assert.match(permitted.headers.get('set-cookie'), /Secure/);
        assert.equal((await get('valid-session')).status, 200);
        assert.equal((await (await get('valid-session', '/api/admin/me')).json()).uid, 'allowed-admin');
        const logout = await fetch(base + '/api/admin/logout', { method: 'POST' });
        assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
    } finally {
        server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    }
});

test('Falha operacional mostra causa segura e não cria sessão administrativa', async () => {
    let failureCode = 'config/firebase-invalid-json';
    const auth = createAdminAuth({ getAuth: () => {
        throw Object.assign(new Error('sensitive-key-content'), { code: failureCode, status: 503 });
    } });
    const app = express(); app.use(express.json()); app.use(auth.router);
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const code of ['config/firebase-invalid-json', 'auth/insufficient-permission', 'MODULE_NOT_FOUND']) {
            failureCode = code;
            const response = await fetch(base + '/api/admin/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: 'firebase-id-token' }),
            });
            assert.equal(response.status, 503);
            assert.equal(response.headers.get('set-cookie'), null);
            const data = await response.json();
            assert.equal(data.code, code);
            assert.equal(JSON.stringify(data).includes('sensitive-key-content'), false);
        }
    } finally {
        server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    }
});
