const express = require('express');
const { withTimeout } = require('./timeouts');
const access = require('./admin-access.json');

const COOKIE = 'qualifica_vix_admin_session';
const EXPIRY = 8 * 60 * 60 * 1000;

function firebaseUnavailable(error) {
    const messages = {
        'config/firebase-account-missing': 'Configure FIREBASE_SERVICE_ACCOUNT_JSON na Vercel para Production e faça um novo deploy.',
        'config/firebase-invalid-json': 'O valor de FIREBASE_SERVICE_ACCOUNT_JSON não é um JSON válido. Cole o conteúdo completo do arquivo e faça um novo deploy.',
        'config/firebase-invalid-account': 'FIREBASE_SERVICE_ACCOUNT_JSON precisa conter o JSON completo de uma conta de serviço Firebase.',
        'config/firebase-invalid-key': 'A chave privada da conta de serviço está inválida. Use um novo arquivo JSON gerado no Firebase e faça um novo deploy.',
        'auth/invalid-credential': 'A credencial do servidor não foi aceita pelo Firebase. Confira a conta de serviço configurada na Vercel.',
        'app/invalid-credential': 'A credencial do servidor não foi aceita pelo Firebase. Confira a conta de serviço configurada na Vercel.',
        'auth/insufficient-permission': 'A conta de serviço não tem permissão para gerenciar sessões no Firebase Authentication. Confira as permissões no Google Cloud.',
        'MODULE_NOT_FOUND': 'Uma dependência da autenticação está ausente no servidor. É necessário corrigir o deploy do portal.',
        'ERR_MODULE_NOT_FOUND': 'Uma dependência da autenticação está ausente no servidor. É necessário corrigir o deploy do portal.',
        'ERR_REQUIRE_ESM': 'Uma dependência da autenticação é incompatível com o servidor. É necessário atualizar o deploy do portal.',
    };
    // Never return/log the SDK message: parsing and credential errors may contain secrets.
    const code = typeof error?.code === 'string' && /^[a-zA-Z0-9_/-]{1,80}$/.test(error.code) ? error.code : 'firebase/unavailable';
    return { code, error: messages[code] || `Não foi possível validar o acesso no Firebase (${code}). Verifique os Logs do servidor na Vercel.` };
}

function createAdminAuth(options = {}) {
    const allowedUids = new Set(options.allowedUids || (process.env.FIREBASE_ADMIN_UIDS ? process.env.FIREBASE_ADMIN_UIDS.split(',').map(uid => uid.trim()).filter(Boolean) : access.allowedUids));
    const auth = options.getAuth || (() => {
        const { getAuth } = require('firebase-admin/auth');
        const { getFirebaseAdminApp } = require('./firebase-admin');
        return getAuth(getFirebaseAdminApp());
    });
    const permitted = user => user.admin === true || allowedUids.has(user.uid || user.sub);
    const secure = options.secure ?? (process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL));
    const cookie = value => `${COOKIE}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${value ? EXPIRY / 1000 : 0}${secure ? '; Secure' : ''}`;
    const readCookie = req => String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    const verify = async req => {
        const token = readCookie(req);
        if (!token) return null;
        try {
            const user = await withTimeout(auth().verifySessionCookie(token, true));
            return permitted(user) ? user : null;
        } catch (error) {
            if (error.status === 503 || ['auth/invalid-credential', 'app/invalid-credential', 'auth/insufficient-permission', 'MODULE_NOT_FOUND', 'ERR_MODULE_NOT_FOUND', 'ERR_REQUIRE_ESM'].includes(error.code)) throw Object.assign(error, { status: 503 });
            return null;
        }
    };
    const unavailable = (res, error) => res.status(503).json(firebaseUnavailable(error));
    const requireAuth = async (req, res, next) => {
        try {
            const user = await verify(req);
            if (!user) return res.status(401).json({ error: 'Entre com sua conta administrativa do Firebase.' });
            req.admin = user;
            next();
        } catch (error) { unavailable(res, error); }
    };
    const protectPages = async (req, res, next) => {
        if (!req.path.startsWith('/admin') || req.path === '/admin/login.html') return next();
        try {
            const user = await verify(req);
            if (req.path === '/admin' || req.path === '/admin/') return res.redirect(user ? '/admin/menu.html' : '/admin/login.html');
            if (!user) return res.redirect('/admin/login.html');
            req.admin = user;
            next();
        } catch (error) { unavailable(res, error); }
    };
    const router = express.Router();
    router.post('/api/admin/login', async (req, res) => {
        const origin = req.get('origin');
        if (origin && origin !== `${req.protocol}://${req.get('host')}` && origin !== `https://${req.get('host')}`) return res.status(403).json({ error: 'Origem de acesso inválida.' });
        if (typeof req.body?.idToken !== 'string' || !req.body.idToken) return res.status(400).json({ error: 'Entre com e-mail e senha pelo Firebase Authentication.' });
        try {
            const service = auth();
            const user = await withTimeout(service.verifyIdToken(req.body.idToken, true));
            if (!permitted(user)) return res.status(403).json({ error: 'Sua conta Firebase não está autorizada a acessar o painel administrativo.' });
            if (!user.auth_time || Date.now() / 1000 - user.auth_time > 300) return res.status(401).json({ error: 'Entre novamente para iniciar uma sessão administrativa.' });
            const session = await withTimeout(service.createSessionCookie(req.body.idToken, { expiresIn: EXPIRY }));
            res.setHeader('Set-Cookie', cookie(session));
            res.json({ ok: true });
        } catch (error) {
            const invalid = ['auth/argument-error', 'auth/id-token-expired', 'auth/id-token-revoked', 'auth/user-disabled', 'auth/invalid-id-token'].includes(error.code);
            if (invalid) return res.status(401).json({ error: 'Sua sessão Firebase não é válida. Entre novamente.' });
            console.error('[admin-auth] Falha ao validar sessão Firebase:', firebaseUnavailable(error).code);
            unavailable(res, error);
        }
    });
    router.get('/api/admin/me', requireAuth, (req, res) => res.json({ authenticated: true, uid: req.admin.uid || req.admin.sub, username: req.admin.email || '' }));
    router.post('/api/admin/logout', (req, res) => {
        res.setHeader('Set-Cookie', cookie(''));
        res.json({ ok: true });
    });
    return { requireAuth, protectPages, router };
}

module.exports = { createAdminAuth };
