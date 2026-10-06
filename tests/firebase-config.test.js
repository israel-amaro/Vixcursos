const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { deleteApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirebaseAdminApp, parseServiceAccount } = require('../server/firebase-admin');

test('SDK Authentication carrega sem suporte a require de ESM, como no servidor Vercel', () => {
    const result = spawnSync(process.execPath, ['--no-experimental-require-module', '-e', "require('firebase-admin/auth');"], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
});

test('Conta de serviço: JSON e atribuição copiada inicializam a validação real do SDK', async () => {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const json = JSON.stringify({
        type: 'service_account', project_id: 'test-qualifica-vix',
        client_email: 'test@test-qualifica-vix.iam.gserviceaccount.com',
        private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
    }, null, 2);
    const previous = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    try {
        for (const value of [json, `FIREBASE_SERVICE_ACCOUNT_JSON=${json}`]) {
            process.env.FIREBASE_SERVICE_ACCOUNT_JSON = value;
            const app = getFirebaseAdminApp();
            try {
                // A malformed ID token must reach the SDK, not fail while parsing the env.
                await assert.rejects(getAuth(app).verifyIdToken('invalid-token', true), { code: 'auth/argument-error' });
            } finally { await deleteApp(app); }
        }
    } finally {
        if (previous === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = previous;
    }
});

test('Configuração inválida não expõe trechos do JSON nem da chave', () => {
    const secret = 'sensitive-key-content';
    for (const value of [`{"private_key":"${secret}"`, JSON.stringify({ private_key: secret })]) {
        assert.throws(() => parseServiceAccount(value), error => {
            assert.equal(error.status, 503);
            assert.match(error.code, /^config\/firebase-invalid-/);
            assert.equal(error.message.includes(secret), false);
            return true;
        });
    }
    const previous = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    try {
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({
            type: 'service_account', project_id: 'test-qualifica-vix',
            client_email: 'test@test-qualifica-vix.iam.gserviceaccount.com', private_key: secret,
        });
        assert.throws(getFirebaseAdminApp, error => {
            assert.equal(error.code, 'config/firebase-invalid-key');
            assert.equal(error.message.includes(secret), false);
            return true;
        });
    } finally {
        if (previous === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = previous;
    }
});
