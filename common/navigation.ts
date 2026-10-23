import { test, expect, Page } from '@playwright/test';

// Go to specified path
export async function goTo(page: Page, path: string) {
    await test.step(`Navigating to ${path}`, async () => {
        await page.goto(path);
        await expect(page.locator('#header-menu-dropdown')).toBeVisible();
    });
}

// Go to Grouped Work page
export async function openGroupedWork(page: Page, id: string) {
    await test.step('Navigating to Grouped Work page', async () => {
        await page.goto(`/GroupedWork/${id}`);
    });
}

// Go to Record page
export async function openRecord(page: Page, urlComponent: string, id: string) {
    await test.step('Navigating to Record page', async () => {
        await page.goto(`/${urlComponent}/${id}`);
    });
}

// Go to a user list page
export async function openList(page: Page, id: string) {
    await test.step('Navigating to list page', async () => {
        await page.goto(`/MyAccount/MyList/${id}`);
    });
}