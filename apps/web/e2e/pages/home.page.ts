import type { Locator, Page } from '@playwright/test'

/**
 * Page Object Model for the Home/Dashboard page
 */
export class HomePage {
    readonly page: Page
    readonly sidebar: Locator
    readonly sidebarToggle: Locator
    readonly postTitleInput: Locator
    readonly postContentInput: Locator
    readonly createPostButton: Locator
    readonly postsList: Locator
    readonly userMenu: Locator
    readonly logoutButton: Locator

    constructor(page: Page) {
        this.page = page
        this.sidebar = page.locator('[data-slot="sidebar"]')
        this.sidebarToggle = page.locator('[data-slot="sidebar-trigger"]')
        this.postTitleInput = page.getByLabel('Post title')
        this.postContentInput = page.getByLabel('Content')
        this.createPostButton = page.getByRole('button', { name: 'Create' })
        this.postsList = page.locator('ul')
        this.userMenu = page.locator('button:has([data-slot="avatar"])')
        this.logoutButton = page.getByRole('menuitem', { name: 'Log out' })
    }

    async goto() {
        await this.page.goto('/')
    }

    async createPost(title: string, content: string) {
        await this.postTitleInput.fill(title)
        await this.postContentInput.fill(content)
        await this.createPostButton.click()
    }

    async toggleSidebar() {
        await this.sidebarToggle.click()
    }

    async logout() {
        await this.userMenu.click()
        await this.logoutButton.click()
    }

    async getPostTitles(): Promise<string[]> {
        const titles = await this.postsList.locator('h3').allTextContents()
        return titles
    }

    async navigateToMenuItem(name: string) {
        await this.sidebar
            .getByRole('link', { name, exact: false })
            .first()
            .click()
    }
}
