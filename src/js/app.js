// ==========================================
// PrinCare — App Initialization (Auth-aware)
// ==========================================

import { initSidebar } from './sidebar.js';
import { initTopbar } from './topbar.js';
import { getUser } from './api.js';

export function initApp(activePage, pageTitle, breadcrumbs) {
    document.addEventListener('DOMContentLoaded', () => {
        const user = getUser();
        initSidebar(activePage, user);
        initTopbar(pageTitle, breadcrumbs, user);
    });
}
