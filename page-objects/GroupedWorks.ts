import { test, expect, Page, Locator } from '@playwright/test';
import { BasePage } from "./BasePage";

export class GroupedWorkView extends BasePage {
    readonly placeHoldButton: Locator;

    constructor(page: Page) {
        super(page);
        this.placeHoldButton = page.getByRole('link', { name: 'Place Hold' });
    }
    
    async open(id: string) {
        await test.step('Navigating to Grouped Work page', async () => {
            await this.page.goto(`/GroupedWork/${id}`)
        });
    }

    async placeHold() {
        await test.step('Placing hold on first item', async () => {
            await this.placeHoldButton.click();
            await expect(this.modal.body).toBeVisible();
        });
    }
}

export class HoldRequest extends BasePage {
    readonly requestButton: Locator;
    readonly autologout: Locator;
    readonly holdProcessing: Locator;
    readonly holdTypes: Locator;
    readonly holdTypeItem: Locator;
    readonly itemDropdown: Locator;
    readonly volumeDropdown: Locator;
    readonly volumeRequestButton: Locator;

    constructor(page: Page) {
        super(page);
        this.requestButton = page.locator('#requestTitleButton');
        this.autologout = page.locator('#autologout');
        this.holdProcessing = page.locator('#placingHoldMessage');
        this.holdTypes = page.locator('#holdTypeSelection');
        this.holdTypeItem = page.locator('#holdTypeItem');
        this.itemDropdown = page.locator('#selectedItem');
        this.volumeDropdown = page.locator('#selectedVolume');
        this.volumeRequestButton = page.locator(`a[onclick*="placeVolumeHold(this);"]`);
    }

    async disableAutologout() {
        if (await this.autologout.isVisible()) {
            await test.step('Unchecking autologout option', async () => {
                await this.autologout.uncheck();
            });
        }
    }

    async submitHoldRequest() {
        await test.step('Submitting hold request', async () => {
            await this.requestButton.click();
        });
    }

    async submitVolumeHoldRequest() {
        await test.step('Submitting hold request', async () => {
            await this.volumeRequestButton.click();
        });
    }

    async selectItem() {
        await test.step('Selecting first item in the dropdown', async () => {
            await this.itemDropdown.selectOption({ index: 1 });
        });
    }

    async selectVolume() {
        await test.step('Selecting first volume in the dropdown', async () => {
            await this.itemDropdown.selectOption({ index: 1 });
        });
    }

    async completeItemRequest() {
        if (await this.holdTypes.isVisible()) {
            console.log('Mixed hold types found. Checking Specific Item option.');
            await this.holdTypeItem.check();
        }

        if (await this.volumeDropdown.isVisible()) {
            console.log('Volume selectors found. Using volume hold workflow.');
            await this.selectVolume();
            await this.disableAutologout();
            await this.submitVolumeHoldRequest();
        } else {
            console.log('No volume selectors found. Using item-level hold workflow.');
            await this.selectItem();
            await this.disableAutologout();
            await this.submitHoldRequest();
        }
    }

    async verifyHoldSuccess() {
        await test.step('Verifying hold success', async () => {
            await expect(this.holdProcessing).toBeHidden();
            await expect(this.modal.alert.first()).toContainClass('alert-success');
            await (this.modal.close).click();
        });
    }
}