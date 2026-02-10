// @ts-ignore
import path from 'path';

const siteName = process.env.SITE_NAME || 'example';
const libraryData = require(path.resolve(__dirname, `../sites/${siteName}/config.json`));

export const config = {
    siteData: libraryData,
    manualRefreshEnabled: (process.env.ALLOW_MANUAL_REFRESH || 'false') === 'true',
    volumeHoldsEnabled: (process.env.ALLOW_VOLUME_HOLDS || 'true') === 'true',
};