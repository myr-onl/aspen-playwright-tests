import { test, expect, Page, Locator } from '@playwright/test';
import { config } from './config';

export class HeaderMenu {
    readonly loginButton: Locator;
    readonly hamburgerButton: Locator;
    readonly userAccountButton: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.loginButton = page.locator('#loginLink');
        this.hamburgerButton = page.locator('#header-menu-dropdown');
        this.userAccountButton = page.locator('#account-menu-dropdown');
        this.logoutButton = page.locator('#header-menu').locator('#logoutLink');
    }

    async signIn() {
        await test.step('Opening login modal', async () => {
            await this.loginButton.click();
        });
    }

    async verifyLogin() {
        await test.step('Verifying successful login', async () => {
            await expect(this.userAccountButton).toBeVisible();
        });
    }

    async logout() {
        await test.step('Opening the header menu dropdown', async () => {
            await this.hamburgerButton.isVisible();
            await this.hamburgerButton.click();
        });
        await test.step('Clicking the sign out button', async () => {
            await this.logoutButton.click();
            await this.loginButton.isVisible();
        });
        await test.step('Verifying successful logout', async () => {
            await expect(this.loginButton).toBeVisible();
        });
    }
}

export class Modal {
    readonly title: Locator;
    readonly body: Locator;
    readonly alert: Locator;
    readonly footer: Locator;
    readonly buttons: Locator;
    readonly close: Locator;

    constructor(page: Page) {
        this.title = page.locator('.modal-title');
        this.body = page.locator('.modal-body');
        this.alert = page.locator('.modal-body .alert')
        this.footer = page.locator('.modal-footer');
        this.buttons = page.locator ('.modal-buttons')
        this.close = page.locator('#modalCloseButton');
    }
}

export class LoginForm {
    readonly username: Locator;
    readonly password: Locator;
    readonly submitButton: Locator;
    readonly loginError: Locator;
    constructor(page: Page) {
        this.username = page.locator('#username');
        this.password = page.locator('#password');
        this.submitButton = page.locator('#loginFormSubmit');
        this.loginError = page.locator('#loginError');
    }

    async login(pass: string) {
        await test.step('Entering patron credentials', async () => {
            await this.username.fill(config.siteData.patron.username);
            await this.password.fill(pass);
        });
        await test.step('Clicking Sign In button', async () => {
            await this.submitButton.click();
        });
    }
}