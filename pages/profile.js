// ==========================================
// PrinCare — Profile Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { CURRENT_USER } from '../src/js/mock-data.js';

initApp('profile', 'โปรไฟล์', ['หน้าหลัก', 'โปรไฟล์']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('profileContent');

  content.innerHTML = `
    <div class="profile-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">${icons.user} <span style="vertical-align:middle">โปรไฟล์</span></h1>
          <p class="page-subtitle">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
        </div>
      </div>

      <!-- Profile Banner -->
      <div class="profile-banner animate-fade-in">
        <div class="profile-banner-avatar">${CURRENT_USER.avatar}</div>
        <div class="profile-banner-info">
          <h2>${CURRENT_USER.name}</h2>
          <p>${CURRENT_USER.position} · ${CURRENT_USER.department}</p>
          <span class="badge badge-success badge-dot" style="background:rgba(104,211,145,0.2);color:#68D391;">ปฏิบัติงาน</span>
        </div>
      </div>

      <!-- Personal Info -->
      <div class="card profile-form-section animate-fade-in-up delay-1">
        <h3>${icons.edit} <span style="vertical-align:middle">ข้อมูลส่วนตัว</span></h3>
        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">ชื่อ-นามสกุล (ไทย)</label>
            <input type="text" class="form-input" value="${CURRENT_USER.name}" />
          </div>
          <div class="form-group">
            <label class="form-label">Name (English)</label>
            <input type="text" class="form-input" value="${CURRENT_USER.nameEn}" />
          </div>
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <input type="email" class="form-input" value="${CURRENT_USER.email}" />
          </div>
          <div class="form-group">
            <label class="form-label">เบอร์โทรศัพท์</label>
            <input type="tel" class="form-input" value="${CURRENT_USER.phone}" />
          </div>
          <div class="form-group">
            <label class="form-label">แผนก</label>
            <input type="text" class="form-input" value="${CURRENT_USER.department}" disabled style="background:var(--color-surface);" />
          </div>
          <div class="form-group">
            <label class="form-label">ตำแหน่ง</label>
            <input type="text" class="form-input" value="${CURRENT_USER.position}" disabled style="background:var(--color-surface);" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:var(--space-4);">
          <button class="btn btn-primary">${icons.save} <span style="vertical-align:middle">บันทึกข้อมูล</span></button>
        </div>
      </div>

      <!-- Change Password -->
      <div class="card profile-form-section animate-fade-in-up delay-2">
        <h3>${icons.lock} <span style="vertical-align:middle">เปลี่ยนรหัสผ่าน</span></h3>
        <div class="profile-form-grid">
          <div class="form-group">
            <label class="form-label">รหัสผ่านปัจจุบัน</label>
            <input type="password" class="form-input" placeholder="••••••••" />
          </div>
          <div></div>
          <div class="form-group">
            <label class="form-label">รหัสผ่านใหม่</label>
            <input type="password" class="form-input" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" class="form-input" placeholder="••••••••" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:var(--space-4);">
          <button class="btn btn-primary">${icons.key} <span style="vertical-align:middle">เปลี่ยนรหัสผ่าน</span></button>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="card profile-form-section animate-fade-in-up delay-3">
        <h3>${icons.bell} <span style="vertical-align:middle">การแจ้งเตือน</span></h3>
        <div class="settings-row" style="border-bottom:1px solid var(--color-border-light);">
          <div class="settings-row-info">
            <h5>Email</h5>
            <p>รับการแจ้งเตือนผ่านอีเมล</p>
          </div>
          <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
        </div>
        <div class="settings-row" style="border-bottom:1px solid var(--color-border-light);">
          <div class="settings-row-info">
            <h5>LINE Notify</h5>
            <p>รับการแจ้งเตือนผ่าน LINE</p>
          </div>
          <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <h5>SMS</h5>
            <p>รับ SMS แจ้งเตือนเวร</p>
          </div>
          <label class="toggle"><input type="checkbox" /><span class="toggle-slider"></span></label>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card profile-form-section animate-fade-in-up delay-4" style="border-color:rgba(252,129,129,0.3);">
        <h3 style="color:var(--color-danger);">${icons.alert} <span style="vertical-align:middle">โซนอันตราย</span></h3>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h5>ออกจากระบบ</h5>
            <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">ออกจากระบบจากอุปกรณ์นี้</p>
          </div>
          <a href="/pages/login.html" class="btn btn-danger">${icons.logout} <span style="vertical-align:middle">ออกจากระบบ</span></a>
        </div>
      </div>
    </div>
  `;
});
