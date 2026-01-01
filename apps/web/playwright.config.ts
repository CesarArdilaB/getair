import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E test configuration for @apps/web
 *
 * Run tests:
 *   pnpm --filter web test:e2e          # Run all tests
 *   pnpm --filter web test:e2e:ui       # Open UI mode
 *   pnpm --filter web test:e2e:debug    # Debug mode
 *   pnpm --filter web test:e2e:headed   # Run with browser visible
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        // Setup project for authentication
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
            dependencies: ['setup'],
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
            dependencies: ['setup'],
        },
        // Mobile viewports
        {
            name: 'mobile-chrome',
            use: {
                ...devices['Pixel 5'],
            },
            dependencies: ['setup'],
        },
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 12'],
            },
            dependencies: ['setup'],
        },
    ],
    // Run local dev server before tests
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
})
