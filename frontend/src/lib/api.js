const API_URL = 'http://localhost:5001/api/auth';

const fetchOptions = (options = {}) => ({
    ...options,
    credentials: 'include', // Wajib agar Cookie JWT otomatis dikirim
    headers: {
        'Content-Type': 'application/json',
        ...options.headers,
    }
});

export const api = {
    register: async (name, email, password) => {
        const res = await fetch(`${API_URL}/register`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        }));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Register failed');
        return data;
    },

    login: async (email, password) => {
        const res = await fetch(`${API_URL}/login`, fetchOptions({
            method: 'POST',
            body: JSON.stringify({ email, password })
        }));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    },

    logout: async () => {
        const res = await fetch(`${API_URL}/logout`, fetchOptions({
            method: 'POST'
        }));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Logout failed');
        return data;
    },

    checkAuth: async () => {
        const res = await fetch(`${API_URL}/me`, fetchOptions({
            method: 'GET'
        }));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unauthorized');
        return data;
    }
};
