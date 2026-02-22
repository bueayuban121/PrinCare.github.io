// ==========================================
// PrinCare — Profile Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPut, requireAuth, getUser, clearAuth, setAuth } from '../src/js/api.js';
import { getBranchName } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('profile', 'โปรไฟล์', ['หน้าหลัก', 'โปรไฟล์']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('profileContent');
  content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;

  try {
    const profile = await apiGet('/profile');
    content.innerHTML = `
      <div class="page-header"><div><h1 class="page-title">${icons.user} <span style="vertical-align:middle">โปรไฟล์</span></h1></div>
      <div class="page-actions"><button class="btn btn-danger" onclick="logoutUser()">${icons.x} <span style="vertical-align:middle">ออกจากระบบ</span></button></div></div>

      <div class="profile-grid">
        <div class="card profile-card animate-fade-in-up delay-1">
          <div class="profile-avatar-lg" style="position:relative; overflow:hidden;">
            ${profile.avatar && profile.avatar.startsWith('data:image') ? `<img src="${profile.avatar}" style="width:100%; height:100%; object-fit:cover;" />` : (profile.avatar || 'PC')}
            <input type="file" id="avatarUpload" accept="image/*" style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer;" title="เปลี่ยนรูปโปรไฟล์" />
          </div>
          <p style="font-size:12px; color:var(--text-muted); margin-top:-10px;">คลิกที่รูปเพื่อเปลี่ยน</p>
          <h3>${profile.name}</h3>
          <p class="text-muted">${profile.name_en || ''}</p>
          <span class="badge badge-primary">${profile.role}</span>
          <div class="profile-meta">
            <div>${icons.checkCircle} <span style="vertical-align:middle">${getBranchName(profile.branch || 'PSV01')}</span></div>
            <div>${icons.hospital} <span style="vertical-align:middle">${profile.department || '-'}</span></div>
            <div>${icons.star} <span style="vertical-align:middle">${profile.position || '-'}</span></div>
            <div>${icons.mail} <span style="vertical-align:middle">${profile.email}</span></div>
            <div>${icons.phoneCall} <span style="vertical-align:middle">${profile.phone || '-'}</span></div>
          </div>
        </div>

        <div class="profile-forms">
          <div class="card animate-fade-in-up delay-2">
            <h3>แก้ไขข้อมูล</h3>
            <form id="profileForm">
              <div class="form-group"><label class="form-label">ชื่อ</label><input class="form-input" id="profName" value="${profile.name}" /></div>
              <div class="form-group"><label class="form-label">ชื่อ (อังกฤษ)</label><input class="form-input" id="profNameEn" value="${profile.name_en || ''}" /></div>
              <div class="form-group"><label class="form-label">อีเมล</label><input class="form-input" id="profEmail" value="${profile.email}" type="email" /></div>
              <div class="form-group"><label class="form-label">เบอร์โทร</label><input class="form-input" id="profPhone" value="${profile.phone || ''}" /></div>
              <button type="submit" class="btn btn-primary">${icons.check} <span style="vertical-align:middle">บันทึก</span></button>
            </form>
          </div>

          <div class="card animate-fade-in-up delay-3" style="margin-top:var(--space-4)">
            <h3>เปลี่ยนรหัสผ่าน</h3>
            <form id="passwordForm">
              <div class="form-group"><label class="form-label">รหัสผ่านปัจจุบัน</label><input class="form-input" id="curPass" type="password" /></div>
              <div class="form-group"><label class="form-label">รหัสผ่านใหม่</label><input class="form-input" id="newPass" type="password" /></div>
              <button type="submit" class="btn btn-primary">${icons.shield} <span style="vertical-align:middle">เปลี่ยนรหัสผ่าน</span></button>
            </form>
          </div>
        </div>
      </div>
    `;

    let currentAvatarBase64 = profile.avatar;
    document.getElementById('avatarUpload')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        currentAvatarBase64 = ev.target.result;
        const avatarEl = document.querySelector('.profile-avatar-lg');
        avatarEl.innerHTML = `<img src="${currentAvatarBase64}" style="width:100%; height:100%; object-fit:cover;" /><input type="file" id="avatarUpload" accept="image/*" style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer;" title="เปลี่ยนรูปโปรไฟล์" />`;
        // reattach listener
        document.getElementById('avatarUpload').addEventListener('change', arguments.callee);
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiPut('/profile', {
          name: document.getElementById('profName').value,
          name_en: document.getElementById('profNameEn').value,
          email: document.getElementById('profEmail').value,
          phone: document.getElementById('profPhone').value,
          avatar: currentAvatarBase64
        });
        const user = getUser();
        user.name = document.getElementById('profName').value;
        user.email = document.getElementById('profEmail').value;
        setAuth(localStorage.getItem('princare_token'), user);
        alert('บันทึกสำเร็จ');
      } catch (err) { alert(err.message); }
    });

    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await apiPut('/profile/password', {
          current_password: document.getElementById('curPass').value,
          new_password: document.getElementById('newPass').value,
        });
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        document.getElementById('curPass').value = '';
        document.getElementById('newPass').value = '';
      } catch (err) { alert(err.message); }
    });
  } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }

  window.logoutUser = () => { clearAuth(); window.location.href = '/pages/login.html'; };
});
