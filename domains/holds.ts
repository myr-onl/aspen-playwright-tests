import { test, expect, Page, Locator } from '@playwright/test';
import { config, HoldItem, Patron } from '../common/config';
import { modal } from '../common/modal';
import { clickAndCaptureJson } from '../common/network';

// One hold's row on the Titles on Hold page
function holdRow(page: Page, source: string, id: string) {
    return page.locator(`[data-record-type="${source}"][data-record-id="${id}"]`);
}

// Finds the target record's Place Hold button regardless of layout
// Will option Show Editions to find the right record number if necessary
async function findHoldButton(page: Page, item: HoldItem): Promise<Locator> {
    const isHorizontal = (await page.locator('.formatDisplayHorizontal').count()) > 0;

    if (isHorizontal) {
        console.log('Horizontal layout detected.');
        await page.locator(`.slider-slide[data-workid="${item.groupedWorkId}"][data-format="${item.format}"]`).click();
        await expect(page.locator('.result-label').getByRole('link', { name: `${item.format}` })).toBeVisible({ timeout: 15000 });

        // [id="..."] instead of #id: Sierra record IDs can contain dots (e.g. ".b16329958")
        const firstButton = page.locator(`[id="firstRecordactionButton${item.recordId}"]`).first();
        if (await firstButton.isVisible()) return firstButton;

        console.log('Opening Show Editions to find the bib Place Hold button...');
        await page.locator(`#horizDisplayShowEditionsRow_${item.groupedWorkId}`).locator('.horizDisplayShowEditionsBtn').click();
        return page.locator(`[id="relatedRecordactionButton${item.recordId}"]`).first();
    }

    console.log('Vertical layout detected.');
    const mainButton = page.locator(`[id="actionButton${item.recordId}"]`).first();
    if (await mainButton.isVisible()) return mainButton;

    await page.locator(`[id^="manifestation-toggle-text-${item.groupedWorkId}_${item.format}"]`).click();
    return page.locator(`[id="relatedRecordactionButton${item.recordId}"]`).first();
}

// Places a hold and returns the server's response for verifyHoldResponse.
// itemLevel: true = choose a specific item, false = regular bib-level hold
export async function placeHold(page: Page, item: HoldItem, itemLevel: boolean) {
    // Find the Place Hold button
    const holdButton = await findHoldButton(page, item);

    // Click it and wait for the form request to come back OK
    const formResponse = page.waitForResponse(r =>
        r.url().includes('method=getPlaceHoldForm') || r.url().includes('method=getPlaceHoldVolumes')
    );
    await test.step('Clicking Place Hold', async () => {
        await holdButton.click();
    });
    const formResult = await formResponse;
    expect(formResult.ok()).toBe(true);
    await expect(modal(page).body).toBeVisible();

    // If the click placed the hold directly (i.e., bypass is on), that response is used as the result
    const submitButton = page.locator('#requestTitleButton').or(page.locator('a[onclick*="placeVolumeHold(this);"]'));
    if (!(await submitButton.isVisible())) {
        console.log('No hold form. Hold was placed directly.');
        return formResult.json();
    }

    // For item-level holds, pick the first volume or item using appropriate selectors
    if (itemLevel) {
        if (await page.locator('#holdTypeSelection').isVisible()) {
            console.log('Mixed hold types found. Checking Specific Item option.');
            await page.locator('#holdTypeItem').check();
        }
        if (await page.locator('#selectedVolume').isVisible()) {
            console.log('Volume selectors found. Using volume hold workflow.');
            await test.step('Selecting first volume', async () => {
                await page.locator('#selectedVolume').selectOption({ index: 1 });
            });
        }
        if (await page.locator('#selectedItem').isVisible()) {
            console.log('No volume selectors found. Using item-level hold workflow.');
            await test.step('Selecting first item', async () => {
                await page.locator('#selectedItem').selectOption({ index: 1 });
            });
        } else {
            console.log('No volume or item selection dropdown found. Submitting request as-is.');
        }
    }

    // Submit and return the hold response
    await disableAutologout(page);
    return test.step('Submitting hold request', async () => {
        return clickAndCaptureJson(page, submitButton, ['method=placeHold', 'method=placeVolumeHold']);
    });
}

export async function disableAutologout(page: Page) {
    const autologout = page.locator('#autologout');
    if (await autologout.isVisible()) {
        await test.step('Unchecking autologout option', async () => {
            await autologout.uncheck();
        });
    }
}

export async function submitHoldRequest(page: Page) {
    const submitButton = page.locator('#requestTitleButton').or(page.locator('a[onclick*="placeVolumeHold(this);"]'));
    const body = await test.step('Submitting hold request', async () => {
        return clickAndCaptureJson(page, submitButton, ['method=placeHold', 'method=placeVolumeHold']);
    });
    return body;
}

export async function verifyHoldResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server hold response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    const alert = modal(page).alert.first();
    if (expectedSuccess) {
        await test.step('Verifying user sees a success message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-success');
            await expect(alert).not.toContainClass('alert-danger');
        });
    } else {
        await test.step('Verifying user sees a failure message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-danger');
            await expect(alert).not.toContainClass('alert-success');
        });
    }
}

// Titles on Hold
export async function refreshHolds(page: Page) {
    if (!config.run.manualRefresh) {
        console.log('SKIPPED: Manual refresh disabled in config.');
        return;
    }

    const holdsLoaded = page.waitForResponse(r => r.url().includes('method=getHolds'));
    const refreshButton = page.getByTitle('Refresh').first();
    if (await refreshButton.isVisible()) {
        await refreshButton.click();
    } else {
        await page.reload();
    }
    expect((await holdsLoaded).ok()).toBe(true);
}

export async function findRequestedItem(page: Page, source: string, id: string, title: string) {
    await test.step('Verifying requested item is in holds list', async () => {
        await expect(holdRow(page, source, id).locator('.result-title')).toContainText(title);
    });
}

// Freeze holds
export async function initFreeze(page: Page, source: string, id: string) {
    const freezeButton = holdRow(page, source, id).locator('.freezeButton').or(holdRow(page, source, id).locator('.changeActivationButton'));
    await expect(freezeButton).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=getReactivationDateForm'));
    await freezeButton.click();
    expect((await formLoaded).ok()).toBe(true);
}

export async function setReactivationDate(page: Page) {
    await test.step('Entering reactivation date', async () => {
        const date = new Date();
        date.setDate(date.getDate() + 28);
        const reactivationDate = page.locator('#reactivationDate');
        await expect(reactivationDate).toBeVisible();
        await reactivationDate.fill(date.toISOString().split('T')[0]);
    });
}

export async function changeReactivationDate(page: Page) {
    await test.step('Entering reactivation date', async () => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        const reactivationDate = page.locator('#reactivationDate');
        await expect(reactivationDate).toBeVisible();
        await reactivationDate.fill(date.toISOString().split('T')[0]);
    });
}

export async function submitFreeze(page: Page) {
    const body = await test.step('Confirming freeze', async () => {
        return clickAndCaptureJson(page, page.locator('#doFreezeHoldWithReactivationDate'), 'method=freezeHold');
    });
    return body;
}

export async function verifyFreezeResponse(page: Page, source: string, id: string, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server freeze response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    if (expectedSuccess) {
        await test.step('Verifying hold shows as frozen', async () => {
            await page.waitForResponse(r => r.url().includes('method=getHolds'));
            await expect(holdRow(page, source, id).locator('.frozenHold')).toBeVisible();
        });
    }
}

// Thaw holds
export async function initThaw(page: Page, source: string, id: string) {
    const thawButton = holdRow(page, source, id).locator('.thawButton');
    await expect(thawButton).toBeVisible();
    const body = await test.step('Thawing hold', async () => {
        return clickAndCaptureJson(page, thawButton, 'method=thawHold');
    });
    return body;
}

export async function verifyThawResponse(page: Page, source: string, id: string, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server thaw response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    const alert = modal(page).alert.first();
    if (expectedSuccess) {
        await test.step('Verifying user sees a success message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-success');
            await expect(alert).not.toContainClass('alert-danger');
        });
        await test.step('Verifying hold no longer shows as frozen', async () => {
            await modal(page).close.click();
            await expect(holdRow(page, source, id).locator('.frozenHold')).toBeHidden();
        });
    } else {
        await test.step('Verifying user sees a failure message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-danger');
            await expect(alert).not.toContainClass('alert-success');
        });
    }
}

// Change pickup location
export async function initPickupChange(page: Page, source: string, id: string) {
    const pickupButton = holdRow(page, source, id).locator('.changePickupLocationButton');
    await expect(pickupButton).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=getChangeHoldLocationForm'));
    await pickupButton.click();
    expect((await formLoaded).ok()).toBe(true);
}

export async function selectPickupLocation(page: Page) {
    await test.step('Selecting first alt pickup location', async () => {
        await page.locator('#newPickupLocation').selectOption({ index: 1 });
    });
}

export async function submitPickupChange(page: Page) {
    const body = await test.step('Submitting pickup location change request', async () => {
        return clickAndCaptureJson(page, modal(page).primaryButton, 'method=changeHoldLocation');
    });
    return body;
}

export async function verifyPickupChangeResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server pickup change response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    if (expectedSuccess) {
        await test.step('Verifying user sees a success message', async () => {
            await expect(modal(page).title).toContainText('Success');
            await modal(page).close.click();
        });
    }
    // TODO: UI check for how pickup change failures are shown
}

// Hold cancellation
export async function initHoldCancellation(page: Page, source: string, id: string) {
    const cancelButton = holdRow(page, source, id).locator('.cancelButton');
    await expect(cancelButton).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=confirmCancelHold'));
    await cancelButton.click();
    expect((await formLoaded).ok()).toBe(true);
}

export async function submitHoldCancellation(page: Page) {
    const confirmButton = page.locator('.confirmCancelButton');
    await expect(confirmButton).toBeVisible();
    const body = await test.step('Confirming hold cancellation', async () => {
        return clickAndCaptureJson(page, confirmButton, 'method=cancelHold');
    });
    return body;
}

export async function verifyHoldCancellationResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server cancellation response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    const alert = modal(page).alert.first();
    if (expectedSuccess) {
        await test.step('Verifying user sees a success message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-success');
            await expect(alert).not.toContainClass('alert-danger');
        });
    } else {
        await test.step('Verifying user sees a failure message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-danger');
            await expect(alert).not.toContainClass('alert-success');
        });
    }
}

export async function cancelAllPendingHolds(page: Page) {
    // TODO: Upstream add ids to the different sections of the Titles on Hold page,
    // which would allow us to target the Pending Holds section much easier.
    const pendingRows = page
        .locator('#allHoldsPlaceholder')
        .locator('xpath=./div[contains(@class, "striped")][count(preceding-sibling::h2) = 2]')
        .locator('.result.row');

    if (await pendingRows.count() > 0) {
        await initAllHoldsCancellation(page);
        const body = await submitAllHoldsCancellation(page);
        await verifyAllHoldsCancellationResponse(page, body, true);
        await expect(page.locator('xpath=./div[contains(@class, "striped")][count(preceding-sibling::h2) = 2]')).toBeHidden;
    } else {
        console.log('SKIPPED: No pending holds to cancel.');
    }
}

export async function initAllHoldsCancellation(page: Page) {
    const cancelAllLink = page.locator('a[onclick*="AspenDiscovery.Account.confirmCancelHoldAll()"]').first();
    await expect(cancelAllLink).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=confirmCancelHoldAll'));
    await test.step('Opening cancel all pending holds confirmation', async () => {
        await cancelAllLink.click();
    });
    expect((await formLoaded).ok()).toBe(true);
}

export async function submitAllHoldsCancellation(page: Page) {
    const body = await test.step('Confirming all pending holds cancellation', async () => {
        return clickAndCaptureJson(page, modal(page).primaryButton, 'method=cancelAllHolds');
    });
    return body;
}

export async function verifyAllHoldsCancellationResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server cancel all response', async () => {
        expect(body.success).toBe(expectedSuccess);
    });

    const alert = modal(page).alert.first();
    if (expectedSuccess) {
        await test.step('Verifying user sees a success message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-success');
            await expect(alert).not.toContainClass('alert-danger');
        });
    } else {
        await test.step('Verifying user sees a failure message', async () => {
            await expect(alert).toBeVisible();
            await expect(alert).toContainClass('alert-danger');
            await expect(alert).not.toContainClass('alert-success');
        });
    }
}