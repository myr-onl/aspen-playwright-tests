import { test, Page, TestInfo } from '@playwright/test';
import * as site from '../common/config';
import * as nav from '../common/navigation';
import * as header from '../common/header';
import * as lists from '../domains/lists';

// Helper functions
async function signIn(page: Page, testInfo: TestInfo) {
    const patron = site.getPatron(testInfo.project.name);
    await nav.goTo(page, '/');
    await header.openLoginModal(page);
    const loginBody = await header.loginUser(page, patron.username, patron.password);
    await header.verifyLoginResponse(page, loginBody, true);
}

async function goToLists(page: Page, testInfo: TestInfo) {
    await signIn(page, testInfo);
    await nav.goTo(page, '/MyAccount/Lists');
    await lists.showUnassignedLists(page);
}

test.describe.serial('User list basic operations', () => {
    const description = 'List created by an automated Playwright test.';
    const editedDescription = 'List edited by an automated Playwright test.';
    let holdItem: site.HoldItem;
    let listTitle: string;
    let editedTitle: string;
    let listId: string;

    test.beforeEach(async ({}, testInfo) => {
        holdItem = site.getProfile(testInfo.project.name).holdItem;
        // Scoped per browser so runs sharing one patron don't collide.
        listTitle = `Playwright Test List (${testInfo.project.name})`;
        editedTitle = `${listTitle} - Edited`;
    });

    test('Create list', async ({ page }, testInfo) => {
        await goToLists(page, testInfo);
        await lists.deleteLeftoverLists(page, listTitle);
        await lists.initCreateList(page);
        await lists.fillListInfo(page, listTitle, description);
        const body = await lists.submitCreateList(page);
        await lists.verifyCreateListResponse(page, body, listTitle, true);
        listId = body.newId;
    });

    test('Add title to list', async ({ page }, testInfo) => {
        await signIn(page, testInfo);
        await nav.openGroupedWork(page, holdItem.groupedWorkId);
        await lists.initSaveToList(page, holdItem);
        await lists.selectList(page, listId);
        const body = await lists.submitSaveToList(page);
        await lists.verifySaveToListResponse(page, body, true);
        await nav.openList(page, listId);
        await lists.verifyListTitle(page, listTitle);
        await lists.findListEntry(page, holdItem);
    });

    test('Edit list title and description', async ({ page }, testInfo) => {
        await signIn(page, testInfo);
        await nav.openList(page, listId);
        await lists.initListEdit(page);
        await lists.fillListEdits(page, editedTitle, editedDescription);
        await lists.submitListEdit(page);
        await lists.verifyListEdit(page, editedTitle, editedDescription);
    });

    test('Remove title from list', async ({ page }, testInfo) => {
        await signIn(page, testInfo);
        await nav.openList(page, listId);
        await lists.initEntryRemoval(page, holdItem);
        await lists.submitEntryRemoval(page);
        await lists.verifyEntryRemoved(page, holdItem);
    });

    test('Delete list', async ({ page }, testInfo) => {
        await signIn(page, testInfo);
        await nav.openList(page, listId);
        await lists.initListDeletion(page);
        await lists.submitListDeletion(page);
        await lists.showUnassignedLists(page);
        await lists.verifyListRemoved(page, listId);
    });
});

// TODO: List groups tests, List transfer tests
