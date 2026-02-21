// ==========================================
// PrinCare — Schedule Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, requireAuth } from '../src/js/api.js';
import { THAI_DAYS_SHORT, THAI_MONTHS, getDaysInMonth, getFirstDayOfMonth } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('schedule', 'ตารางเวร', ['หน้าหลัก', 'ตารางเวร']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('scheduleContent');
  let currentMonth = 1; // Feb (0-indexed)
  let currentYear = 2026;
  let currentDept = 'all';
  let departments = [];
  let shiftTypes = [];

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:500px;border-radius:16px;"></div>`;
    try {
      const thaiMonth = String(currentMonth + 1).padStart(2, '0');
      const thaiYear = currentYear + 543;
      [departments, shiftTypes] = await Promise.all([apiGet('/settings/departments'), apiGet('/settings/shift-types')]);
      const schedules = await apiGet(`/schedules?month=${thaiMonth}&year=${thaiYear}${currentDept !== 'all' ? `&dept=${currentDept}` : ''}`);

      const daysInMonth = getDaysInMonth(currentYear, currentMonth);
      const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
      const today = new Date();

      content.innerHTML = `
        <div class="page-header">
          <div><h1 class="page-title">${icons.calendar} <span style="vertical-align:middle">ตารางเวร</span></h1></div>
          <div class="page-actions">
            <select class="form-select" onchange="changeDept(this.value)" style="min-width:160px;">
              <option value="all">ทุกแผนก</option>
              ${departments.map(d => `<option value="${d.id}" ${currentDept === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
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
          `<div class="calendar-event" style="background:${s.shift_color || '#4A90B8'}20;color:${s.shift_color || '#4A90B8'};border-left:3px solid ${s.shift_color}">
                    <span class="event-name">${s.doctor_name?.split(' ')[0] || ''}</span>
                    <span class="event-shift">${s.shift_name || ''}</span>
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
      `;
    } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
  }
  render();
  window.prevMonth = () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } render(); };
  window.nextMonth = () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } render(); };
  window.changeDept = (v) => { currentDept = v; render(); };
});
