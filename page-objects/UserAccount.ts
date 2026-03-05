import { test, expect, Page, Locator } from '@playwright/test';
import { BasePage } from "./BasePage";
import { config } from "../lib/config";

export class TitlesOnHold extends BasePage {
    readonly refreshButton: Locator;

    constructor(page: Page) {
        super(page);
        this.refreshButton = page.getByTitle('Refresh');
    }

    async refresh() {
        if (config.manualRefreshEnabled) {
            await this.refreshButton.click();
            await expect(this.refreshButton).toBeVisible();
        } else {
            console.log('Skipped: Manual refresh disabled in .env')
        }
    }

    async findRequestedTitle(id: string, title: string) {
        await test.step('Verifying requested item is in holds list', async () => {
            await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.result-title')).toContainText(`${title}`)
        });
    }

    async initFreeze(id: string) {
        await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.freezeButton')).toBeVisible({ timeout: 15000 });
        await this.page.locator(`[class*="ilsHold_${id}"]`).locator('.freezeButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initThaw(id: string) {
        await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.thawButton')).toBeVisible();
        await this.page.locator(`[class*="ilsHold_${id}"]`).locator('.thawButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initPickupChange(id: string) {
        await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.changePickupLocationButton')).toBeVisible();
        await this.page.locator(`[class*="ilsHold_${id}"]`).locator('.changePickupLocationButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initCancel(id: string) {
        await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.cancelButton')).toBeVisible();
        await this.page.locator(`[class*="ilsHold_${id}"]`).locator('.cancelButton').click();
        await expect(this.modal.body).toBeVisible();
    }
}

export class HoldModals extends TitlesOnHold {
    readonly confirmCancelButton: Locator;
    readonly reactivationDate: Locator;
    readonly confirmFreezeButton: Locator;
    readonly selectPickupButton: Locator;
    readonly confirmChangePickupButton: Locator;

    constructor(page: Page) {
        super(page);
        this.confirmCancelButton = page.locator('.confirmCancelButton');
        this.reactivationDate = page.locator('#reactivationDate');
        this.confirmFreezeButton = page.locator('#doFreezeHoldWithReactivationDate');
        this.selectPickupButton = page.locator('#newPickupLocation');
        this.confirmChangePickupButton = page.locator('.modal-buttons .tool.btn.btn-primary');
    }

    async setReactivationDate() {
        await test.step('Entering date to thaw hold', async () => {
            // Always select a date that is 28 days after the current date
            const date = new Date();
            date.setDate(date.getDate() + 28);
            const formattedDate = date.toISOString().split('T')[0];

            await expect(this.reactivationDate).toBeVisible();
            await this.reactivationDate.fill(formattedDate);
        });
    }

    async confirmFreeze(id: string) {
        await test.step('Confirming thaw date', async () => {
            await this.confirmFreezeButton.click();
        });

        await test.step('Verifying hold indicates frozen status', async () => {
            await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.frozenHold')).toBeVisible();
        });
    }

    async confirmThaw(id: string) {
        await test.step('Verifying successful thaw', async () => {
            await this.modal.alert.isVisible();
            await expect(this.modal.alert.first()).toContainClass('alert-success');
        });
        await test.step('Verifying hold no longer indicates frozen status', async () => {
            await this.modal.close.click();
            await expect(this.page.locator(`[class*="ilsHold_${id}"]`).locator('.frozenHold')).toBeHidden();
        });
    }

    async selectPickupLocation() {
        await test.step('Selecting first alt pickup location in the dropdown', async () => {
            await this.selectPickupButton.selectOption({index: 1});
        });
    }

    async confirmPickupLocation() {
        await test.step('Confirming new pickup location', async () => {
            await this.confirmChangePickupButton.click();
        });

        await test.step('Verifying successful pickup change', async () => {
            await this.modal.body.isVisible();
            await expect(this.modal.title).toContainText('Success');
            await this.modal.close.click();
            await this.modal.body.isHidden();
        });
    }

    async confirmCancel() {
        await test.step('Confirming hold cancellation', async () => {
            await expect(this.confirmCancelButton).toBeVisible();
            await this.confirmCancelButton.click();
        });

        await test.step('Verifying successful cancellation', async () => {
            await this.modal.alert.isVisible();
            await expect(this.modal.alert.first()).toContainClass('alert-success');
            await this.modal.close.click();
            await this.modal.body.isHidden();
        });
    }
}