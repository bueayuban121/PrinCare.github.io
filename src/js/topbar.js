// ==========================================
// PrinCare — Topbar Component (Auth-aware)
// ==========================================

import { icons } from './icons.js';

export function renderTopbar(pageTitle = 'แดชบอร์ด', breadcrumbs = [], user = null) {
  const topbar = document.createElement('header');
  topbar.className = 'topbar';

  const breadcrumbHTML = breadcrumbs.length > 0
    ? breadcrumbs.map((b, i) => {
      if (i === breadcrumbs.length - 1) return `<span class="breadcrumb-current">${b}</span>`;
      return `<span>${b}</span><span class="breadcrumb-separator">›</span>`;
    }).join('')
    : `<span>หน้าหลัก</span><span class="breadcrumb-separator">›</span><span class="breadcrumb-current">${pageTitle}</span>`;

  topbar.innerHTML = `
    <div class="topbar-left">
      <button class="topbar-toggle" onclick="toggleSidebar()">${icons.menu}</button>
      <div class="breadcrumb">${breadcrumbHTML}</div>
    </div>
    <div class="topbar-right">
      <div class="topbar-search">
        <span class="search-icon">${icons.search}</span>
        <input type="text" placeholder="ค้นหา..." />
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn" onclick="window.location.href='/pages/notifications.html'" style="position:relative">${icons.bell}</button>
        <div class="topbar-divider"></div>
        <a href="/pages/profile.html" class="topbar-user">
          <div class="topbar-user-info hide-mobile">
            <div class="topbar-user-name">${user?.name || ''}</div>
            <div class="topbar-user-role">${user?.position || ''}</div>
          </div>
          <div class="topbar-user-avatar">${user?.avatar || 'PC'}</div>
        </a>
      </div>
    </div>
  `;

  return topbar;
}

export function initTopbar(pageTitle, breadcrumbs, user) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const topbar = renderTopbar(pageTitle, breadcrumbs, user);
  mainContent.prepend(topbar);
}
