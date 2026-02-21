// ==========================================
// PrinCare — Settings Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPost, apiPut, apiDelete, requireAuth } from '../src/js/api.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('settings', 'ตั้งค่าระบบ', ['หน้าหลัก', 'ตั้งค่าระบบ']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('settingsContent');
  let activeTab = 'departments';

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;
    try {
      const [departments, shiftTypes, holidays, rules, auditLog] = await Promise.all([
        apiGet('/settings/departments'), apiGet('/settings/shift-types'), apiGet('/settings/holidays'), apiGet('/settings/rules'), apiGet('/settings/audit-log')
      ]);

      content.innerHTML = `
        <div class="page-header"><div><h1 class="page-title">${icons.settings} <span style="vertical-align:middle">ตั้งค่าระบบ</span></h1></div></div>
        <div class="settings-tabs">
          <button class="tab ${activeTab === 'departments' ? 'active' : ''}" onclick="setTab('departments')">${icons.hospital} แผนก</button>
          <button class="tab ${activeTab === 'shifts' ? 'active' : ''}" onclick="setTab('shifts')">${icons.clock} ประเภทเวร</button>
          <button class="tab ${activeTab === 'rules' ? 'active' : ''}" onclick="setTab('rules')">${icons.shield} กฎระบบ</button>
          <button class="tab ${activeTab === 'holidays' ? 'active' : ''}" onclick="setTab('holidays')">${icons.calendar} วันหยุด</button>
          <button class="tab ${activeTab === 'audit' ? 'active' : ''}" onclick="setTab('audit')">${icons.fileText} ประวัติ</button>
        </div>
        <div class="card settings-content">
          ${activeTab === 'departments' ? `
            <div class="section-header"><h3>แผนกทั้งหมด (${departments.length})</h3><button class="btn btn-sm btn-primary" onclick="addDept()">+เพิ่มแผนก</button></div>
            <table class="table"><thead><tr><th>ชื่อแผนก</th><th>สี</th><th>แพทย์ขั้นต่ำ</th><th>จำนวนแพทย์</th><th></th></tr></thead><tbody>
              ${departments.map(d => `<tr><td>${d.name}</td><td><span class="legend-dot" style="background:${d.color};display:inline-block;width:16px;height:16px;border-radius:50%;"></span></td><td>${d.min_staff}</td><td>${d.total_doctors}</td><td><button class="btn btn-sm btn-danger" onclick="delDept('${d.id}')">${icons.trash}</button></td></tr>`).join('')}
            </tbody></table>
          ` : activeTab === 'shifts' ? `
            <div class="section-header"><h3>ประเภทเวร (${shiftTypes.length})</h3></div>
            <table class="table"><thead><tr><th>ชื่อ</th><th>เวลา</th><th>สี</th></tr></thead><tbody>
              ${shiftTypes.map(s => `<tr><td>${s.name}</td><td>${s.time}</td><td><span style="background:${s.color};display:inline-block;width:16px;height:16px;border-radius:50%;"></span></td></tr>`).join('')}
            </tbody></table>
          ` : activeTab === 'rules' ? `
            <div class="section-header"><h3>กฎการจัดเวร</h3><button class="btn btn-sm btn-primary" onclick="saveRules()">บันทึก</button></div>
            <div class="rules-form">
              <div class="form-group"><label class="form-label">ชั่วโมงพักขั้นต่ำ</label><input class="form-input" id="rule_min_rest" type="number" value="${rules.min_rest_hours || 10}" /></div>
              <div class="form-group"><label class="form-label">เวรดึกสูงสุด/เดือน</label><input class="form-input" id="rule_max_night" type="number" value="${rules.max_night_shifts_per_month || 8}" /></div>
              <div class="form-group"><label class="form-label">เวรดึกติดต่อกันสูงสุด</label><input class="form-input" id="rule_consec" type="number" value="${rules.max_consecutive_nights || 2}" /></div>
              <div class="form-group"><label class="form-label">ชั่วโมงทำงานสูงสุด/สัปดาห์</label><input class="form-input" id="rule_weekly" type="number" value="${rules.max_weekly_hours || 60}" /></div>
            </div>
          ` : activeTab === 'holidays' ? `
            <div class="section-header"><h3>วันหยุดราชการ (${holidays.length})</h3></div>
            <table class="table"><thead><tr><th>วันที่</th><th>ชื่อวันหยุด</th><th></th></tr></thead><tbody>
              ${holidays.map(h => `<tr><td>${h.date}</td><td>${h.name}</td><td><button class="btn btn-sm btn-danger" onclick="delHol(${h.id})">${icons.trash}</button></td></tr>`).join('')}
            </tbody></table>
          ` : activeTab === 'audit' ? `
            <div class="section-header"><h3>ประวัติการเปลี่ยนแปลง</h3></div>
            <div class="audit-list">
              ${auditLog.map(a => `<div class="audit-item">
                <div class="audit-action">${a.action}</div>
                <div class="audit-detail">${a.detail}</div>
                <div class="audit-meta">${icons.user} <span style="vertical-align:middle">${a.user}</span> · ${icons.clock} <span style="vertical-align:middle">${a.timestamp}</span></div>
              </div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
  }
  render();
  window.setTab = (t) => { activeTab = t; render(); };
  window.addDept = async () => { const n = prompt('ชื่อแผนกใหม่:'); if (n) { await apiPost('/settings/departments', { name: n }); render(); } };
  window.delDept = async (id) => { if (confirm('ลบแผนกนี้?')) { await apiDelete(`/settings/departments/${id}`); render(); } };
  window.delHol = async (id) => { if (confirm('ลบวันหยุดนี้?')) { await apiDelete(`/settings/holidays/${id}`); render(); } };
  window.saveRules = async () => {
    await apiPut('/settings/rules', {
      min_rest_hours: document.getElementById('rule_min_rest').value,
      max_night_shifts_per_month: document.getElementById('rule_max_night').value,
      max_consecutive_nights: document.getElementById('rule_consec').value,
      max_weekly_hours: document.getElementById('rule_weekly').value,
    });
    alert('บันทึกกฎสำเร็จ');
  };
});
