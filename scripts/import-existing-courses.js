require('dotenv').config({ path: ['.env.local', '.env'], quiet: true });
const { deleteApp } = require('firebase-admin/app');
const { createFirebaseDb } = require('../server/firebase-db');
const { getFirebaseAdminApp } = require('../server/firebase-admin');
const { importExistingCourses } = require('../server/catalog-import');

(async () => {
    try {
        const db = await createFirebaseDb();
        console.log(JSON.stringify(await importExistingCourses(db)));
    } catch (error) {
        console.error('Não foi possível importar o catálogo:', error.code || 'firebase/unavailable');
        process.exitCode = 1;
    } finally { await deleteApp(getFirebaseAdminApp()); }
})();
