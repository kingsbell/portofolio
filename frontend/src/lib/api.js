const AUTH_URL = 'http://localhost:5001/api/auth';
const AUTOMATION_URL = 'http://localhost:5001/api/api-automation';

const fetchOptions = (options = {}) => ({
    ...options,
    credentials: 'include', // Wajib agar Cookie JWT otomatis dikirim
    headers: {
        'Content-Type': 'application/json',
        ...options.headers,
    }
});

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
};

export const api = {
    // === AUTH ===
    login: async (email, password) => {
        const res = await fetch(`${AUTH_URL}/login`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ email, password })
        }));
        return handleResponse(res);
    },

    logout: async () => {
        const res = await fetch(`${AUTH_URL}/logout`, fetchOptions({
            method: 'POST'
        }));
        return handleResponse(res);
    },

    checkAuth: async () => {
        const res = await fetch(`${AUTH_URL}/me`, fetchOptions({
            method: 'GET'
        }));
        return handleResponse(res);
    },

    // === API AUTOMATION SUITES ===
    getSuites: async () => {
        const res = await fetch(`${AUTOMATION_URL}/suites`, fetchOptions({
            method: 'GET'
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    getSuite: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}`, fetchOptions({
            method: 'GET'
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    createSuite: async (name, description, targetUrl) => {
        const res = await fetch(`${AUTOMATION_URL}/suites`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ name, description, targetUrl })
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    deleteSuite: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}`, fetchOptions({
            method: 'DELETE'
        }));
        return handleResponse(res);
    },

    // === RECORDING ===
    startRecording: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}/record`, fetchOptions({
            method: 'POST'
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    getSuiteEndpoints: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}/endpoints`, fetchOptions({
            method: 'GET'
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    deleteEndpoint: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/endpoints/${id}`, fetchOptions({
            method: 'DELETE'
        }));
        return handleResponse(res);
    },

    // === RUN TEST ===
    runTest: async (id, testType, vus, duration) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}/run`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ testType, vus, duration })
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    getSuiteRuns: async (id) => {
        const res = await fetch(`${AUTOMATION_URL}/suites/${id}/runs`, fetchOptions({
            method: 'GET'
        }));
        const data = await handleResponse(res);
        return data.data;
    },

    getAllRuns: async () => {
        const res = await fetch(`${AUTOMATION_URL}/runs`, fetchOptions({
            method: 'GET'
        }));
        const data = await handleResponse(res);
        return data.data;
    }
};
