import { test, expect, Page } from '@playwright/test';
import { HeaderMenu, LoginForm, Modal } from '../lib/components';

export class BasePage {
    readonly page: Page;
    readonly menu: HeaderMenu;
    readonly loginForm: LoginForm;
    readonly modal: Modal;

    constructor(page: Page) {
        this.page = page;
        this.menu = new HeaderMenu(page);
        this.loginForm = new LoginForm(page);
        this.modal = new Modal(page);
    }

    async goHome() {
        await test.step('Navigating to home page', async () => {
            await this.page.goto('/');
        });
    }

    async goTo(path: string) {
        await test.step(`Navigating to ${path}`, async () => {
            await this.page.goto(path);
            await expect(this.menu.hamburgerButton).toBeVisible();
        });
    }
}