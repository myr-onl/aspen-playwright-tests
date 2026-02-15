import { test, expect } from '@playwright/test';
import { BasePage } from "../page-objects/BasePage";
import { config } from '../lib/config';

test.describe('Basic Operations Suite', () => {
    let base: BasePage;

    test.beforeEach(async ({page}) => {
        base = new BasePage(page);
        await base.goHome();
        await base.menu.signIn();
    });

    test('User login with invalid credentials', async ({}) => {
        await base.loginForm.login(config.siteData.patron.invalidPassword);
        await test.step('Verifying user is not signed in', async () => {
            await expect(base.loginForm.loginError).toBeVisible();
        });
    });

    test('User login with valid credentials', async ({}) => {
        await base.loginForm.login(config.siteData.patron.password);
        await base.menu.verifyLogin();
        await base.menu.logout();
    });
});