// ==========================================
// PrinCare — Schedule Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { DOCTORS, DEPARTMENTS, SHIFT_TYPES, SCHEDULE_DATA, HOLIDAYS } from '../src/js/mock-data.js';
import { THAI_MONTHS, THAI_DAYS_SHORT, getDaysInMonth, getFirstDayOfMonth } from '../src/js/utils.js';

initApp('schedule', 'ตารางเวร', ['หน้าหลัก', 'ตารางเวร']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('scheduleContent');
  let currentYear = 2026;
  let currentMonth = 1;
  let viewMode = 'month';

  function getShiftClass(shiftId) {
    const map = { SH01: 'morning', SH02: 'afternoon', SH03: 'night', SH04: 'opd', SH05: 'er', SH06: 'icu', SH07: 'oncall' };
    return map[shiftId] || '';
  }

  function getShiftName(shiftId) {
    const shift = SHIFT_TYPES.find(s => s.id === shiftId);
    return shift ? shift.name : '';
  }

  function getDoctorName(docId) {
    const doc = DOCTORS.find(d => d.id === docId);
    return doc ? doc.name.replace(/^(นพ\.|พญ\.)/, '').trim().split(' ')[0] : '';
  }

  function render() {
    const thaiYear = currentYear + 543;
    const monthName = THAI_MONTHS[currentMonth];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let cells = '';
    const prevDays = getDaysInMonth(currentYear, currentMonth - 1);

    for (let i = firstDay - 1; i >= 0; i--) {
      cells += `<div class="calendar-cell other-month"><div class="cell-date">${prevDays - i}</div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${thaiYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
      const isSunday = dayOfWeek === 0;
      const isSaturday = dayOfWeek === 6;
      const holiday = HOLIDAYS.find(h => h.date === dateStr);

      const dayShifts = SCHEDULE_DATA.filter(s => s.date === dateStr);
      const maxShow = 3;

      let shiftHTML = '';
      if (holiday) {
        shiftHTML += `<div class="cell-holiday">${holiday.name}</div>`;
      }
      dayShifts.slice(0, maxShow).forEach(s => {
        shiftHTML += `<div class="cell-shift ${getShiftClass(s.shift)}">${getDoctorName(s.doctor)} · ${getShiftName(s.shift)}</div>`;
      });
      if (dayShifts.length > maxShow) {
        shiftHTML += `<div class="cell-more">+${dayShifts.length - maxShow} อื่นๆ</div>`;
      }

      const classes = ['calendar-cell'];
      if (isToday) classes.push('today');
      if (holiday) classes.push('holiday');
      const dateClass = isSunday ? 'sunday' : isSaturday ? 'saturday' : '';

      cells += `
        <div class="${classes.join(' ')}">
          <div class="cell-date ${dateClass}">${day}</div>
          <div class="cell-shifts">${shiftHTML}</div>
        </div>
      `;
    }

    const totalCells = firstDay + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      cells += `<div class="calendar-cell other-month"><div class="cell-date">${i}</div></div>`;
    }

    content.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">${icons.calendar} <span style="vertical-align:middle">ตารางเวร</span></h1>
          <p class="page-subtitle">จัดการและดูตารางเวรแพทย์ทั้งหมด</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary">${icons.zap} <span style="vertical-align:middle">สร้างอัตโนมัติ</span></button>
          <button class="btn btn-primary">${icons.plus} <span style="vertical-align:middle">สร้างตารางเวร</span></button>
        </div>
      </div>

      <div class="schedule-toolbar">
        <div class="schedule-toolbar-left">
          <div class="month-nav">
            <button class="month-nav-btn" id="prevMonth">${icons.chevronLeft}</button>
            <div class="month-title" id="monthTitle">${monthName} ${thaiYear}</div>
            <button class="month-nav-btn" id="nextMonth">${icons.chevronRight}</button>
          </div>
          <button class="btn btn-sm btn-ghost" id="todayBtn">วันนี้</button>
        </div>
        <div class="schedule-toolbar-right">
          <div class="tabs">
            <button class="tab ${viewMode === 'month' ? 'active' : ''}" data-view="month">เดือน</button>
            <button class="tab ${viewMode === 'week' ? 'active' : ''}" data-view="week">สัปดาห์</button>
            <button class="tab ${viewMode === 'day' ? 'active' : ''}" data-view="day">วัน</button>
          </div>
          <select class="form-select" style="width:auto;padding:6px 30px 6px 10px;font-size:var(--font-size-sm);">
            <option value="all">ทุกแผนก</option>
            ${DEPARTMENTS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Conflict Alert -->
      <div class="conflict-alert animate-fade-in">
        <span class="conflict-alert-icon">${icons.alert}</span>
        <div>
          <h5>พบความขัดแย้งในตาราง</h5>
          <p>นพ.กิตติ ชาญเลิศ ทำเวรดึก 3 คืนติดต่อกัน (เกินกำหนด 2 คืน) — 23-25 ก.พ. 2569</p>
        </div>
      </div>

      <!-- Calendar -->
      <div class="calendar animate-fade-in-up">
        <div class="calendar-header">
          ${THAI_DAYS_SHORT.map(d => `<div class="calendar-header-cell">${d}</div>`).join('')}
        </div>
        <div class="calendar-body">${cells}</div>
        <div class="shift-legend">
          ${SHIFT_TYPES.map(s => `
            <div class="shift-legend-item">
              <span class="shift-legend-dot" style="background:${s.color}"></span>
              <span>${s.name} (${s.time})</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Scheduling Rules -->
      <div class="rules-panel card animate-fade-in-up" style="margin-top:var(--space-6);">
        <div class="card-header">
          <h3>กฎการจัดเวร</h3>
          <button class="btn btn-sm btn-ghost">แก้ไข</button>
        </div>
        <div class="rule-item"><span class="rule-icon">${icons.clock}</span> ชั่วโมงพักขั้นต่ำระหว่างเวร <span class="rule-value">10 ชม.</span></div>
        <div class="rule-item"><span class="rule-icon">${icons.moon}</span> จำนวนเวรดึกสูงสุดต่อเดือน <span class="rule-value">8 เวร</span></div>
        <div class="rule-item"><span class="rule-icon">${icons.calendar}</span> จำนวนเวรวันหยุดนักขัตฤกษ์ <span class="rule-value">2 เวร/เดือน</span></div>
        <div class="rule-item"><span class="rule-icon">${icons.target}</span> ความสมดุลภาระงาน <span class="rule-value">±10%</span></div>
        <div class="rule-item"><span class="rule-icon">${icons.swap}</span> จำนวนเวรดึกติดต่อกันสูงสุด <span class="rule-value">2 คืน</span></div>
      </div>
    `;

    document.getElementById('prevMonth').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      render();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      render();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
      currentYear = today.getFullYear();
      currentMonth = today.getMonth();
      render();
    });

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        viewMode = tab.dataset.view;
        render();
      });
    });
  }

  render();
});
