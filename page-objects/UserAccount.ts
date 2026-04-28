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

    private async getHoldSelector(id: string): Promise<string> {
        const ils = config.siteData.catalog.ils;

        if (ils === 'symphony') {
            // Strip leading 'a' value from Symphony bibRecordId
            const numericId = id.replace(/^a/, '');
            return `[class*="ilsHold_${numericId}"]`;
        } else if (ils === 'evergreen') {
            // For Evergreen, we can't predict the selector from the bibRecordId
            // so grab the first hold row's class dynamically
            const holdRow = this.page.locator('[class*="ilsHold_"]').first();
            const classAttr = await holdRow.getAttribute('class');
            const match = classAttr?.match(/ilsHold_(\d+)/);
            if (match) {
                return `[class*="ilsHold_${match[1]}"]`;
            }
            throw new Error('Could not determine Evergreen hold selector');
        } //else if (ils === 'sierra') {
            // Strip leading '.' value from Sierra bibRecordId
           // const strippedId = id.replace(/^./, '');
           // return `[class*="ilsHold_${strippedId}"]`;
        //}

        return `[class*="ilsHold_${id}"]`;
    }

    async findRequestedTitle(id: string, title: string) {
        await test.step('Verifying requested item is in holds list', async () => {
            // Wait for AJAX request to load all holds
            await this.page.waitForResponse(response => {
                return response.url().includes('/MyAccount/AJAX?method=getHolds&source=all') && response.status() === 200;
            });

            const holdSelector = await this.getHoldSelector(id);
            await expect(this.page.locator(holdSelector).locator('.result-title')).toContainText(`${title}`)
        });
    }

    async initFreeze(id: string) {
        const holdSelector = await this.getHoldSelector(id);
        await expect(this.page.locator(holdSelector).locator('.freezeButton')).toBeVisible({ timeout: 15000 });
        await this.page.locator(holdSelector).locator('.freezeButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initThaw(id: string) {
        const holdSelector = await this.getHoldSelector(id);
        await expect(this.page.locator(holdSelector).locator('.thawButton')).toBeVisible();
        await this.page.locator(holdSelector).locator('.thawButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initPickupChange(id: string) {
        const holdSelector = await this.getHoldSelector(id);
        await expect(this.page.locator(holdSelector).locator('.changePickupLocationButton')).toBeVisible();
        await this.page.locator(holdSelector).locator('.changePickupLocationButton').click();
        await expect(this.modal.body).toBeVisible();
    }

    async initCancel(id: string) {
        const holdSelector = await this.getHoldSelector(id);
        await expect(this.page.locator(holdSelector).locator('.cancelButton')).toBeVisible();
        await this.page.locator(holdSelector).locator('.cancelButton').click();
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
            await expect(this.page.locator('.frozenHold')).toBeVisible();
        });
    }

    async confirmThaw() {
        await test.step('Verifying successful thaw', async () => {
            await this.modal.alert.isVisible();
            await expect(this.modal.alert.first()).toContainClass('alert-success');
        });
        await test.step('Verifying hold no longer indicates frozen status', async () => {
            await this.modal.close.click();
            await expect(this.page.locator('.frozenHold')).toBeHidden();
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