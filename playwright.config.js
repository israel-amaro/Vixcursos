const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    timeout: 30000,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: { baseURL: 'http://127.0.0.1:3107', browserName: 'chromium', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
    webServer: { command: 'node tests/e2e-server.js', url: 'http://127.0.0.1:3107/admin/login.html', reuseExistingServer: false, timeout: 30000 },
});
