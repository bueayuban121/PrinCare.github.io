// ==========================================
// PrinCare — Settings Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { DEPARTMENTS, SHIFT_TYPES, HOLIDAYS, AUDIT_LOG } from '../src/js/mock-data.js';

initApp('settings', 'ตั้งค่าระบบ', ['หน้าหลัก', 'ตั้งค่าระบบ']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('settingsContent');
  let activeTab = 'departments';

  function render() {
    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${icons.settings} <span style="vertical-align:middle">ตั้งค่าระบบ</span></h1>
          <p class="page-subtitle">จัดการการตั้งค่าทั้งหมดของระบบ PrinCare</p>
        </div>
      </div>

      <div class="settings-tabs">
        <div class="tabs">
          <button class="tab ${activeTab === 'departments' ? 'active' : ''}" onclick="setTab('departments')">${icons.hospital} <span style="vertical-align:middle">แผนก</span></button>
          <button class="tab ${activeTab === 'shifts' ? 'active' : ''}" onclick="setTab('shifts')">${icons.clock} <span style="vertical-align:middle">ประเภทเวร</span></button>
          <button class="tab ${activeTab === 'rules' ? 'active' : ''}" onclick="setTab('rules')">${icons.shield} <span style="vertical-align:middle">กฎการจัดเวร</span></button>
          <button class="tab ${activeTab === 'holidays' ? 'active' : ''}" onclick="setTab('holidays')">${icons.flag} <span style="vertical-align:middle">วันหยุด</span></button>
          <button class="tab ${activeTab === 'audit' ? 'active' : ''}" onclick="setTab('audit')">${icons.list} <span style="vertical-align:middle">Audit Log</span></button>
        </div>
      </div>

      <div id="tabContent">${renderTab()}</div>
    `;
  }

  function renderTab() {
    switch (activeTab) {
      case 'departments': return renderDepts();
      case 'shifts': return renderShifts();
      case 'rules': return renderRules();
      case 'holidays': return renderHolidays();
      case 'audit': return renderAudit();
      default: return '';
    }
  }

  function renderDepts() {
    return `
      <div class="settings-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5);">
          <h3>จัดการแผนก (${DEPARTMENTS.length} แผนก)</h3>
          <button class="btn btn-primary">${icons.plus} <span style="vertical-align:middle">เพิ่มแผนก</span></button>
        </div>
        <div class="dept-grid">
          ${DEPARTMENTS.map((d, i) => `
            <div class="dept-card animate-fade-in-up delay-${Math.min(i + 1, 5)}" style="border-left-color:${d.color}">
              <div class="dept-card-name">${d.name}</div>
              <div class="dept-card-meta">
                <span>${icons.userDoctor} <span style="vertical-align:middle">แพทย์ทั้งหมด: ${d.totalDoctors} คน</span></span>
                <span>${icons.clipboard} <span style="vertical-align:middle">จำนวนขั้นต่ำต่อเวร: ${d.minStaff} คน</span></span>
                <span style="display:flex;align-items:center;gap:4px;">${icons.palette} สี: <span style="width:16px;height:16px;border-radius:4px;background:${d.color};display:inline-block;"></span></span>
              </div>
              <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);">
                <button class="btn btn-sm btn-ghost">${icons.edit} <span style="vertical-align:middle">แก้ไข</span></button>
                <button class="btn btn-sm btn-ghost" style="color:var(--color-danger)">${icons.trash} <span style="vertical-align:middle">ลบ</span></button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  function renderShifts() {
    return `
      <div class="settings-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5);">
          <h3>ประเภทเวร (${SHIFT_TYPES.length} ประเภท)</h3>
          <button class="btn btn-primary">${icons.plus} <span style="vertical-align:middle">เพิ่มประเภทเวร</span></button>
        </div>
        <div class="shift-config-list">
          ${SHIFT_TYPES.map(s => `
            <div class="shift-config-item">
              <span class="shift-color-dot" style="background:${s.color}"></span>
              <span class="shift-icon" style="color:${s.color}">${icons[s.iconKey] || ''}</span>
              <span class="shift-config-name">${s.name}</span>
              <span class="shift-config-time">${s.time}</span>
              <div class="shift-config-actions">
                <button class="btn btn-sm btn-ghost">${icons.edit}</button>
                <button class="btn btn-sm btn-ghost" style="color:var(--color-danger)">${icons.trash}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  function renderRules() {
    const rules = [
      { icon: icons.clock, name: 'ชั่วโมงพักขั้นต่ำระหว่างเวร', value: '10 ชม.' },
      { icon: icons.moon, name: 'เวรดึกสูงสุดต่อเดือน', value: '8 เวร' },
      { icon: icons.swap, name: 'เวรดึกติดต่อกันสูงสุด', value: '2 คืน' },
      { icon: icons.calendar, name: 'เวรวันหยุดนักขัตฤกษ์สูงสุด', value: '2 เวร/เดือน' },
      { icon: icons.target, name: 'ความสมดุลภาระงาน', value: '±10%' },
      { icon: icons.shield, name: 'ข้อจำกัดแพทย์ตั้งครรภ์', value: 'ไม่มีเวรดึก' },
      { icon: icons.hospital, name: 'แพทย์ขั้นต่ำต่อเวร ER', value: '3 คน' },
      { icon: icons.activity, name: 'ชั่วโมงทำงานสูงสุดต่อสัปดาห์', value: '60 ชม.' },
    ];

    return `
      <div class="settings-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5);">
          <h3>กฎการจัดเวร (Business Rules)</h3>
          <button class="btn btn-primary">${icons.save} <span style="vertical-align:middle">บันทึก</span></button>
        </div>
        <div class="card">
          ${rules.map(r => `
            <div class="settings-row">
              <div class="settings-row-info" style="display:flex;align-items:center;gap:var(--space-3);">
                <span style="color:var(--color-primary)">${r.icon}</span>
                <h5>${r.name}</h5>
              </div>
              <span style="font-weight:var(--font-weight-semibold);color:var(--color-primary);">${r.value}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  function renderHolidays() {
    return `
      <div class="settings-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-5);">
          <h3>วันหยุดนักขัตฤกษ์ ปี 2569 (${HOLIDAYS.length} วัน)</h3>
          <button class="btn btn-primary">${icons.plus} <span style="vertical-align:middle">เพิ่มวันหยุด</span></button>
        </div>
        <div class="holiday-list">
          ${HOLIDAYS.map(h => `
            <div class="holiday-item">
              <span class="holiday-date">${h.date.split('-').slice(1).reverse().join('/')}</span>
              <span>${h.name}</span>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  function renderAudit() {
    return `
      <div class="settings-section">
        <h3>Audit Log — ประวัติการแก้ไข</h3>
        <div class="audit-timeline" style="margin-top:var(--space-5);">
          ${AUDIT_LOG.map(a => `
            <div class="audit-item">
              <div class="audit-action">${a.action}</div>
              <div class="audit-detail">${a.detail}</div>
              <div class="audit-meta">
                <span>${icons.user} <span style="vertical-align:middle">${a.user}</span></span>
                <span>${icons.clock} <span style="vertical-align:middle">${a.timestamp}</span></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  render();
  window.setTab = function (tab) { activeTab = tab; render(); };
});
