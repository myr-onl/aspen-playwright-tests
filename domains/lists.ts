import { test, expect, Page } from '@playwright/test';
import { HoldItem } from '../common/config';
import { modal } from '../common/modal';
import { clickAndCaptureJson } from '../common/network';
import * as nav from '../common/navigation';

// One list's row on the Lists page
function listRow(page: Page) {
    // TODO: Add data attributes upstream to make selecting the entire list row easier.
    // This selector technically doesn't even include the covers column
    return page.locator('div.col-xs-8.col-sm-8.col-md-8.col-lg-9');
}

// A specific list's row, matched by its link to the list page
function listRowById(page: Page, listId: string) {
    return listRow(page).filter({ has: page.locator(`a.result-title[href="/MyAccount/MyList/${listId}"]`) });
}

// One title's entry on a list page, matched by title
function listEntry(page: Page, item: HoldItem) {
    return page.locator('.listEntry').filter({ has: page.locator('.result-title', { hasText: item.title }) });
}

function listToolbar(page: Page) {
    return page.locator('#listTopButtons');
}

// Lists page
export async function showUnassignedLists(page: Page) {
    const groupSelect = page.locator('#listGroupSelect');
    if (!(await groupSelect.isVisible())) {
        console.log('No list groups found.');
        return;
    }
    if ((await groupSelect.inputValue()) === '-1') return;

    await test.step('Switching to Unassigned Lists', async () => {
        await groupSelect.selectOption('-1');
        await expect(page.locator('#activeListGroupTitle')).toContainText('Unassigned');
    });
}

export async function findList(page: Page, listId: string, title: string) {
    await test.step('Verifying list shows on the Lists page', async () => {
        await expect(listRowById(page, listId).locator('.result-title')).toContainText(title);
    });
}

export async function verifyListRemoved(page: Page, listId: string) {
    await test.step('Verifying list is gone from the Lists page', async () => {
        await expect(listRowById(page, listId)).toHaveCount(0);
    });
}

// Permanently deletes lists left behind by failed runs. Matches on title since their ids are unknown.
export async function deleteLeftoverLists(page: Page, title: string) {
    const ids = await listRow(page).locator('.result-title').filter({ hasText: title })
        .evaluateAll(links => links.map(a => (a.getAttribute('href') ?? '').split('/').pop() ?? ''));

    if (ids.length === 0) {
        console.log('SKIPPED: No leftover test lists to delete.');
        return;
    }
    for (const id of ids) {
        await nav.openList(page, id);
        await initListDeletion(page);
        await submitListDeletion(page);
    }
}

// Create list
export async function initCreateList(page: Page) {
    const createButton = page.locator('button[onclick*="AspenDiscovery.Account.showCreateListForm"]');
    await expect(createButton).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=getCreateListForm'));
    await test.step('Opening Create List form', async () => {
        await createButton.click();
    });
    expect((await formLoaded).ok()).toBe(true);
    await expect(page.locator('input#listTitle')).toBeVisible();
}

export async function fillListInfo(page: Page, title: string, description: string) {
    await test.step('Entering list title and description', async () => {
        await page.locator('#listTitle').click();
        await page.locator('#listTitle').fill(title);
        await page.locator('#listDesc').click();
        await page.locator('#listDesc').fill(description);

    });
}

export async function submitCreateList(page: Page) {
    const body = await test.step('Submitting new list', async () => {
        return clickAndCaptureJson(page, modal(page).primaryButton, 'method=addList');
    });
    return body;
}

export async function verifyCreateListResponse(page: Page, body: any, title: string, expectedSuccess: boolean) {
    await test.step('Verifying server create-list response', async () => {
        // addList returns success as a string ("true"), so compare as strings
        expect(String(body.success)).toBe(String(expectedSuccess));
    });

    if (expectedSuccess) {
        expect(body.newId).toBeTruthy();
        await findList(page, body.newId, title);
    }
}

// Add title to list
export async function initSaveToList(page: Page, item: HoldItem) {
    const addButton = page.locator(`button[onclick*="showSaveToListForm(this, 'GroupedWork', '${item.groupedWorkId}');"]`);
    await expect(addButton).toBeVisible();

    const formLoaded = page.waitForResponse(r => r.url().includes('method=getSaveToListForm'));
    await test.step('Opening Add to List form', async () => {
        await addButton.click();
    });
    expect((await formLoaded).ok()).toBe(true);
    await expect(page.locator('#addToList-list')).toBeVisible();
}

export async function selectList(page: Page, listId: string) {
    await test.step('Selecting the test list', async () => {
        // Option values are list ids
        await page.locator('#addToList-list').selectOption(listId);
    });
}

export async function submitSaveToList(page: Page) {
    const body = await test.step('Saving title to list', async () => {
        return clickAndCaptureJson(page, page.locator('#saveToListButton'), 'method=saveToList');
    });
    return body;
}

export async function verifySaveToListResponse(page: Page, body: any, expectedSuccess: boolean) {
    await test.step('Verifying server save-to-list response', async () => {
        expect(String(body.success)).toBe(String(expectedSuccess));
    });
    // Nothing reloads after saving; the next test checks the entry on the list page
}

// List page
export async function verifyListTitle(page: Page, title: string) {
    await test.step('Verifying list title', async () => {
        await expect(page.locator('h1#listTitle')).toHaveText(title);
    });
}

export async function findListEntry(page: Page, item: HoldItem) {
    await test.step('Verifying title is in the list', async () => {
        await expect(listEntry(page, item).locator('.result-title')).toContainText(item.title);
    });
}

// Edit list
export async function initListEdit(page: Page) {
    await test.step('Opening list edit controls', async () => {
        await listToolbar(page).locator('#FavEdit').click();
        await expect(page.locator('#listEditControls')).toBeVisible();
    });
}

export async function fillListEdits(page: Page, title: string, description: string) {
    await test.step('Entering new list title and description', async () => {
        await page.locator('#listTitleEdit').fill(title);
        await page.locator('#listDescriptionEdit').fill(description);
    });
}

export async function submitListEdit(page: Page) {
    await test.step('Saving list changes', async () => {
        await listToolbar(page).locator('#FavSave').click();
    });
}

export async function verifyListEdit(page: Page, title: string, description: string) {
    // Update reloads the page, and the heading only changes once the save has gone through
    await verifyListTitle(page, title);
    await test.step('Verifying saved description', async () => {
        await expect(page.locator('#listDescriptionEdit')).toHaveValue(description);
    });
}

// Remove title from list
export async function initEntryRemoval(page: Page, item: HoldItem) {
    const deleteButton = listEntry(page, item).locator('a[onclick*="deleteEntryFromList"]');
    await expect(deleteButton).toBeVisible();
    await test.step('Opening remove title confirmation', async () => {
        await deleteButton.click();
        await expect(page.locator('#confirmOkBtn')).toBeVisible();
    });
}

export async function submitEntryRemoval(page: Page) {
    await test.step('Confirming title removal', async () => {
        await page.locator('#confirmOkBtn').click();
    });
}

export async function verifyEntryRemoved(page: Page, item: HoldItem) {
    await test.step('Verifying title is no longer in the list', async () => {
        await expect(listEntry(page, item)).toHaveCount(0);
    });
}

// Delete list
export async function initListDeletion(page: Page) {
    await test.step('Opening delete list confirmation', async () => {
        await listToolbar(page).locator('#FavDelete').click();
        const formLoaded = page.waitForResponse(r => r.url().includes('method=getDeleteListForm'));
        await listToolbar(page).locator('a[onclick*="AspenDiscovery.Lists.deleteListAction()"]').click();
        expect((await formLoaded).ok()).toBe(true);
        await expect(page.locator('#confirmDeleteList')).toBeVisible();
    });
}

export async function submitListDeletion(page: Page) {
    await test.step('Confirming permanent list deletion', async () => {
        await page.locator('#optOutSoftDeletion').check();
        await page.locator('#confirmDeleteList').click();
        await page.waitForURL(/\/MyAccount\/Lists/);
    });
}