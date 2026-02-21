// ==========================================
// PrinCare — Requests Page (API Connected)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPost, apiPut, requireAuth } from '../src/js/api.js';
import { getStatusBadge, getRequestTypeName } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('requests', 'การเปลี่ยนเวร', ['หน้าหลัก', 'การเปลี่ยนเวร']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('requestsContent');
  let filterType = 'all';

  function getIcon(type) {
    return { leave: icons.clipboard, swap: icons.swap, replacement: icons.search }[type] || icons.fileText;
  }

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;
    try {
      const allRequests = await apiGet('/requests');
      const filtered = filterType === 'all' ? allRequests : allRequests.filter(r => r.type === filterType);
      const pendingCount = allRequests.filter(r => r.status === 'pending').length;

      content.innerHTML = `
        <div class="page-header">
          <div>
            <h1 class="page-title">${icons.swap} <span style="vertical-align:middle">การจัดการเปลี่ยนเวร</span></h1>
            <p class="page-subtitle">คำขอทั้งหมด ${allRequests.length} รายการ · รออนุมัติ ${pendingCount} รายการ</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="showNewRequest()">${icons.plus} <span style="vertical-align:middle">สร้างคำขอใหม่</span></button>
          </div>
        </div>

        <div class="requests-header-tabs">
          <div class="tabs">
            <button class="tab ${filterType === 'all' ? 'active' : ''}" onclick="setFilter('all')">ทั้งหมด (${allRequests.length})</button>
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
                <div class="request-title">${getRequestTypeName(req.type)} — ${req.doctor_name}</div>
                <div class="request-meta">
                  <span>${icons.hospital} <span style="vertical-align:middle">${req.dept}</span></span>
                  <span>${icons.calendar} <span style="vertical-align:middle">${req.date}</span></span>
                  <span>${icons.clock} <span style="vertical-align:middle">ยื่นเมื่อ ${req.created_at}</span></span>
                </div>
                ${req.reason ? `<div class="request-reason">${req.reason}</div>` : ''}
                ${req.type === 'swap' && req.swap_with ? `
                  <div class="request-swap-info">
                    <span>${req.doctor_name} (${req.date})</span>
                    <span class="swap-arrow">${icons.swap}</span>
                    <span>${req.swap_with} (${req.swap_date})</span>
                  </div>
                ` : ''}
                ${req.status === 'approved' && req.approved_by ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--space-2);">${icons.checkCircle} <span style="vertical-align:middle">อนุมัติโดย ${req.approved_by}</span></div>` : ''}
              </div>
              <div class="request-actions">
                <span class="badge ${status.class} badge-dot">${status.text}</span>
                ${req.status === 'pending' ? `
                  <button class="btn btn-sm btn-success" onclick="approveReq('${req.id}')">${icons.check} <span style="vertical-align:middle">อนุมัติ</span></button>
                  <button class="btn btn-sm btn-danger" onclick="rejectReq('${req.id}')">${icons.x} <span style="vertical-align:middle">ไม่อนุมัติ</span></button>
                ` : ''}
              </div>
            </div>`;
      }).join('')}
        </div>

        <div class="modal-overlay" id="newRequestModal">
          <div class="modal" style="max-width:600px;">
            <div class="modal-header"><h3>สร้างคำขอใหม่</h3><button class="modal-close" onclick="closeNewRequest()">${icons.x}</button></div>
            <form class="new-request-form" id="newRequestForm">
              <div class="form-group"><label class="form-label">ประเภทคำขอ</label><select class="form-select" id="reqType"><option value="leave">ขอลา</option><option value="swap">สลับเวร</option><option value="replacement">หาคนแทน</option></select></div>
              <div class="form-row"><div class="form-group"><label class="form-label">วันที่</label><input type="text" class="form-input" id="reqDate" placeholder="เช่น 1-3 มี.ค. 2569" /></div></div>
              <div class="form-group"><label class="form-label">เหตุผล</label><textarea class="form-textarea" id="reqReason" placeholder="ระบุเหตุผล..."></textarea></div>
              <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeNewRequest()">ยกเลิก</button><button type="submit" class="btn btn-primary">ส่งคำขอ</button></div>
            </form>
          </div>
        </div>
      `;

      document.getElementById('newRequestForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await apiPost('/requests', {
            type: document.getElementById('reqType').value,
            date: document.getElementById('reqDate').value,
            reason: document.getElementById('reqReason').value,
          });
          closeNewRequest();
          render();
        } catch (err) { alert(err.message); }
      });
    } catch (err) {
      content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`;
    }
  }

  render();

  window.setFilter = (type) => { filterType = type; render(); };
  window.showNewRequest = () => document.getElementById('newRequestModal')?.classList.add('active');
  window.closeNewRequest = () => document.getElementById('newRequestModal')?.classList.remove('active');
  window.approveReq = async (id) => { await apiPut(`/requests/${id}/approve`); render(); };
  window.rejectReq = async (id) => { await apiPut(`/requests/${id}/reject`); render(); };
});
