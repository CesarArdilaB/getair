import type { Page } from '@playwright/test'
import { test as base, expect } from '@playwright/test'

/**
 * Test user credentials for E2E tests
 * These should match users seeded in the test database
 */
export const TEST_USER = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User',
}

export const TEST_USER_2 = {
    email: 'test2@example.com',
    password: 'testpassword456',
    name: 'Test User 2',
}

/**
 * Extended test fixtures with common utilities
 */
export const test = base.extend<{
    authenticatedPage: Page
}>({
    // Fixture for authenticated page - logs in before each test
    authenticatedPage: async ({ page }, use) => {
        // Navigate to login
        await page.goto('/login')

        // Fill in credentials
        await page.getByLabel('Email').fill(TEST_USER.email)
        await page.getByLabel('Password').fill(TEST_USER.password)

        // Submit form
        await page.getByRole('button', { name: 'Login' }).click()

        // Wait for redirect to home/dashboard
        await page.waitForURL('/', { timeout: 10000 })

        // Use the authenticated page
        await use(page)
    },
})

export { expect }

/**
 * Helper to wait for toast messages
 */
export async function waitForToast(page: Page, text: string) {
    await expect(page.getByText(text)).toBeVisible({ timeout: 5000 })
}

/**
 * Helper to dismiss all toasts
 */
export async function dismissToasts(page: Page) {
    const toasts = page.locator('[data-sonner-toast]')
    const count = await toasts.count()
    for (let i = 0; i < count; i++) {
        await toasts.nth(i).click()
    }
}

/**
 * Helper to fill login form
 */
export async function fillLoginForm(
    page: Page,
    email: string,
    password: string,
) {
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
}

/**
 * Helper to fill signup form
 */
export async function fillSignupForm(
    page: Page,
    name: string,
    email: string,
    password: string,
) {
    await page.getByLabel('Full Name').fill(name)
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
}
