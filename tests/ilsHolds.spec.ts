import { test, Page, TestInfo } from '@playwright/test';
import * as site from '../common/config';
import * as nav from '../common/navigation';
import * as header from '../common/header';
import * as holds from '../domains/holds';

// Helper functions
async function goToHolds(page: Page, testInfo: TestInfo) {
    const { patron } = site.getProfile(testInfo.project.name);
    await nav.goTo(page, '/');
    await header.openLoginModal(page);
    const loginBody = await header.loginUser(page, patron.username, patron.password);
    await header.verifyLoginResponse(page, loginBody, true);

    // Listen before navigating so the holds list response can't be missed
    const holdsLoaded = page.waitForResponse(r => r.url().includes('method=getHolds'));
    await nav.goTo(page, '/MyAccount/Holds');
    await holdsLoaded;
}

// Bib holds suite tests
test.describe.serial('Bib-Level Holds', () => {
    let holdItem: site.HoldItem;

    test.beforeEach(async ({}, testInfo) => {
        holdItem = site.getProfile(testInfo.project.name).holdItem;
    });

    test('Place bib-level hold', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        //await holds.cancelAllPendingHolds(page);
        await nav.openGroupedWork(page, holdItem.groupedWorkId);
        const body = await holds.placeHold(page, holdItem, false);
await holds.verifyHoldResponse(page, body, true);
    });

    test('Verify hold appears in account', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.refreshHolds(page);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
    });

    test('Freeze hold with reactivation date', async ({ page }, testInfo) => {
        test.skip(!site.config.run.freezeHolds, 'SKIPPED: Freezing holds disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        await holds.initFreeze(page, 'ils', holdItem.recordId);
        await holds.setReactivationDate(page);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', holdItem.recordId, body, true);
    });

    test('Change Reactivation Date', async ({ page }, testInfo) => {
        test.skip(!site.config.run.freezeHolds, 'SKIPPED: Freezing holds disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        await holds.initFreeze(page, 'ils', holdItem.recordId);
        await holds.changeReactivationDate(page);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', holdItem.recordId, body, true);
    });

    test('Thaw hold', async ({ page }, testInfo) => {
        test.skip(!site.config.run.freezeHolds, 'SKIPPED: Freezing holds disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        const body = await holds.initThaw(page, 'ils', holdItem.recordId);
        await holds.verifyThawResponse(page, 'ils', holdItem.recordId, body, true);
    });

    test('Freeze hold without reactivation date', async ({ page }, testInfo) => {
        test.skip(!site.config.run.freezeHolds, 'SKIPPED: Freezing holds disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        await holds.initFreeze(page, 'ils', holdItem.recordId);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', holdItem.recordId, body, true);
        // Unthaw again to show Cancel Hold button for ILSes like Symphony
        const thawBody = await holds.initThaw(page, 'ils', holdItem.recordId);
        await holds.verifyThawResponse(page, 'ils', holdItem.recordId, thawBody, true);
    });

    test('Change pickup location', async ({ page }, testInfo) => {
        test.skip(!site.config.run.changePickup, 'SKIPPED: Pickup changes disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        await holds.initPickupChange(page, 'ils', holdItem.recordId);
        await holds.selectPickupLocation(page);
        const body = await holds.submitPickupChange(page);
        await holds.verifyPickupChangeResponse(page, body, true);
    });

    test('Cancel hold', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', holdItem.recordId, holdItem.title);
        await holds.initHoldCancellation(page, 'ils', holdItem.recordId);
        const body = await holds.submitHoldCancellation(page);
        await holds.verifyHoldCancellationResponse(page, body, true);
    });
});

// Volume or item holds suite tests
test.describe.serial('Volume-Level or Item-Level Holds', () => {
    let volumeHoldItem: site.HoldItem;

    test.beforeEach(async ({}, testInfo) => {
        const profile = site.getProfile(testInfo.project.name);
        if (!profile.volumeHoldItem) {
            test.skip(!site.config.run.volumeHolds, 'SKIPPED: Volume holds disabled in site config.');
        }
        volumeHoldItem = profile.volumeHoldItem!;
    });

    test('Place volume hold', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        // await holds.cancelAllPendingHolds(page);
        await nav.openGroupedWork(page, volumeHoldItem.groupedWorkId);
        const body = await holds.placeHold(page, volumeHoldItem, true);
        await holds.verifyHoldResponse(page, body, true);
    });

    test('Verify volume hold appears in account', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.refreshHolds(page);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
    });

    test('Freeze volume hold with reactivation date', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.initFreeze(page, 'ils', volumeHoldItem.recordId);
        await holds.setReactivationDate(page);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', volumeHoldItem.recordId, body, true);
    });

    test('Change Reactivation Date', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
        await holds.initFreeze(page, 'ils', volumeHoldItem.recordId);
        await holds.changeReactivationDate(page);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', volumeHoldItem.recordId, body, true);
    });

    test('Thaw volume hold', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
        const body = await holds.initThaw(page, 'ils', volumeHoldItem.recordId);
        await holds.verifyThawResponse(page, 'ils', volumeHoldItem.recordId, body, true);
    });

    test('Freeze volume hold without reactivation date', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
        await holds.initFreeze(page, 'ils', volumeHoldItem.recordId);
        const body = await holds.submitFreeze(page);
        await holds.verifyFreezeResponse(page, 'ils', volumeHoldItem.recordId, body, true);
        // Unthaw again to show Cancel Hold button for ILSes like Symphony
        const thawBody = await holds.initThaw(page, 'ils', volumeHoldItem.recordId);
        await holds.verifyThawResponse(page, 'ils', volumeHoldItem.recordId, thawBody, true);
    });

    test('Change volume pickup location', async ({ page }, testInfo) => {
        test.skip(!site.config.run.changePickup, 'SKIPPED: Pickup change disabled in site config.');
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
        await holds.initPickupChange(page, 'ils', volumeHoldItem.recordId);
        await holds.selectPickupLocation(page);
        const body = await holds.submitPickupChange(page);
        await holds.verifyPickupChangeResponse(page, body, true);
    });

    test('Cancel volume hold', async ({ page }, testInfo) => {
        await goToHolds(page, testInfo);
        await holds.findRequestedItem(page, 'ils', volumeHoldItem.recordId, volumeHoldItem.title);
        await holds.initHoldCancellation(page, 'ils', volumeHoldItem.recordId);
        const body = await holds.submitHoldCancellation(page);
        await holds.verifyHoldCancellationResponse(page, body, true);
    });
});