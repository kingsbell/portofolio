const k6Options = {
    functional: { vus: 1 },
    load: (vus, duration) => ({
        stages: [
            { duration: '2s', target: vus },
            { duration: `${duration}s`, target: vus },
            { duration: '5s', target: 0 }
        ]
    }),
    stress: (vus) => ({
        stages: [
            { duration: '2s', target: Math.round(vus * 0.5) },
            { duration: '5s', target: vus },
            { duration: '5s', target: 0 }
        ]
    })
};

const requestTemplate = (id, method, url, bodyStr, headersStr) => {
    return `
    // Request: ${method} ${url}
    let res_${id} = http.request('${method}', '${url}', ${bodyStr}, {
        headers: ${headersStr}
    });
    check(res_${id}, {
        'status is 200/201': (r) => r.status === 200 || r.status === 201
    });
    sleep(0.5);
    `;
};

const scriptTemplate = (optionsStr, requestCode) => {
    return `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = ${optionsStr};
export default function () {
${requestCode}
}`;
};

module.exports = {
    k6Options,
    requestTemplate,
    scriptTemplate
};
