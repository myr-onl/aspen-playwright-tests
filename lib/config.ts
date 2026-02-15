// @ts-ignore
import path from 'path';

const siteName = process.env.SITE_NAME || 'example';
const libraryData = require(path.resolve(__dirname, `../sites/${siteName}/config.json`));

export const config = {
    siteName: siteName,
    siteData: libraryData,
    manualRefreshEnabled: (process.env.ALLOW_MANUAL_REFRESH) === 'true',
    volumeHoldsEnabled: (process.env.ALLOW_VOLUME_HOLDS) === 'true',
};