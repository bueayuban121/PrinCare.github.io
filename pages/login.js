// ==========================================
// PrinCare — Login Page (Real Auth)
// ==========================================

import { setAuth, clearAuth } from '../src/js/api.js';

clearAuth(); // clear old session on login page

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'login-error';
    errorDiv.style.cssText = 'color:#E53E3E;font-size:14px;text-align:center;margin-top:12px;display:none;';
    form.appendChild(errorDiv);

    // Role selector
    window.selectRole = function (el) {
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        const role = el.dataset.role;
        const emailInput = document.getElementById('email');
        const passInput = document.getElementById('password');
        switch (role) {
            case 'admin': emailInput.value = 'admin@princare.com'; passInput.value = 'admin123'; break;
            case 'head': emailInput.value = 'head@princare.com'; passInput.value = 'head123'; break;
            case 'doctor': emailInput.value = 'doctor@princare.com'; passInput.value = 'doctor123'; break;
            case 'hr': emailInput.value = 'admin@princare.com'; passInput.value = 'admin123'; break;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
            }

            setAuth(data.token, data.user);

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/pages/dashboard.html';
            }, 500);
        } catch (err) {
            errorDiv.textContent = err.message;
            errorDiv.style.display = 'block';
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
        }
    });
});
