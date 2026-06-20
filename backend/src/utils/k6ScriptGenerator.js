const { k6Options, requestTemplate, scriptTemplate } = require('./k6Options');

const generateK6Options = (testType, vus, duration) => {
    const template = k6Options[testType] || k6Options.functional;
    const optionsObj = typeof template === 'function'
        ? template(vus, duration)
        : template;
    return JSON.stringify(optionsObj, null, 4);
};

const generateK6Script = (endpoints, testType, vus, duration) => {
    let requestCode = '';
    
    endpoints.forEach((ep) => {
        let headersJson = [];
        try {
            headersJson = JSON.parse(ep.headers || '[]');
        } catch (e) {
            console.warn(`Invalid headers JSON for endpoint ${ep.id}`);
        }
        const headersObj = {};
        headersJson.forEach(h => {
            if (h.key) headersObj[h.key] = h.value;
        });

        const bodyStr = ep.body ? JSON.stringify(ep.body) : 'null';
        const headersStr = JSON.stringify(headersObj);

        requestCode += requestTemplate(ep.id, ep.method, ep.url, bodyStr, headersStr);
    });

    const optionsStr = generateK6Options(testType, vus, duration);

    return scriptTemplate(optionsStr, requestCode);
};

module.exports = { generateK6Script };