// ==========================================
// PrinCare — Notifications Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { NOTIFICATIONS } from '../src/js/mock-data.js';

initApp('notifications', 'การแจ้งเตือน', ['หน้าหลัก', 'การแจ้งเตือน']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('notifContent');
  const unread = NOTIFICATIONS.filter(n => !n.read).length;

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${icons.bell} <span style="vertical-align:middle">การแจ้งเตือน</span></h1>
        <p class="page-subtitle">การแจ้งเตือนทั้งหมด ${NOTIFICATIONS.length} รายการ · ยังไม่อ่าน ${unread} รายการ</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" onclick="markAllRead()">${icons.check} <span style="vertical-align:middle">อ่านทั้งหมด</span></button>
      </div>
    </div>

    <div class="notif-filters">
      <div class="tabs">
        <button class="tab active">ทั้งหมด</button>
        <button class="tab">ยังไม่อ่าน (${unread})</button>
        <button class="tab">เวร</button>
        <button class="tab">คำขอ</button>
        <button class="tab">ระบบ</button>
      </div>
    </div>

    <div class="notif-list">
      ${NOTIFICATIONS.map((n, i) => `
        <div class="notif-item ${n.read ? '' : 'unread'} animate-fade-in-up delay-${Math.min(i + 1, 5)}">
          <div class="notif-icon">${icons[n.iconKey] || icons.bell}</div>
          <div class="notif-content">
            <div class="notif-title">${n.title}</div>
            <div class="notif-message">${n.message}</div>
            <div class="notif-time">${icons.clock} <span style="vertical-align:middle">${n.time}</span></div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Notification Settings -->
    <div class="notif-settings card animate-fade-in-up" style="margin-top:var(--space-8);">
      <div class="card-header">
        <h3>${icons.settings} <span style="vertical-align:middle">ตั้งค่าการแจ้งเตือน</span></h3>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <h5>In-app Notifications</h5>
          <p>แจ้งเตือนภายในระบบ</p>
        </div>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <h5>Email</h5>
          <p>ส่งการแจ้งเตือนผ่านอีเมล</p>
        </div>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <h5>LINE Notify</h5>
          <p>ส่งการแจ้งเตือนผ่าน LINE</p>
        </div>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <h5>SMS</h5>
          <p>ส่ง SMS แจ้งเตือนเวร</p>
        </div>
        <label class="toggle"><input type="checkbox" /><span class="toggle-slider"></span></label>
      </div>
      <div class="settings-row">
        <div class="settings-row-info">
          <h5>แจ้งเตือนก่อนเวร</h5>
          <p>แจ้งเตือนล่วงหน้าก่อนเริ่มเวร</p>
        </div>
        <select class="form-select" style="width:auto;padding:6px 30px 6px 10px;">
          <option>24 ชม.</option>
          <option>12 ชม.</option>
          <option>6 ชม.</option>
          <option>1 ชม.</option>
        </select>
      </div>
    </div>
  `;

  window.markAllRead = function () {
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
  };
});
