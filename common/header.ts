import { test, expect, Page } from '@playwright/test'
import { clickAndCaptureJson } from './network';

// Auth
export async function openLoginModal(page: Page) {
    await test.step('Opening login modal', async () => {
        await page.locator('#loginLink').click();
        await page.waitForResponse(response => {
            return response.url().includes('method=getLoginForm') && response.status() === 200;
        });
        await expect(page.locator('#username')).toBeVisible();
    });
}

export async function loginUser(page: Page, username: string, password: string) {
    await test.step('Entering patron credentials', async () => {
        await page.locator('#username').click();
        await page.locator('#username').fill(username);
        await page.locator('#password').click();
        await page.locator('#password').fill(password);
    });

    const body = await test.step('Submitting login form', async () => {
        return clickAndCaptureJson(page, page.locator('#loginFormSubmit'), 'method=loginUser');
    });
    return body;
}

export async function verifyLoginResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server login response', async () => {
        expect(body.result.success).toBe(expectedSuccess);
    });

    if (expectedSuccess) {
        await test.step('Verifying user appears signed in', async () => {
            await expect(page.locator('#account-menu-dropdown')).toBeVisible();
        });
    } else {
        await test.step('Verifying user sees a failure message', async () => {
            const error = page.locator('#loginError');
            await expect(error).toBeVisible();
            await expect(error).toContainClass('alert-danger');
            await expect(error).not.toContainClass('alert-success');
        });
    }
}

export async function logoutUser(page: Page) {
    await test.step('Opening the header menu dropdown', async () => {
        await page.locator('#header-menu-dropdown').click();
    });
    await test.step('Clicking the sign out button', async () => {
        await page.locator('#header-menu').locator('#logoutLink').click();
    });
    await test.step('Verifying successful logout', async () => {
        await expect(page.locator('#loginLink')).toBeVisible();
    });
}