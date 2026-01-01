import { expect, test } from '@playwright/test'
import { LoginPage, SignUpPage } from './pages'

test.describe('Authentication', () => {
    test.describe('Login Page', () => {
        test('should display login form', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await expect(loginPage.emailInput).toBeVisible()
            await expect(loginPage.passwordInput).toBeVisible()
            await expect(loginPage.loginButton).toBeVisible()
            await expect(loginPage.googleButton).toBeVisible()
        })

        test('should show password when toggle is clicked', async ({
            page,
        }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            // Password should be hidden by default
            await expect(loginPage.passwordInput).toHaveAttribute(
                'type',
                'password',
            )

            // Toggle visibility
            await loginPage.togglePasswordVisibility()
            await expect(loginPage.passwordInput).toHaveAttribute(
                'type',
                'text',
            )

            // Toggle back
            await loginPage.togglePasswordVisibility()
            await expect(loginPage.passwordInput).toHaveAttribute(
                'type',
                'password',
            )
        })

        test('should navigate to sign up page', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await loginPage.goToSignUp()

            await expect(page).toHaveURL(/\/sign-up/)
        })

        test('should navigate to reset password page', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await loginPage.goToResetPassword()

            await expect(page).toHaveURL(/\/reset-password/)
        })

        test('should show error for invalid credentials', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await loginPage.login('invalid@example.com', 'wrongpassword')

            // Should show error toast
            await expect(page.getByText(/failed|error|invalid/i)).toBeVisible({
                timeout: 10000,
            })
        })

        test('should require email field', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await loginPage.passwordInput.fill('somepassword')
            await loginPage.loginButton.click()

            // Email should be required (HTML5 validation)
            const emailInput = loginPage.emailInput
            const isInvalid = await emailInput.evaluate(
                (el: HTMLInputElement) => !el.validity.valid,
            )
            expect(isInvalid).toBe(true)
        })

        test('should require password field', async ({ page }) => {
            const loginPage = new LoginPage(page)
            await loginPage.goto()

            await loginPage.emailInput.fill('test@example.com')
            await loginPage.loginButton.click()

            // Password should be required (HTML5 validation)
            const passwordInput = loginPage.passwordInput
            const isInvalid = await passwordInput.evaluate(
                (el: HTMLInputElement) => !el.validity.valid,
            )
            expect(isInvalid).toBe(true)
        })
    })

    test.describe('Sign Up Page', () => {
        test('should display sign up form', async ({ page }) => {
            const signUpPage = new SignUpPage(page)
            await signUpPage.goto()

            await expect(signUpPage.nameInput).toBeVisible()
            await expect(signUpPage.emailInput).toBeVisible()
            await expect(signUpPage.passwordInput).toBeVisible()
            await expect(signUpPage.signUpButton).toBeVisible()
            await expect(signUpPage.googleButton).toBeVisible()
        })

        test('should navigate to login page', async ({ page }) => {
            const signUpPage = new SignUpPage(page)
            await signUpPage.goto()

            await signUpPage.goToLogin()

            await expect(page).toHaveURL(/\/login/)
        })

        test('should require all fields', async ({ page }) => {
            const signUpPage = new SignUpPage(page)
            await signUpPage.goto()

            // Try to submit empty form
            await signUpPage.signUpButton.click()

            // Name should be required
            const nameInput = signUpPage.nameInput
            const isNameInvalid = await nameInput.evaluate(
                (el: HTMLInputElement) => !el.validity.valid,
            )
            expect(isNameInvalid).toBe(true)
        })

        test('should validate email format', async ({ page }) => {
            const signUpPage = new SignUpPage(page)
            await signUpPage.goto()

            await signUpPage.nameInput.fill('Test User')
            await signUpPage.emailInput.fill('invalid-email')
            await signUpPage.passwordInput.fill('password123')
            await signUpPage.signUpButton.click()

            // Email should be invalid
            const emailInput = signUpPage.emailInput
            const isInvalid = await emailInput.evaluate(
                (el: HTMLInputElement) => !el.validity.valid,
            )
            expect(isInvalid).toBe(true)
        })
    })

    test.describe('Reset Password Page', () => {
        test('should display reset password form', async ({ page }) => {
            await page.goto('/reset-password')

            await expect(page.getByLabel('Email')).toBeVisible()
            await expect(
                page.getByRole('button', { name: 'Reset Password' }),
            ).toBeVisible()
        })

        test('should navigate to login page', async ({ page }) => {
            await page.goto('/reset-password')

            await page.getByRole('link', { name: 'Login' }).click()

            await expect(page).toHaveURL(/\/login/)
        })

        test('should navigate to sign up page', async ({ page }) => {
            await page.goto('/reset-password')

            await page.getByRole('link', { name: 'Sign Up' }).click()

            await expect(page).toHaveURL(/\/sign-up/)
        })
    })

    test.describe('Auth Redirects', () => {
        test('should redirect unauthenticated users to login', async ({
            page,
        }) => {
            // Try to access protected route
            await page.goto('/')

            // Should be redirected to login
            await expect(page).toHaveURL(/\/login/)
        })

        test('should preserve redirect URL in login', async ({ page }) => {
            // Try to access a specific protected route
            await page.goto('/users')

            // Should be redirected to login with redirect param
            await expect(page).toHaveURL(/\/login.*redirect/)
        })
    })
})
