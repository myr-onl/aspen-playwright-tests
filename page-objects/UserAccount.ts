import { test, expect, Page, Locator } from '@playwright/test';
import { BasePage } from "./BasePage";
import { config } from "../lib/config";

export class TitlesOnHold extends BasePage {
    readonly refreshButton: Locator;
    readonly resultTitle: Locator;
    readonly cancelHoldButton: Locator;
    readonly freezeHoldButton: Locator;
    readonly frozenStatus: Locator;
    readonly thawHoldButton: Locator;
    readonly changePickupButton: Locator;

    constructor(page: Page) {
        super(page);
        this.refreshButton = page.getByTitle('Refresh');
        this.resultTitle = page.locator('.result-title');
        this.cancelHoldButton = page.locator('.cancelButton');
        this.freezeHoldButton = page.locator('.freezeButton');
        this.frozenStatus = page.locator('.frozenHold');
        this.thawHoldButton = page.locator('.thawButton');
        this.changePickupButton = page.locator ('.changePickupLocationButton');
    }

    async refresh() {
        if (config.manualRefreshEnabled) {
            await this.refreshButton.click();
            await expect(this.refreshButton).toBeVisible();
        } else {
            console.log('Skipped: Manual refresh disabled in .env')
        }
    }

    async findRequestedTitle(title: string) {
        await test.step('Verifying requested item is in holds list', async () => {
            await expect(this.resultTitle.first()).toContainText(`${title}`)
        });
    }

    async initFreeze() {
        await expect(this.freezeHoldButton.first()).toBeVisible({ timeout: 15000 });
        await this.freezeHoldButton.first().click();
        await expect(this.modal.body).toBeVisible();
    }

    async initThaw() {
        await expect(this.thawHoldButton.first()).toBeVisible();
        await this.thawHoldButton.first().click();
        await expect(this.modal.body).toBeVisible();
    }

    async initPickupChange() {
        await expect(this.changePickupButton.first()).toBeVisible();
        await this.changePickupButton.first().click();
        await expect(this.modal.body).toBeVisible();
    }

    async initCancel() {
        await expect(this.cancelHoldButton.first()).toBeVisible();
        await this.cancelHoldButton.first().click();
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

    async confirmFreeze() {
        await test.step('Confirming thaw date', async () => {
            await this.confirmFreezeButton.click();
        });

        await test.step('Verifying hold indicates frozen status', async () => {
            await expect(this.frozenStatus.first()).toBeVisible({ timeout: 10000 });
        });
    }

    async confirmThaw() {
        await test.step('Verifying successful thaw', async () => {
            await this.modal.alert.isVisible();
            await expect(this.modal.alert.first()).toContainClass('alert-success');
        });
        await test.step('Verifying hold no longer indicates frozen status', async () => {
            await this.modal.close.click();
            await expect(this.frozenStatus.first()).toBeHidden({ timeout: 10000 });
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