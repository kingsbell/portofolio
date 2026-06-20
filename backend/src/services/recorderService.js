const { chromium } = require('playwright');
const EndpointModel = require('../models/endpointModel');

async function startApiRecordingSession(suiteId, targetUrl) {
    const browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    const capturedEndpoints = []; // Memperbaiki ReferenceError: capturedEndpoints dideklarasikan di sini

    page.on('request', async (request) => {
        const url = request.url();
        const method = request.method();
        const resourceType = request.resourceType();

        if (resourceType === 'xhr' || resourceType === 'fetch') {
            const headers = request.headers();
            const postData = request.postData() || null;

            const headersArray = Object.entries(headers).map(([key, value]) => ({
                key,
                value
            }));

            capturedEndpoints.push({
                method,
                url,
                headers: headersArray,
                body: postData, // Memperbaiki typo 'bod' menjadi 'body'
                description: `Recorded request to ${new URL(url).pathname}`
            });
            console.log(`[API Recorder] Captured: ${method} ${url}`); // Memperbaiki console.log syntax
        }
    });

    await page.goto(targetUrl);

    return new Promise((resolve) => {
        browser.on('disconnected', async () => {
            console.log('[API Recorder] Browser closed. Saving endpoints...');

            let index = 0;
            for (const ep of capturedEndpoints) {
                const existing = await EndpointModel.checkExisting(suiteId, ep.url, ep.method);

                if (existing.length === 0) {
                    await EndpointModel.create(
                        suiteId,
                        ep.method,
                        ep.url,
                        ep.description,
                        JSON.stringify(ep.headers),
                        ep.body,
                        index++
                    );
                }
            }
            resolve(capturedEndpoints);
        });
    });
}

module.exports = { startApiRecordingSession };