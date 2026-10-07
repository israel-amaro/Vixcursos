const express = require('express');
const { adminFixture, adminAuth, disableNotifications, createLocalDb } = require('./helpers/admin-fixture');
disableNotifications();
const db = createLocalDb(adminFixture());
require('../server/server')({ db, adminAuth }).then(app => {
    // This server exists only in the test process; no test endpoints enter the product.
    const server = express();
    server.post('/__test/reset', async (_req, res) => { await db.mutate(s => Object.assign(s, adminFixture())); res.json({ ok: true }); });
    server.use(app);
    server.listen(3107, '127.0.0.1', () => console.log('Admin test server ready at http://127.0.0.1:3107'));
});
