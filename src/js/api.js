// ==========================================
// PrinCare — API Client (Frontend)
// ==========================================

const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('princare_token');
}

function getUser() {
    const u = localStorage.getItem('princare_user');
    return u ? JSON.parse(u) : null;
}

function setAuth(token, user) {
    localStorage.setItem('princare_token', token);
    localStorage.setItem('princare_user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('princare_token');
    localStorage.removeItem('princare_user');
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}

async function api(path, options = {}) {
    const token = getToken();
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const res = await fetch(`${API_BASE}${path}`, config);
        const data = await res.json();
        if (res.status === 401) {
            clearAuth();
            window.location.href = '/pages/login.html';
            return null;
        }
        if (!res.ok) {
            throw new Error(data.error || 'เกิดข้อผิดพลาด');
        }
        return data;
    } catch (err) {
        console.error('API Error:', err.message);
        throw err;
    }
}

// Convenience methods
const apiGet = (path) => api(path);
const apiPost = (path, body) => api(path, { method: 'POST', body });
const apiPut = (path, body) => api(path, { method: 'PUT', body });
const apiDelete = (path) => api(path, { method: 'DELETE' });

export { api, apiGet, apiPost, apiPut, apiDelete, getToken, getUser, setAuth, clearAuth, requireAuth };
