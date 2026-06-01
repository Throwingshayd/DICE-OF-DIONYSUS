// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: 'line',
    timeout: 90000,
    use: {
        headless: true,
        baseURL: 'http://localhost:3000',
        viewport: { width: 1280, height: 900 },
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 3000 --strictPort',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 60000,
    },
});
