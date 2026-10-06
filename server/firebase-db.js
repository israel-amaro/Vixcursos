const { getFirebaseAdminApp, withTimeout } = require('./firebase-admin');
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
    const firebase = getFirebaseAdminApp();
    const ref = getDatabase(firebase).ref(options.dataPath || 'qualificaVix/data');
    // Fail on unavailable credentials/database; never silently write citizen data to memory.
    await withTimeout(ref.get());
    const transact = async operation => {
        // Retain the loaded value until the transaction finishes. A one-shot read
        // alone can release the cache and give the first callback an empty state.
        const keepValue = () => {};
        ref.on('value', keepValue);
        try {
            await withTimeout(ref.once('value'));
            let result;
            const committed = await ref.transaction(current => {
                const state = normalizeState(current);
                result = operation(state); // Synchronous, side-effect-free; Firebase may retry.
                return JSON.parse(JSON.stringify(state));
            }, undefined, false);
            if (!committed.committed) throw new Error('Transação Firebase não concluída.');
            return result;
        } finally { ref.off('value', keepValue); }
    };
    return {
        provider: 'firebase',
        readState: async () => normalizeState((await withTimeout(ref.get())).val()),
        mutate: transact,
        query: async (sql, values = []) => {
            if (/^\s*(insert|update|delete)/i.test(sql)) {
                return transact(state => createLocalDb(state, { strict: true }).query(sql, values));
            }
            return createLocalDb(normalizeState((await withTimeout(ref.get())).val()), { strict: true }).query(sql, values);
        },
        getConnection: async () => ({ release() {} }),
    };
}
function createLazyFirebaseDb(options = {}) {
    let connection;
    const getConnection = () => connection ||= createFirebaseDb(options).catch(error => {
        connection = undefined;
        throw Object.assign(error, { status: 503 });
    });
    const invoke = async (method, args) => {
        try { return await (await getConnection())[method](...args); }
        catch (error) { throw Object.assign(error, { status: error.status || 503 }); }
    };
    return {
        provider: 'firebase',
        readState: (...args) => invoke('readState', args),
        mutate: (...args) => invoke('mutate', args),
        query: (...args) => invoke('query', args),
        getConnection: (...args) => invoke('getConnection', args),
    };
}
module.exports = { createFirebaseDb, createLazyFirebaseDb, normalizeState };
