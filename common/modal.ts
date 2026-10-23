import { test, expect, Page } from '@playwright/test';

// ── Locators ──
// Use modal(page).body, modal(page).alert, etc. when you need
// to assert on modal elements directly in a test.

export function modal(page: Page) {
    return {
        title: page.locator('.modal-title'),
        body: page.locator('.modal-body'),
        alert: page.locator('.modal-body .alert'),
        footer: page.locator('.modal-footer'),
        buttons: page.locator('.modal-buttons'),
        close: page.locator('#modalCloseButton'),
        primaryButton: page.locator('.modal-buttons .tool.btn.btn-primary'),
    };
}

// ── Actions ──

export async function closeModal(page: Page) {
    await page.locator('#modalCloseButton').click();
}