import { test, Page, Locator } from '@playwright/test';
import { config } from '../lib/config';

export class HomePage {
    readonly page: Page;
    readonly url: string = config.siteData.catalog.url;
    readonly loginButton: Locator;
    readonly hamburgerMenuButton: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginButton = page.locator('#loginLink');
        this.hamburgerMenuButton = page.locator('#header-menu-dropdown');
        this.logoutButton = page.locator('#header-menu').locator('#logoutLink');
    }

    async open() {
        await test.step('Navigating to your Aspen home page', async () => {
            await this.page.goto(this.url);
        });
    }

    async openLoginModal() {
        await test.step('Opening login modal', async () => {
            await this.loginButton.click();
        });
    }

    async logout() {
        await test.step('Opening the header menu dropdown', async () => {
            await this.hamburgerMenuButton.click();
        });

        await test.step('Clicking the sign out button', async () => {
            await this.logoutButton.click();
        });
    }
}

export class LoginModal {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.submitButton = page.locator('#loginFormSubmit');
    }

    async login(user: string, pass: string) {
        await test.step('Entering patron valid patron credentials', async () => {
            await this.usernameInput.fill(user);
            await this.passwordInput.fill(pass);
        });

        await test.step('Clicking Sign In button', async () => {
            await this.submitButton.click();
        });
    }
}