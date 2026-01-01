import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
    test.describe('Unauthenticated Navigation', () => {
        test('should show login page at /login', async ({ page }) => {
            await page.goto('/login')

            await expect(page.getByText('Ignition')).toBeVisible()
            await expect(page.getByLabel('Email')).toBeVisible()
        })

        test('should show sign up page at /sign-up', async ({ page }) => {
            await page.goto('/sign-up')

            await expect(page.getByText('Ignition')).toBeVisible()
            await expect(page.getByLabel('Full Name')).toBeVisible()
        })

        test('should show reset password page at /reset-password', async ({
            page,
        }) => {
            await page.goto('/reset-password')

            await expect(page.getByText('Reset Password')).toBeVisible()
        })

        test('should redirect to login from protected routes', async ({
            page,
        }) => {
            await page.goto('/')

            await expect(page).toHaveURL(/\/login/)
        })
    })

    test.describe('Auth Page Navigation', () => {
        test('should navigate between auth pages', async ({ page }) => {
            // Start at login
            await page.goto('/login')

            // Go to sign up
            await page.getByRole('link', { name: 'Create new account' }).click()
            await expect(page).toHaveURL(/\/sign-up/)

            // Go back to login
            await page.getByRole('link', { name: 'Login' }).click()
            await expect(page).toHaveURL(/\/login/)

            // Go to reset password
            await page.getByRole('link', { name: 'Reset password' }).click()
            await expect(page).toHaveURL(/\/reset-password/)

            // Back to login
            await page.getByRole('link', { name: 'Login' }).click()
            await expect(page).toHaveURL(/\/login/)
        })
    })
})

test.describe('Page Titles and Meta', () => {
    test('login page should have proper structure', async ({ page }) => {
        await page.goto('/login')

        // Check for logo
        await expect(page.locator('img[alt*="Logo" i]').first()).toBeVisible()

        // Check for form elements
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('sign up page should have proper structure', async ({ page }) => {
        await page.goto('/sign-up')

        // Check for form elements
        await expect(
            page.getByRole('button', { name: 'Sign Up' }),
        ).toBeVisible()
    })
})

test.describe('Responsive Design', () => {
    test('login form should be usable on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        await page.goto('/login')

        // Form should still be visible and usable
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
    })

    test('sign up form should be usable on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        await page.goto('/sign-up')

        // Form should still be visible and usable
        await expect(page.getByLabel('Full Name')).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
    })
})
