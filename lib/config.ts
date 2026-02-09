import path from 'path';

const configFileName = process.env.SITE_CONFIG || 'example.json';
const libraryData = require(path.resolve(__dirname, `../sites/${configFileName}.json`));

export const config = {
    siteData: libraryData,
    manualRefreshEnabled: (process.env.ALLOW_MANUAL_REFRESH || 'false') === 'true',
    volumeHoldsEnabled: (process.env.ALLOW_VOLUME_HOLDS || 'true') === 'true',
};