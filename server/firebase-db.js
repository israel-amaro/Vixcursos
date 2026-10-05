const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { createLocalDb, createLocalState } = require('./local-db');

function normalizeState(value) {
    const state = { ...createLocalState(false), ...(value || {}) };
    for (const key of ['cursos', 'usuarios', 'preInscricoes', 'interessados', 'sugestoes', 'faq', 'configuracoes']) {
        state[key] = Object.values(state[key] || {}).filter(Boolean);
    }
    return state;
}

async function createFirebaseDb(options = {}) {
    const emulator = Boolean(process.env.FIREBASE_DATABASE_EMULATOR_HOST);
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!emulator && !serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error('Firebase requer GOOGLE_APPLICATION_CREDENTIALS (caminho local) ou FIREBASE_SERVICE_ACCOUNT_JSON (somente no servidor).');
    }
    const firebase = getApps().find(a => a.name === 'qualifica-vix-server') || initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'vixcursos',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://vixcursos-default-rtdb.firebaseio.com',
        ...(emulator ? {} : { credential: serviceAccount ? cert(JSON.parse(serviceAccount)) : applicationDefault() }),
    }, 'qualifica-vix-server');
    const ref = getDatabase(firebase).ref(options.dataPath || 'qualificaVix/data');
    // Fail on unavailable credentials/database; never silently write citizen data to memory.
    await ref.get();
    return {
        provider: 'firebase',
        readState: async () => normalizeState((await ref.get()).val()),
        mutate: async (operation) => {
            await ref.once('value');
            let result;
            const committed = await ref.transaction(current => {
                const state = normalizeState(current);
                result = operation(state); // Synchronous, side-effect-free; Firebase may retry.
                return JSON.parse(JSON.stringify(state));
            }, undefined, false);
            if (!committed.committed) throw new Error('Transação Firebase não concluída.');
            return result;
        },
        query: async (sql, values = []) => {
            if (/^\s*(insert|update|delete)/i.test(sql)) {
                await ref.once('value');
                let result;
                await ref.transaction(current => {
                    const local = createLocalDb(normalizeState(current), { strict: true });
                    result = local.query(sql, values);
                    return JSON.parse(JSON.stringify(local.state));
                }, undefined, false);
                return result;
            }
            return createLocalDb(normalizeState((await ref.get()).val()), { strict: true }).query(sql, values);
        },
        getConnection: async () => ({ release() {} }),
    };
}
module.exports = { createFirebaseDb, normalizeState };
