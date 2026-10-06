const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { withTimeout } = require('./timeouts');

function configurationError(code) {
    return Object.assign(new Error('Configuração da conta de serviço Firebase inválida.'), { code, status: 503 });
}

function parseServiceAccount(value) {
    // Accept an assignment pasted from a .env file as well as the JSON alone.
    const json = value.trim().replace(/^FIREBASE_SERVICE_ACCOUNT_JSON\s*=\s*/, '');
    let account;
    try { account = JSON.parse(json); }
    catch { throw configurationError('config/firebase-invalid-json'); }
    if (!account || account.type !== 'service_account' ||
        !['project_id', 'client_email', 'private_key'].every(key => typeof account[key] === 'string' && account[key].trim())) {
        throw configurationError('config/firebase-invalid-account');
    }
    return account;
}

function getFirebaseAdminApp() {
    const existing = getApps().find(app => app.name === 'qualifica-vix-server');
    if (existing) return existing;
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (process.env.VERCEL && !json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw configurationError('config/firebase-account-missing');
    }
    let credential;
    if (json) {
        const account = parseServiceAccount(json);
        try { credential = cert(account); }
        catch { throw configurationError('config/firebase-invalid-key'); }
    } else {
        credential = applicationDefault();
    }
    return initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vixcursos',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://vixcursos-default-rtdb.firebaseio.com',
        credential,
    }, 'qualifica-vix-server');
}

module.exports = { getFirebaseAdminApp, withTimeout, parseServiceAccount };
