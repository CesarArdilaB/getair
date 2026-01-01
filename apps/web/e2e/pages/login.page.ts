import type { Locator, Page } from '@playwright/test'

/**
 * Page Object Model for the Login page
 */
export class LoginPage {
    readonly page: Page
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly loginButton: Locator
    readonly signUpLink: Locator
    readonly resetPasswordLink: Locator
    readonly googleButton: Locator
    readonly passwordToggle: Locator

    constructor(page: Page) {
        this.page = page
        this.emailInput = page.getByLabel('Email')
        this.passwordInput = page.getByLabel('Password')
        this.loginButton = page.getByRole('button', { name: 'Login' })
        this.signUpLink = page.getByRole('link', { name: 'Create new account' })
        this.resetPasswordLink = page.getByRole('link', {
            name: 'Reset password',
        })
        this.googleButton = page.getByRole('button', {
            name: /continue with google/i,
        })
        this.passwordToggle = page.locator(
            'button[type="button"]:has(svg[class*="eye"])',
        )
    }

    async goto() {
        await this.page.goto('/login')
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }

    async togglePasswordVisibility() {
        await this.passwordToggle.click()
    }

    async goToSignUp() {
        await this.signUpLink.click()
    }

    async goToResetPassword() {
        await this.resetPasswordLink.click()
    }
}
