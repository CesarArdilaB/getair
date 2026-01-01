import type { Locator, Page } from '@playwright/test'

/**
 * Page Object Model for the Sign Up page
 */
export class SignUpPage {
    readonly page: Page
    readonly nameInput: Locator
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly signUpButton: Locator
    readonly loginLink: Locator
    readonly googleButton: Locator

    constructor(page: Page) {
        this.page = page
        this.nameInput = page.getByLabel('Full Name')
        this.emailInput = page.getByLabel('Email')
        this.passwordInput = page.getByLabel('Password')
        this.signUpButton = page.getByRole('button', { name: 'Sign Up' })
        this.loginLink = page.getByRole('link', { name: 'Login' })
        this.googleButton = page.getByRole('button', {
            name: /continue with google/i,
        })
    }

    async goto() {
        await this.page.goto('/sign-up')
    }

    async signUp(name: string, email: string, password: string) {
        await this.nameInput.fill(name)
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.signUpButton.click()
    }

    async goToLogin() {
        await this.loginLink.click()
    }
}
