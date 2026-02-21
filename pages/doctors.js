// ==========================================
// PrinCare — Doctors Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { DOCTORS, DEPARTMENTS } from '../src/js/mock-data.js';
import { getStatusBadge } from '../src/js/utils.js';

initApp('doctors', 'ข้อมูลแพทย์', ['หน้าหลัก', 'ข้อมูลแพทย์']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('doctorsContent');
  let searchTerm = '';
  let filterDept = 'all';
  let filterStatus = 'all';

  function render() {
    let filtered = [...DOCTORS];
    if (searchTerm) filtered = filtered.filter(d => d.name.includes(searchTerm) || d.specialty.includes(searchTerm));
    if (filterDept !== 'all') filtered = filtered.filter(d => d.dept === filterDept);
    if (filterStatus !== 'all') filtered = filtered.filter(d => d.status === filterStatus);

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${icons.users} <span style="vertical-align:middle">ข้อมูลแพทย์</span></h1>
          <p class="page-subtitle">จัดการข้อมูลแพทย์ทั้งหมด ${DOCTORS.length} คน</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary">${icons.plus} <span style="vertical-align:middle">เพิ่มแพทย์ใหม่</span></button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="doctors-toolbar animate-fade-in">
        <div class="search-box">
          <span class="search-box-icon">${icons.search}</span>
          <input type="text" class="search-box-input" id="searchInput" placeholder="ค้นหาแพทย์..." value="${searchTerm}" />
        </div>
        <div class="doctors-filters">
          <select class="form-select" id="deptFilter">
            <option value="all">ทุกแผนก</option>
            ${DEPARTMENTS.map(d => `<option value="${d.name}" ${filterDept === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
          </select>
          <select class="form-select" id="statusFilter">
            <option value="all">ทุกสถานะ</option>
            <option value="active" ${filterStatus === 'active' ? 'selected' : ''}>ปฏิบัติงาน</option>
            <option value="on-leave" ${filterStatus === 'on-leave' ? 'selected' : ''}>ลา</option>
          </select>
        </div>
      </div>

      <!-- Doctor Grid -->
      <div class="doctors-grid">
        ${filtered.map((doc, i) => {
      const status = doc.status === 'active' ? { text: 'ปฏิบัติงาน', class: 'badge-success' } : { text: 'ลา', class: 'badge-warning' };
      const dept = DEPARTMENTS.find(d => d.name === doc.dept);
      return `
          <div class="doctor-card animate-fade-in-up delay-${Math.min(i + 1, 5)}" onclick="showProfile('${doc.id}')">
            <div class="doctor-card-header">
              <div class="doctor-avatar" style="background:${dept?.color || '#4A90B8'}20;color:${dept?.color || '#4A90B8'}">${doc.avatar}</div>
              <div>
                <div class="doctor-name">${doc.name}</div>
                <div class="doctor-position">${doc.position}</div>
              </div>
              <span class="badge ${status.class} badge-dot">${status.text}</span>
            </div>
            <div class="doctor-details">
              <div class="doctor-detail">${icons.hospital} <span>${doc.dept}</span></div>
              <div class="doctor-detail">${icons.star} <span>${doc.specialty}</span></div>
              <div class="doctor-detail">${icons.fileText} <span>ใบอนุญาต: ${doc.license}</span></div>
              <div class="doctor-detail">${icons.phone} <span>${doc.phone}</span></div>
            </div>
            ${doc.constraints ? `<div class="doctor-constraint">${icons.alert} <span>${doc.constraints}</span></div>` : ''}
            <div class="doctor-card-footer">
              <span class="badge badge-neutral">ระดับ: ${doc.seniority}</span>
            </div>
          </div>
        `}).join('')}
      </div>

      <!-- Doctor Modal -->
      <div class="modal-overlay" id="doctorModal">
        <div class="modal" style="max-width:700px;">
          <div class="modal-header">
            <h3>โปรไฟล์แพทย์</h3>
            <button class="modal-close" onclick="closeProfile()">${icons.x}</button>
          </div>
          <div id="profileContent"></div>
        </div>
      </div>
    `;

    // Events
    document.getElementById('searchInput').addEventListener('input', e => { searchTerm = e.target.value; render(); });
    document.getElementById('deptFilter').addEventListener('change', e => { filterDept = e.target.value; render(); });
    document.getElementById('statusFilter').addEventListener('change', e => { filterStatus = e.target.value; render(); });
  }

  render();

  window.showProfile = function (docId) {
    const doc = DOCTORS.find(d => d.id === docId);
    if (!doc) return;
    const dept = DEPARTMENTS.find(d => d.name === doc.dept);
    document.getElementById('profileContent').innerHTML = `
      <div style="display:flex;align-items:center;gap:var(--space-5);margin-bottom:var(--space-6);">
        <div class="doctor-avatar" style="width:80px;height:80px;font-size:var(--font-size-2xl);background:${dept?.color || '#4A90B8'}20;color:${dept?.color || '#4A90B8'}">${doc.avatar}</div>
        <div>
          <h2 style="margin-bottom:var(--space-1)">${doc.name}</h2>
          <p style="color:var(--color-text-secondary)">${doc.position} — ${doc.dept}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="form-group"><label class="form-label">ความเชี่ยวชาญ</label><p>${doc.specialty}</p></div>
        <div class="form-group"><label class="form-label">ระดับ</label><p>${doc.seniority}</p></div>
        <div class="form-group"><label class="form-label">ใบอนุญาต</label><p>${doc.license}</p></div>
        <div class="form-group"><label class="form-label">โทรศัพท์</label><p>${doc.phone}</p></div>
        <div class="form-group"><label class="form-label">ข้อจำกัด</label><p>${doc.constraints || 'ไม่มี'}</p></div>
        <div class="form-group"><label class="form-label">สถานะ</label><p>${doc.status === 'active' ? 'ปฏิบัติงาน' : 'ลา'}</p></div>
      </div>
    `;
    document.getElementById('doctorModal').classList.add('active');
  };

  window.closeProfile = function () {
    document.getElementById('doctorModal').classList.remove('active');
  };
});
