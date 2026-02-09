import {test, expect} from '@playwright/test';
import {HomePage, LoginModal} from '../page-objects/Home';
import {config} from '../lib/config';

test.describe('User authentication operations', () => {
    let home: HomePage;
    let modal: LoginModal;

    test.beforeEach(async ({page}) => {
        home = new HomePage(page);
        modal = new LoginModal(page);
        await home.open();
        await home.openLoginModal();
    });

    test('User login with valid credentials via the modal', async ({page}) => {
        await modal.login(config.siteData.patron.username, config.siteData.patron.password);
        await test.step('Verify that the user account dropdown has replaced the sign in button', async () => {
            await expect(page.locator('#account-menu-dropdown')).toBeVisible();
        });
        await home.logout();
        await test.step('Verify that the Sign In button is visible again', async () => {
            await expect(page.locator('#loginLink')).toBeVisible();
        });
    });

    test('User login with invalid credentials via the modal', async ({page}) => {
        await modal.login(config.siteData.patron.username, config.siteData.patron.invalidPassword);
        await test.step('Verify that the user is not signed in', async () => {
            await expect(page.locator('#loginError')).toBeVisible();
        });
    });
});