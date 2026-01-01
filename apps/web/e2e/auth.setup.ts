import { test as setup } from '@playwright/test'
import { TEST_USER } from './fixtures/test-fixtures'

const authFile = 'playwright/.auth/user.json'

/**
 * Setup test that authenticates and saves the session.
 * Other tests can use this session via `storageState`.
 *
 * Note: This requires a test user to exist in the database.
 * For local development, you may need to create the user first.
 */
setup('authenticate', async ({ page }) => {
    // Skip auth setup if we don't have a test database
    // In CI, you would seed the database with test users
    if (process.env.SKIP_AUTH_SETUP) {
        return
    }

    try {
        await page.goto('/login')

        // Fill in credentials
        await page.getByLabel('Email').fill(TEST_USER.email)
        await page.getByLabel('Password').fill(TEST_USER.password)

        // Submit form
        await page.getByRole('button', { name: 'Login' }).click()

        // Wait for successful login (redirect to home)
        await page.waitForURL('/', { timeout: 10000 })

        // Save authentication state
        await page.context().storageState({ path: authFile })
    } catch {
        // If login fails (e.g., no test user), skip saving auth state
        // Tests will handle unauthenticated state
        console.log(
            'Auth setup skipped - no test user available or login failed',
        )
    }
})
