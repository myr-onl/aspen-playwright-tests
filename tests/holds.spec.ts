import { test } from '@playwright/test';
import { config } from '../lib/config';
import { GroupedWorkView, HoldRequest } from "../page-objects/GroupedWorks";
import { TitlesOnHold, HoldModals } from "../page-objects/UserAccount";

test.use({
    // Use desktop viewport sizes to help Playwright grab all selectors
    viewport: { width: 1920, height: 1080 },
});

// NOTE: These tests are not currently designed to run across several browsers simultaneously.
// Run within different environments one at a time.
test.describe('Holds Suite', () => {
    let groupedWork: GroupedWorkView;
    let holds: TitlesOnHold;
    let request: HoldRequest;
    let holdOption: HoldModals;

    test.beforeEach(async ({page}) => {
        groupedWork = new GroupedWorkView(page);
        holds = new TitlesOnHold(page);
        request = new HoldRequest(page);
        holdOption = new HoldModals(page);
    });

    test('Clear any existing holds', async ({ page }) => {
        // Log in and go to Holds page
        await groupedWork.goHome();
        await groupedWork.menu.signIn();
        await groupedWork.loginForm.login(config.siteData.patron.password);
        await groupedWork.menu.verifyLogin();
        await holds.goTo('/MyAccount/Holds');
        await holds.refresh();
        // Wait for AJAX request to load all holds
        await page.waitForResponse(response => {
            return response.url().includes('/MyAccount/AJAX?method=getHolds&source=all') && response.status() === 200;
        });

        // Click 'Cancel All Pending' if holds exist
        const holdRows = await page.locator('[class*="ilsHold_"]');
        const count = await holdRows.count();
        if (count === 0) {
            console.log('No holds to cancel.');
            return;
        }

        const cancelAllLinks = page.locator('a', { hasText: 'Cancel All Pending' });
        if (await cancelAllLinks.first().isVisible()) {
            await cancelAllLinks.first().click();
            // Wait for the confirmation modal and click the correct button
            const confirmCancelAllButton = page.locator('.modal-buttons .tool.btn.btn-primary');
            await confirmCancelAllButton.waitFor({ state: 'visible', timeout: 5000 });
            await confirmCancelAllButton.click();
            // Wait for success alert
            await page.waitForSelector('.modal-body .alert.alert-success', { timeout: 5000 });
            await holds.refresh();
        } else {
            console.log('Cancel All Pending link not found.');
        }
    });

    test('Place Bib-Level Hold', async ({}) => {
        await test.step('Sign in with valid user', async () => {
            await groupedWork.open(config.siteData.holdItem.groupedWorkId);
            await groupedWork.menu.signIn();
            await groupedWork.loginForm.login(config.siteData.patron.password);
        });

        await groupedWork.placeHold(config.siteData.holdItem);
        await request.disableAutologout();
        await request.submitHoldRequest();
        await request.verifyHoldSuccess();

        await test.step('Go to Titles on Hold', async () => {
            await holds.goTo('/MyAccount/Holds');
            await holds.refresh();
            await holds.findRequestedTitle(config.siteData.holdItem.bibRecordId, config.siteData.holdItem.title);
        });

        await test.step('Freeze hold', async () => {
            await holds.initFreeze(config.siteData.holdItem.bibRecordId);
            await holdOption.setReactivationDate();
            await holdOption.confirmFreeze();
        });

        await test.step('Thaw hold', async () => {
            await holds.initThaw(config.siteData.holdItem.bibRecordId);
            await holdOption.confirmThaw();
        });

        await test.step('Change pickup location', async () => {
            await holds.initPickupChange(config.siteData.holdItem.bibRecordId);
            await holdOption.selectPickupLocation();
            await holdOption.confirmPickupLocation();
        });

        await test.step('Cancel hold', async () => {
            await holds.initCancel(config.siteData.holdItem.bibRecordId);
            await holdOption.confirmCancel();
        });
    });

    test('Place Volume or Item-Level Hold', async ({}) => {
        test.skip(!config.volumeHoldsEnabled, 'SKIPPED: Volume holds are disabled in the .env configuration.');
        await test.step('Sign in with valid user', async () => {
            await groupedWork.open(config.siteData.volumeHoldItem.groupedWorkId);
            await groupedWork.menu.signIn();
            await groupedWork.loginForm.login(config.siteData.patron.password);
        });

        await groupedWork.placeHold(config.siteData.volumeHoldItem);
        await request.completeItemRequest();
        await request.verifyHoldSuccess();

        await test.step('Go back to Titles on Hold', async () => {
            await holds.goTo('/MyAccount/Holds');
            await holds.refresh();
            await holds.findRequestedTitle(config.siteData.volumeHoldItem.bibRecordId, config.siteData.volumeHoldItem.title);
        });

        await test.step('Freeze volume hold', async () => {
            await holds.initFreeze(config.siteData.volumeHoldItem.bibRecordId);
            await holdOption.setReactivationDate();
            await holdOption.confirmFreeze();
        });

        await test.step('Thaw volume hold', async () => {
            await holds.initThaw(config.siteData.volumeHoldItem.bibRecordId);
            await holdOption.confirmThaw();
        });

        await test.step('Change volume pickup location', async () => {
            await holds.initPickupChange(config.siteData.volumeHoldItem.bibRecordId);
            await holdOption.selectPickupLocation();
            await holdOption.confirmPickupLocation();
        });

        await test.step('Cancel volume hold', async () => {
            await holds.initCancel(config.siteData.volumeHoldItem.bibRecordId);
            await holdOption.confirmCancel();
        });
    });
});