import { test } from '@playwright/test';
import { getProfile } from '../common/config';
import * as nav from '../common/navigation';
import * as header from '../common/header';

test.describe('Authorization with login form modal', () => {
    test.beforeEach(async ({ page }) => {
        await nav.goTo(page, '/');
        await header.openLoginModal(page);
    });

    test('User login with invalid credentials', async ({ page }, testInfo) => {
        const { patron } = getProfile(testInfo.project.name);
        const body = await header.loginUser(page, patron.username, patron.invalidPassword);
        await header.verifyLoginResponse(page, body, false);
    });

    test('User login with valid credentials', async ({ page }, testInfo) => {
        const { patron } = getProfile(testInfo.project.name);
        const body = await header.loginUser(page, patron.username, patron.password);
        await header.verifyLoginResponse(page, body, true);
        await header.logoutUser(page);
    });
});

/* test.describe('Authorization with login page', () => {
    test.beforeEach(async ({ page }) => {
        await nav.goTo(page, '/MyAccount/Login');
    });

    test('User login with invalid credentials', async ({ page }, testInfo) => {
        const { patron } = getProfile(testInfo.project.name);
        const body = await header.loginUser(page, patron.username, patron.invalidPassword);
        await header.verifyLoginResponse(page, body, false);
    });

    test('User login with valid credentials', async ({ page }, testInfo) => {
        const { patron } = getProfile(testInfo.project.name);
        const body = await header.loginUser(page, patron.username, patron.password);
        await header.verifyLoginResponse(page, body, true);
        await header.logoutUser(page);
    });
}); */