import { defineConfig, devices } from '@playwright/test';
import { config } from './common/config';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    workers: 3,
    timeout: 150_000,
    expect: {
        timeout: 15_000,
    },
    reporter: 'html',
    use: {
        baseURL: config.catalog.url,
        trace: 'on-first-retry',
        viewport: { width: 1920, height: 1080 },
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Runs anything in tests/custom/ across all browsers.
        // Add your own specs there — the directory is gitignored.
        // Run with: npx playwright test --project=custom
        // {
        //     name: 'custom',
        //     testDir: './tests/custom',
        //     use: { ...devices['Desktop Chrome'] },
        // },
    ],
});