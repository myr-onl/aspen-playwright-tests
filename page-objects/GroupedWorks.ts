import { test, expect, Page, Locator } from '@playwright/test';
import { BasePage } from "./BasePage";

type HoldItem = {
    title: string;
    format: string;
    bibRecordId: string;
    groupedWorkId: string;
};

export class GroupedWorkView extends BasePage {
    readonly horizontalGroupedWork: Locator;

    constructor(page: Page) {
        super(page);
        this.horizontalGroupedWork = page.locator('.formatDisplayHorizontal');
    }

    async open(id: string) {
        await test.step('Navigating to Grouped Work page', async () => {
            await this.page.goto(`/GroupedWork/${id}`)
        });
    }

    async placeHold(item: HoldItem) {
        await test.step("Placing hold on item", async () => {
            // Check for the horizontal grouped works layout
            const isHorizontal = (await this.horizontalGroupedWork.count()) > 0;

            if (isHorizontal) {
                console.log("Horizontal layout detected. Using horizontal layout selectors.");
                // Select the item's target format and wait for data to load
                await this.page.locator(`.slider-slide[data-workid="${item.groupedWorkId}"][data-format="${item.format}"]`).click();
                await expect(this.page.locator('.result-label').getByRole('link', { name: `${item.format}` })).toBeVisible({timeout:15000});
                // If the big hold button applies to your bib, click it
                if (await this.page.locator(`#firstRecordactionButton${item.bibRecordId}`).isVisible()) {
                    await this.page.locator(`#firstRecordactionButton${item.bibRecordId}`).click();
                } else {
                    // Expand editions to find your bib's hold button
                    console.log("Opening Show Editions to find the bib Place Hold button...");
                    await this.page.locator(`#horizDisplayShowEditionsRow_${item.groupedWorkId}`).locator('.horizDisplayShowEditionsBtn').click();
                    await this.page.locator(`#relatedRecordactionButton${item.bibRecordId}`).click();
                }
            } else {
                console.log("Horizontal layout not detected. Using vertical layout selectors.");
                // If the big hold button applies to your bib, click it
                if (await this.page.locator(`#actionButton${item.bibRecordId}`).isVisible()) {
                    await this.page.locator(`#actionButton${item.bibRecordId}`).click();
                } else {
                    // Expand editions to find your bib's hold button, click it
                    await this.page.locator(`[id^="manifestation-toggle-text-${item.groupedWorkId}_${item.format}"]`).click();
                    await this.page.locator(`#relatedRecordactionButton${item.bibRecordId}`).click();
                }
            }
            // Verify that the modal pops
            await expect(this.modal.body).toBeVisible();
        });
    }
}

export class HoldRequest extends GroupedWorkView {
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
            await this.volumeDropdown.selectOption({ index: 1 });
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