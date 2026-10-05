import { Page, Locator } from '@playwright/test';

// Clicks the button and returns the JSON body of the matching response,
// captured before the browser sees it (safe even if the page reloads).
export async function clickAndCaptureJson(page: Page, button: Locator, urlParts: string | string[]) {
    const parts = Array.isArray(urlParts) ? urlParts : [urlParts];
    const matches = (url: string) => parts.some(part => url.includes(part));

    let body: any;
    await page.route(url => matches(url.href), async route => {
        const response = await route.fetch();
        body = await response.json();
        await route.fulfill({ response });
    }, { times: 1 });

    const responseDone = page.waitForResponse(r => matches(r.url()));
    await button.click();
    await responseDone;
    return body;
}