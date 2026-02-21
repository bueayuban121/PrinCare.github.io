// ==========================================
// PrinCare — Login Page Logic
// ==========================================

window.selectRole = function (el) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
};

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = document.getElementById('loginBtn');
    const span = btn.querySelector('span');
    const loader = btn.querySelector('.btn-loading');

    span.textContent = 'กำลังเข้าสู่ระบบ...';
    loader.style.display = 'inline-block';
    btn.disabled = true;
    btn.style.opacity = '0.8';

    setTimeout(() => {
        window.location.href = '/pages/dashboard.html';
    }, 1200);
});
