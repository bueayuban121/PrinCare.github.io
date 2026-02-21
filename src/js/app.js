// ==========================================
// PrinCare — App Initialization
// ==========================================

import { initSidebar } from './sidebar.js';
import { initTopbar } from './topbar.js';

export function initApp(pageName, pageTitle, breadcrumbs = []) {
    document.addEventListener('DOMContentLoaded', () => {
        initSidebar(pageName);
        initTopbar(pageTitle, breadcrumbs);
    });
}
