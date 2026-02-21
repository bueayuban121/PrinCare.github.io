// ==========================================
// PrinCare — Notifications Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPut, requireAuth } from '../src/js/api.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('notifications', 'การแจ้งเตือน', ['หน้าหลัก', 'การแจ้งเตือน']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('notificationsContent');

  function getIcon(type) {
    return { shift: icons.calendar, request: icons.swap, approval: icons.checkCircle, emergency: icons.alertCircle, system: icons.clipboard }[type] || icons.bell;
  }

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:300px;border-radius:16px;"></div>`;
    try {
      const notifs = await apiGet('/notifications');
      const unread = notifs.filter(n => !n.read).length;
      content.innerHTML = `
        <div class="page-header">
          <div><h1 class="page-title">${icons.bell} <span style="vertical-align:middle">การแจ้งเตือน</span></h1>
          <p class="page-subtitle">ทั้งหมด ${notifs.length} · ยังไม่อ่าน ${unread}</p></div>
          <div class="page-actions">${unread > 0 ? `<button class="btn btn-secondary" onclick="readAll()">อ่านทั้งหมด</button>` : ''}</div>
        </div>
        <div class="notif-list">
          ${notifs.map(n => `
            <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="markRead('${n.id}')">
              <div class="notif-icon ${n.type}">${getIcon(n.type)}</div>
              <div class="notif-body">
                <div class="notif-title">${n.title}</div>
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${icons.clock} <span style="vertical-align:middle">${n.time}</span></div>
              </div>
              ${!n.read ? '<div class="notif-dot"></div>' : ''}
            </div>
          `).join('')}
        </div>
      `;
    } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
  }
  render();
  window.markRead = async (id) => { await apiPut(`/notifications/${id}/read`); render(); };
  window.readAll = async () => { await apiPut('/notifications/read-all/batch'); render(); };
});
