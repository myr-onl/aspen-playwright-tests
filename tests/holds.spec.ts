import { test } from '@playwright/test';
import { config } from '../lib/config';
import { GroupedWorkView, HoldRequest } from "../page-objects/GroupedWorks";
import { TitlesOnHold, HoldModals } from "../page-objects/UserAccount";

// NOTE: These tests are not designed to run across several browsers simultaneously. Run within different environments one at a time.
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

    test('Place Bib-Level Hold', async ({}) => {
        await test.step('Sign in with valid user', async () => {
            await groupedWork.open(config.siteData.holdItem.groupedWorkId);
            await groupedWork.menu.signIn();
            await groupedWork.loginForm.login(config.siteData.patron.password);
        });

        await groupedWork.placeHold();
        await request.disableAutologout();
        await request.submitHoldRequest();
        await request.verifyHoldSuccess();

        await test.step('Go to Titles on Hold', async () => {
            await holds.goTo('/MyAccount/Holds');
            await holds.refresh();
            await holds.findRequestedTitle(config.siteData.holdItem.title);
        });

        await test.step('Freeze hold', async () => {
            await holds.initFreeze();
            await holdOption.setReactivationDate();
            await holdOption.confirmFreeze();
        });

        await test.step('Thaw hold', async () => {
            await holds.initThaw();
            await holdOption.confirmThaw();
        });

        await test.step('Change pickup location', async () => {
            await holds.initPickupChange();
            await holdOption.selectPickupLocation();
            await holdOption.confirmPickupLocation();
        });

        await test.step('Cancel hold', async () => {
            await holds.initCancel();
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

        await groupedWork.placeHold();
        await request.completeItemRequest();
        await request.verifyHoldSuccess();

        await test.step('Go back to Titles on Hold', async () => {
            await holds.goTo('/MyAccount/Holds');
            await holds.refresh();
            await holds.findRequestedTitle(config.siteData.volumeHoldItem.title);
        });

        await test.step('Freeze volume hold', async () => {
            await holds.initFreeze();
            await holdOption.setReactivationDate();
            await holdOption.confirmFreeze();
        });

        await test.step('Thaw volume hold', async () => {
            await holds.initThaw();
            await holdOption.confirmThaw();
        });

        await test.step('Change volume pickup location', async () => {
            await holds.initPickupChange();
            await holdOption.selectPickupLocation();
            await holdOption.confirmPickupLocation();
        });

        await test.step('Cancel volume hold', async () => {
            await holds.initCancel();
            await holdOption.confirmCancel();
        });
    });
});