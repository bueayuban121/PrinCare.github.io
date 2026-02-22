// ==========================================
// PrinCare — Schedule Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPost, apiPut, apiDelete, requireAuth } from '../src/js/api.js';
import { THAI_DAYS_SHORT, THAI_MONTHS, getDaysInMonth, getFirstDayOfMonth, BRANCHES } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('schedule', 'ตารางเวร', ['หน้าหลัก', 'ตารางเวร']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('scheduleContent');
  let currentMonth = new Date().getMonth(); // Dynamic current month
  let currentYear = new Date().getFullYear(); // Dynamic current year
  let currentDept = 'all';
  let currentBranch = 'all';
  let departments = [];
  let shiftTypes = [];
  let allDoctors = [];

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:500px;border-radius:16px;"></div>`;
    try {
      const thaiMonth = String(currentMonth + 1).padStart(2, '0');
      const thaiYear = currentYear + 543;
      [departments, shiftTypes, allDoctors] = await Promise.all([apiGet('/settings/departments'), apiGet('/settings/shift-types'), apiGet('/doctors')]);
      const schedules = await apiGet(`/schedules?month=${thaiMonth}&year=${thaiYear}${currentDept !== 'all' ? `&dept=${currentDept}` : ''}${currentBranch !== 'all' ? `&branch=${currentBranch}` : ''}`);

      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
      const today = new Date();

      content.innerHTML = `
        <div class="page-header">
          <div><h1 class="page-title">${icons.calendar} <span style="vertical-align:middle">ตารางเวร</span></h1></div>
          <div class="page-actions" style="display:flex; gap:10px;">
            <select class="form-select" onchange="changeBranch(this.value)" style="min-width:140px;">
              <option value="all">ทุกสาขา</option>
              ${BRANCHES.map(b => `<option value="${b.id}" ${currentBranch === b.id ? 'selected' : ''}>${b.id} - ${b.name}</option>`).join('')}
            </select>
            <select class="form-select" onchange="changeDept(this.value)" style="min-width:140px;">
              <option value="all">ทุกแผนก</option>
              ${departments.map(d => `<option value="${d.id}" ${currentDept === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
            <button class="btn btn-primary" onclick="showAddSchedule()">${icons.plus} จัดเวร</button>
          </div>
        </div>
        <div class="card">
          <div class="calendar-header">
            <button class="btn btn-sm btn-secondary" onclick="prevMonth()">${icons.chevronLeft}</button>
            <h3>${THAI_MONTHS[currentMonth]} ${thaiYear}</h3>
            <button class="btn btn-sm btn-secondary" onclick="nextMonth()">${icons.chevronRight}</button>
          </div>
          <div class="calendar-grid">
            ${THAI_DAYS_SHORT.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
            ${Array(firstDay).fill('').map(() => '<div class="calendar-cell empty"></div>').join('')}
            ${Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${thaiYear}-${thaiMonth}-${String(day).padStart(2, '0')}`;
        const daySchedules = schedules.filter(s => s.date === dateStr);
        const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        return `<div class="calendar-cell ${isToday ? 'today' : ''}">
                <div class="calendar-date">${day}</div>
                <div class="calendar-events">${daySchedules.slice(0, 3).map(s =>
          `<div class="calendar-event" style="background:${s.shift_color || '#4A90B8'}20;color:${s.shift_color || '#4A90B8'};border-left:3px solid ${s.shift_color};display:flex;justify-content:space-between;align-items:center;">
                    <div style="flex:1;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" onclick="openEditSchedule('${s.id}')">
                      <span class="event-name">${s.doctor_name?.split(' ')[0] || ''}</span>
                      <span class="event-shift" style="font-size:10px;opacity:0.8;">${s.shift_name || ''}</span>
                    </div>
                    <div style="display:flex;gap:4px;margin-left:4px;">
                      <span style="cursor:pointer;opacity:0.6;" onclick="event.stopPropagation(); deleteScheduleDirect('${s.id}')" title="ลบเวร">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </span>
                    </div>
                  </div>`).join('')}
                  ${daySchedules.length > 3 ? `<div class="calendar-more">+${daySchedules.length - 3} อื่นๆ</div>` : ''}
                </div>
              </div>`;
      }).join('')}
          </div>
        </div>
        <div class="schedule-legend">
          ${shiftTypes.map(s => `<div class="legend-item"><span class="legend-dot" style="background:${s.color}"></span>${s.name} (${s.time})</div>`).join('')}
        </div>

        <div class="modal-overlay" id="addScheduleModal">
          <div class="modal" style="max-width:500px;">
            <div class="modal-header"><h3>จัดตารางเวร</h3><button class="modal-close" onclick="closeAddSchedule()">${icons.x}</button></div>
            <form id="addScheduleForm">
              <div class="form-group"><label class="form-label">สาขา</label>
                <select class="form-select" id="schedBranch" required>
                  ${BRANCHES.map(b => `<option value="${b.id}">${b.id} - ${b.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">แพทย์</label>
                <select class="form-select" id="schedDoctor" required>
                  ${allDoctors.map(d => `<option value="${d.id}">${d.name} (${d.dept})</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">วันที่</label>
                <input type="date" class="form-input" id="schedDate" required />
              </div>
              <div class="form-group"><label class="form-label">ประเภทเวร</label>
                <select class="form-select" id="schedShift" required>
                  ${shiftTypes.map(s => `<option value="${s.id}">${s.name} (${s.time})</option>`).join('')}
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeAddSchedule()">ยกเลิก</button>
                <button type="submit" class="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>

        <div class="modal-overlay" id="editScheduleModal">
          <div class="modal" style="max-width:500px;">
            <div class="modal-header"><h3>แก้ไขตารางเวร</h3><button class="modal-close" onclick="closeEditSchedule()">${icons.x}</button></div>
            <form id="editScheduleForm">
              <input type="hidden" id="editSchedId" />
              <input type="hidden" id="editSchedDept" />
              <input type="hidden" id="editSchedDate" />
              <div class="form-group"><label class="form-label">สาขา</label>
                <select class="form-select" id="editSchedBranch" required>
                  ${BRANCHES.map(b => `<option value="${b.id}">${b.id} - ${b.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">แพทย์</label>
                <select class="form-select" id="editSchedDoctor" required>
                  ${allDoctors.map(d => `<option value="${d.id}">${d.name} (${d.dept})</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label class="form-label">ประเภทเวร</label>
                <select class="form-select" id="editSchedShift" required>
                  ${shiftTypes.map(s => `<option value="${s.id}">${s.name} (${s.time})</option>`).join('')}
                </select>
              </div>
              <div class="modal-footer" style="justify-content: space-between;">
                <button type="button" class="btn btn-danger" onclick="deleteSchedule()" id="delScheduleBtn">${icons.trash} ลบเวร</button>
                <div>
                  <button type="button" class="btn btn-secondary" onclick="closeEditSchedule()">ยกเลิก</button>
                  <button type="submit" class="btn btn-primary">บันทึกการแก้ไข</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      `;

      document.getElementById('addScheduleForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const docId = document.getElementById('schedDoctor').value;
          const shiftId = document.getElementById('schedShift').value;
          const rawDate = document.getElementById('schedDate').value;

          if (!rawDate) throw new Error("Please select a date.");

          // Convert from Christian year to Thai year (YYYY-MM-DD format)
          const [year, month, day] = rawDate.split('-');
          const thaiYear = parseInt(year) + 543;
          const date = `${thaiYear}-${month}-${day}`;

          const doc = allDoctors.find(d => d.id === docId);
          // Assuming department ID matches the doctor's dept mapped to its id, but for simplicity we rely on the backend or lookup
          const deptObj = departments.find(d => d.name === doc.dept) || departments[0];

          await apiPost('/schedules', { date, doctor_id: docId, shift_id: shiftId, dept_id: deptObj.id, branch: document.getElementById('schedBranch').value });
          closeAddSchedule(); render();
        } catch (err) { alert(err.message); }
      });

      document.getElementById('editScheduleForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const id = document.getElementById('editSchedId').value;
          const docId = document.getElementById('editSchedDoctor').value;
          const shiftId = document.getElementById('editSchedShift').value;
          const date = document.getElementById('editSchedDate').value;
          const deptId = document.getElementById('editSchedDept').value; // We might need to update dept if doc changed, but keeping original for simplicity or deriving from doc.

          const doc = allDoctors.find(d => d.id === docId);
          const deptObj = departments.find(d => d.name === doc.dept) || { id: deptId }; // Update dept string if changed

          const { apiPut } = await import('../src/js/api.js');
          await apiPut(`/schedules/${id}`, { date, doctor_id: docId, shift_id: shiftId, dept_id: deptObj.id, branch: document.getElementById('editSchedBranch').value });
          closeEditSchedule(); render();
        } catch (err) { alert(err.message); }
      });

    } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
  }
  render();
  window.prevMonth = () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } render(); };
  window.nextMonth = () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } render(); };
  window.changeDept = (v) => { currentDept = v; render(); };
  window.changeBranch = (v) => { currentBranch = v; render(); };

  window.showAddSchedule = () => document.getElementById('addScheduleModal')?.classList.add('active');
  window.closeAddSchedule = () => document.getElementById('addScheduleModal')?.classList.remove('active');

  window.openEditSchedule = async (id) => {
    try {
      const { apiGet } = await import('../src/js/api.js');
      // For simplicity, we can just find it from the render memory, but let's re-fetch if needed.
      // Wait, schedules are not exposed globally here. We need to fetch the specific schedule or store schedules globally.
      // Refetching all to find one is ok for now.
      const thaiMonth = String(currentMonth + 1).padStart(2, '0');
      const thaiYear = currentYear + 543;
      const schedules = await apiGet(`/schedules?month=${thaiMonth}&year=${thaiYear}${currentDept !== 'all' ? `&dept=${currentDept}` : ''}`);
      const s = schedules.find(sx => sx.id == id);

      if (!s) return alert("Schedule not found");

      document.getElementById('editSchedId').value = s.id;
      document.getElementById('editSchedDate').value = s.date;
      document.getElementById('editSchedDept').value = s.dept_id;
      document.getElementById('editSchedBranch').value = s.branch || 'PSV01';
      document.getElementById('editSchedDoctor').value = s.doctor_id;
      document.getElementById('editSchedShift').value = s.shift_id;
      document.getElementById('editScheduleModal')?.classList.add('active');
    } catch (e) {
      alert("Error opening edit modal: " + e.message);
    }
  };

  window.closeEditSchedule = () => document.getElementById('editScheduleModal')?.classList.remove('active');

  window.deleteScheduleDirect = async (id) => {
    try {
      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเวรนี้?')) return;
      await apiDelete(`/schedules/${id}`);
      render();
    } catch (e) {
      alert("Error deleting schedule: " + e.message);
    }
  };

  window.deleteSchedule = async () => {
    try {
      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเวรนี้?')) return;
      const id = document.getElementById('editSchedId').value;
      await apiDelete(`/schedules/${id}`);
      closeEditSchedule();
      render();
    } catch (e) {
      alert("Error deleting schedule: " + e.message);
    }
  };

});
