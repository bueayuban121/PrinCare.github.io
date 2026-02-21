// ==========================================
// PrinCare — Sidebar Component
// ==========================================

import { CURRENT_USER, NOTIFICATIONS } from './mock-data.js';
import { icons } from './icons.js';

export function renderSidebar(activePage = 'dashboard') {
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const navItems = [
    {
      section: 'เมนูหลัก', items: [
        { id: 'dashboard', label: 'แดชบอร์ด', icon: icons.dashboard, href: '/pages/dashboard.html' },
        { id: 'schedule', label: 'ตารางเวร', icon: icons.calendar, href: '/pages/schedule.html' },
        { id: 'doctors', label: 'ข้อมูลแพทย์', icon: icons.userDoctor, href: '/pages/doctors.html' },
      ]
    },
    {
      section: 'จัดการ', items: [
        { id: 'requests', label: 'การเปลี่ยนเวร', icon: icons.swap, href: '/pages/requests.html', badge: 3 },
        { id: 'notifications', label: 'การแจ้งเตือน', icon: icons.bell, href: '/pages/notifications.html', badge: unreadCount },
      ]
    },
    {
      section: 'รายงาน', items: [
        { id: 'reports', label: 'รายงานและสถิติ', icon: icons.chart, href: '/pages/reports.html' },
      ]
    },
    {
      section: 'ตั้งค่า', items: [
        { id: 'settings', label: 'ตั้งค่าระบบ', icon: icons.settings, href: '/pages/settings.html' },
        { id: 'profile', label: 'โปรไฟล์', icon: icons.user, href: '/pages/profile.html' },
      ]
    },
  ];

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">P</div>
      <div class="sidebar-brand">
        <span class="sidebar-brand-name">PrinCare</span>
        <span class="sidebar-brand-sub">Doctor Scheduling</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      ${navItems.map(section => `
        <div class="nav-section">
          <div class="nav-section-title">${section.section}</div>
          ${section.items.map(item => `
            <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}" data-page="${item.id}">
              <span class="nav-item-icon">${item.icon}</span>
              <span>${item.label}</span>
              ${item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </div>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <a href="/pages/profile.html" class="sidebar-user">
        <div class="sidebar-user-avatar">${CURRENT_USER.avatar}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${CURRENT_USER.name}</div>
          <div class="sidebar-user-role">${CURRENT_USER.position}</div>
        </div>
      </a>
    </div>
  `;

  return sidebar;
}

export function initSidebar(activePage) {
  const app = document.getElementById('app');
  if (!app) return;

  const sidebar = renderSidebar(activePage);
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });

  app.prepend(overlay);
  app.prepend(sidebar);

  window.toggleSidebar = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };
}
