// @ts-ignore
import path from 'path';

export type HoldItem = {
    title: string;
    format: string;
    recordId: string;
    groupedWorkId: string;
    source: string;
};

export type Patron = {
    username: string;
    password: string;
    invalidPassword: string;
    linkedAccounts: boolean;
    promptForEditions: boolean;
};

export type BrowserProfile = {
    patron: Patron;
    holdItem: HoldItem;
    volumeHoldItem?: HoldItem;
};

// Either one patron shared by every browser, or one per browser project
type PatronConfig = Patron | { [browser: string]: Patron };

type SiteConfig = {
    catalog: { url: string; ils: string };
    run: { manualRefresh: boolean; changePickup: boolean; volumeHolds: boolean };
    patron: PatronConfig;
};

type BibsData = {
    [browser: string]: {
        holdItem: HoldItem;
    };
};

type VolumesData = {
    [browser: string]: {
        volumeHoldItem: HoldItem;
    };
};

// Load site data
const activeSite = require(path.resolve(__dirname, '../sites/active.json'));
const siteName = process.env.SITE_NAME || activeSite.name;
const sitePath = path.resolve(__dirname, `../sites/${siteName}`);

const siteConfig: SiteConfig = require(path.join(sitePath, 'config.json'));
const bibs: BibsData = require(path.join(sitePath, 'bibs.json'));

let volumes: VolumesData | null = null;
if (siteConfig.run.volumeHolds) {
    try {
        volumes = require(path.join(sitePath, 'volumes.json'));
    } catch {
        console.warn(`Volume holds enabled but no volumes.json found in sites/${siteName}/`);
    }
}

// A shared patron has a username at the top level; a per-browser config doesn't
function isSharedPatron(patron: PatronConfig): patron is Patron {
    return typeof (patron as Patron).username === 'string';
}

// Exports
export const config = {
    siteName,
    catalog: siteConfig.catalog,
    run: siteConfig.run,
};

export function getPatron(projectName: string): Patron {
    const patrons = siteConfig.patron;
    if (!patrons) {
        throw new Error(`No patron defined in sites/${siteName}/config.json.`);
    }
    if (isSharedPatron(patrons)) return patrons;

    const patron = patrons[projectName];
    if (!patron) {
        throw new Error(
            `No patron for project "${projectName}" in sites/${siteName}/config.json. ` +
            `Expected one of: ${Object.keys(patrons).join(', ')}`
        );
    }
    return patron;
}

export function getProfile(projectName: string): BrowserProfile {
    const browserBibs = bibs[projectName];
    if (!browserBibs) {
        throw new Error(
            `No bib data for project "${projectName}" in sites/${siteName}/bibs.json. ` +
            `Expected one of: ${Object.keys(bibs).join(', ')}`
        );
    }

    return {
        patron: getPatron(projectName),
        holdItem: browserBibs.holdItem,
        volumeHoldItem: volumes?.[projectName]?.volumeHoldItem,
    };
}