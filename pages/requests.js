// ==========================================
// PrinCare — Requests Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { REQUESTS } from '../src/js/mock-data.js';
import { getStatusBadge, getRequestTypeName } from '../src/js/utils.js';

initApp('requests', 'การเปลี่ยนเวร', ['หน้าหลัก', 'การเปลี่ยนเวร']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('requestsContent');
  let filterType = 'all';

  function getIcon(type) {
    return { leave: icons.clipboard, swap: icons.swap, replacement: icons.search }[type] || icons.fileText;
  }

  function render() {
    const filtered = filterType === 'all' ? REQUESTS : REQUESTS.filter(r => r.type === filterType);
    const pendingCount = REQUESTS.filter(r => r.status === 'pending').length;

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${icons.swap} <span style="vertical-align:middle">การจัดการเปลี่ยนเวร</span></h1>
          <p class="page-subtitle">คำขอทั้งหมด ${REQUESTS.length} รายการ · รออนุมัติ ${pendingCount} รายการ</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="showNewRequest()">${icons.plus} <span style="vertical-align:middle">สร้างคำขอใหม่</span></button>
        </div>
      </div>

      <div class="requests-header-tabs">
        <div class="tabs">
          <button class="tab ${filterType === 'all' ? 'active' : ''}" onclick="setFilter('all')">ทั้งหมด (${REQUESTS.length})</button>
          <button class="tab ${filterType === 'leave' ? 'active' : ''}" onclick="setFilter('leave')">ขอลา</button>
          <button class="tab ${filterType === 'swap' ? 'active' : ''}" onclick="setFilter('swap')">สลับเวร</button>
          <button class="tab ${filterType === 'replacement' ? 'active' : ''}" onclick="setFilter('replacement')">หาคนแทน</button>
        </div>
      </div>

      <div class="request-list">
        ${filtered.map((req, i) => {
      const status = getStatusBadge(req.status);
      return `
          <div class="request-card animate-fade-in-up delay-${Math.min(i + 1, 5)}">
            <div class="request-type-icon ${req.type}">${getIcon(req.type)}</div>
            <div class="request-body">
              <div class="request-title">${getRequestTypeName(req.type)} — ${req.doctor}</div>
              <div class="request-meta">
                <span>${icons.hospital} <span style="vertical-align:middle">${req.dept}</span></span>
                <span>${icons.calendar} <span style="vertical-align:middle">${req.date}</span></span>
                <span>${icons.clock} <span style="vertical-align:middle">ยื่นเมื่อ ${req.createdAt}</span></span>
              </div>
              ${req.reason ? `<div class="request-reason">${req.reason}</div>` : ''}
              ${req.type === 'swap' && req.swapWith ? `
                <div class="request-swap-info">
                  <span>${req.doctor} (${req.date})</span>
                  <span class="swap-arrow">${icons.swap}</span>
                  <span>${req.swapWith} (${req.swapDate})</span>
                </div>
              ` : ''}
              ${req.status === 'approved' && req.approvedBy ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-2);">${icons.checkCircle} <span style="vertical-align:middle">อนุมัติโดย ${req.approvedBy}</span></div>` : ''}
            </div>
            <div class="request-actions">
              <span class="badge ${status.class} badge-dot">${status.text}</span>
              ${req.status === 'pending' ? `
                <button class="btn btn-sm btn-success">${icons.check} <span style="vertical-align:middle">อนุมัติ</span></button>
                <button class="btn btn-sm btn-danger">${icons.x} <span style="vertical-align:middle">ไม่อนุมัติ</span></button>
              ` : ''}
            </div>
          </div>
          `;
    }).join('')}
      </div>

      <!-- New Request Modal -->
      <div class="modal-overlay" id="newRequestModal">
        <div class="modal" style="max-width:600px;">
          <div class="modal-header">
            <h3>สร้างคำขอใหม่</h3>
            <button class="modal-close" onclick="closeNewRequest()">${icons.x}</button>
          </div>
          <form class="new-request-form">
            <div class="form-group">
              <label class="form-label">ประเภทคำขอ</label>
              <select class="form-select">
                <option value="leave">ขอลา</option>
                <option value="swap">สลับเวร</option>
                <option value="replacement">หาคนแทน</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">วันที่เริ่ม</label>
                <input type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">วันที่สิ้นสุด</label>
                <input type="date" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">เหตุผล</label>
              <textarea class="form-textarea" placeholder="ระบุเหตุผล..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeNewRequest()">ยกเลิก</button>
              <button type="submit" class="btn btn-primary">ส่งคำขอ</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  render();

  window.setFilter = function (type) { filterType = type; render(); };
  window.showNewRequest = function () { document.getElementById('newRequestModal').classList.add('active'); };
  window.closeNewRequest = function () { document.getElementById('newRequestModal').classList.remove('active'); };
});
