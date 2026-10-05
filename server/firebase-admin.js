const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { withTimeout } = require('./timeouts');

function getFirebaseAdminApp() {
    const existing = getApps().find(app => app.name === 'qualifica-vix-server');
    if (existing) return existing;
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    return initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vixcursos',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://vixcursos-default-rtdb.firebaseio.com',
        ...(json ? { credential: cert(JSON.parse(json)) } : { credential: applicationDefault() }),
    }, 'qualifica-vix-server');
}

module.exports = { getFirebaseAdminApp, withTimeout };
