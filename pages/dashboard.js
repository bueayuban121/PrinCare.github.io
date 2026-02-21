// ==========================================
// PrinCare — Dashboard Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { CURRENT_USER, DOCTORS, DEPARTMENTS, NOTIFICATIONS, REQUESTS, SCHEDULE_DATA, SHIFT_TYPES } from '../src/js/mock-data.js';
import { getGreeting, formatThaiDate, formatNumber, getStatusBadge, drawBarChart, drawDonutChart, animateNumber } from '../src/js/utils.js';

initApp('dashboard', 'แดชบอร์ด', ['หน้าหลัก', 'แดชบอร์ด']);

document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('dashboardContent');
    const today = new Date();
    const greeting = getGreeting();

    const activeDoctors = DOCTORS.filter(d => d.status === 'active').length;
    const pendingRequests = REQUESTS.filter(r => r.status === 'pending').length;
    const todayStr = `2569-02-21`;
    const todayShifts = SCHEDULE_DATA.filter(s => s.date === todayStr);
    const onDutyDoctors = todayShifts.length;
    const emergencyDept = DEPARTMENTS.find(d => d.id === 'DEP06');

    content.innerHTML = `
    <!-- Greeting banner -->
    <div class="greeting-banner animate-fade-in">
      <div class="greeting-text">
        <p>${greeting}</p>
        <h2>${CURRENT_USER.name}</h2>
        <span class="greeting-date">${icons.calendar} <span style="vertical-align:middle">${formatThaiDate(today)}</span></span>
      </div>
      <div class="greeting-stats">
        <div class="greeting-stat"><span class="greeting-stat-value" data-target="${onDutyDoctors}">0</span><span class="greeting-stat-label">แพทย์ออนดิวตี้วันนี้</span></div>
        <div class="greeting-stat"><span class="greeting-stat-value" data-target="${DOCTORS.length}">0</span><span class="greeting-stat-label">แพทย์ทั้งหมด</span></div>
        <div class="greeting-stat"><span class="greeting-stat-value" data-target="${DEPARTMENTS.length}">0</span><span class="greeting-stat-label">แผนก</span></div>
        <div class="greeting-stat"><span class="greeting-stat-value" data-target="${pendingRequests}">0</span><span class="greeting-stat-label">คำขอรออนุมัติ</span></div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid">
      <div class="stat-card blue animate-fade-in-up delay-1">
        <div class="stat-icon blue">${icons.userDoctor}</div>
        <div class="stat-info">
          <div class="stat-label">แพทย์ออนดิวตี้วันนี้</div>
          <div class="stat-value" data-target="${onDutyDoctors}">0</div>
          <div class="stat-change up">${icons.trendingUp} <span style="vertical-align:middle">2 จากเมื่อวาน</span></div>
        </div>
      </div>
      <div class="stat-card green animate-fade-in-up delay-2">
        <div class="stat-icon green">${icons.checkCircle}</div>
        <div class="stat-info">
          <div class="stat-label">แพทย์พร้อมปฏิบัติงาน</div>
          <div class="stat-value" data-target="${activeDoctors}">0</div>
          <div class="stat-change up">${icons.trendingUp} <span style="vertical-align:middle">1 จากสัปดาห์ที่แล้ว</span></div>
        </div>
      </div>
      <div class="stat-card orange animate-fade-in-up delay-3">
        <div class="stat-icon orange">${icons.clipboard}</div>
        <div class="stat-info">
          <div class="stat-label">คำขอรออนุมัติ</div>
          <div class="stat-value" data-target="${pendingRequests}">0</div>
          <div class="stat-change down">${icons.trendingDown} <span style="vertical-align:middle">1 จากเมื่อวาน</span></div>
        </div>
      </div>
      <div class="stat-card red animate-fade-in-up delay-4">
        <div class="stat-icon red">${icons.alertCircle}</div>
        <div class="stat-info">
          <div class="stat-label">แผนกขาดแคลน</div>
          <div class="stat-value" data-target="1">0</div>
          <div class="stat-change" style="color:var(--color-danger);">แผนก ER ต้องการ 2 คน</div>
        </div>
      </div>
    </div>

    <!-- Content row -->
    <div class="dashboard-row">
      <!-- Today schedule -->
      <div class="card dashboard-left animate-fade-in-up delay-3">
        <div class="card-header">
          <h3>ตารางเวรวันนี้</h3>
          <a href="/pages/schedule.html" class="btn btn-sm btn-ghost">ดูทั้งหมด</a>
        </div>
        <div class="schedule-list">
          ${todayShifts.slice(0, 5).map(shift => {
        const doc = DOCTORS.find(d => d.id === shift.doctor);
        const shiftType = SHIFT_TYPES.find(st => st.id === shift.shift);
        const dept = DEPARTMENTS.find(dep => dep.id === shift.dept);
        return `
              <div class="schedule-item">
                <div class="schedule-avatar" style="background:${dept?.color || '#4A90B8'}20;color:${dept?.color || '#4A90B8'}">${doc?.avatar || '?'}</div>
                <div class="schedule-info">
                  <div class="schedule-name">${doc?.name || 'N/A'}</div>
                  <div class="schedule-dept">${dept?.name || 'N/A'}</div>
                </div>
                <div class="schedule-shift">
                  <span class="badge" style="background:${shiftType?.color}20;color:${shiftType?.color}">${shiftType?.name}</span>
                  <span class="schedule-time">${shiftType?.time}</span>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>

      <!-- Alerts and pending -->
      <div class="dashboard-right">
        <!-- Emergency alerts -->
        <div class="card animate-fade-in-up delay-4">
          <div class="card-header">
            <h3>การแจ้งเตือนฉุกเฉิน</h3>
          </div>
          <div class="alert-card critical">
            <div class="alert-card-header">
              <span class="alert-card-icon">${icons.alertCircle}</span>
              <span class="alert-card-title">แผนก ER ขาดแคลนแพทย์</span>
            </div>
            <p class="alert-card-desc">วันที่ 28 ก.พ. 2569 ต้องการแพทย์เพิ่ม 2 คน (ขั้นต่ำ 3 คน มีอยู่ 1 คน)</p>
            <button class="btn btn-sm btn-primary">จัดการ</button>
          </div>
          <div class="alert-card warning" style="margin-top:var(--space-3)">
            <div class="alert-card-header">
              <span class="alert-card-icon">${icons.alert}</span>
              <span class="alert-card-title">เวรดึกติดกันเกินกำหนด</span>
            </div>
            <p class="alert-card-desc">นพ.กิตติ ชาญเลิศ มีเวรดึก 3 คืนติดต่อกัน (เกินกำหนด 2 คืน)</p>
          </div>
        </div>

        <!-- Pending requests -->
        <div class="card animate-fade-in-up delay-5" style="margin-top:var(--space-4)">
          <div class="card-header">
            <h3>คำขอรอดำเนินการ</h3>
            <a href="/pages/requests.html" class="btn btn-sm btn-ghost">ดูทั้งหมด</a>
          </div>
          ${REQUESTS.filter(r => r.status === 'pending').map(req => `
            <div class="pending-item">
              <div class="pending-info">
                <div class="pending-title">${req.doctor}</div>
                <div class="pending-desc">${req.type === 'leave' ? 'ขอลา' : req.type === 'swap' ? 'สลับเวร' : 'หาคนแทน'} — ${req.date}</div>
              </div>
              <div class="pending-actions">
                <button class="btn btn-sm btn-success">${icons.check}</button>
                <button class="btn btn-sm btn-danger">${icons.x}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row animate-fade-in-up delay-5">
      <div class="card chart-card">
        <div class="card-header"><h3>ชั่วโมงทำงานรายแผนก</h3></div>
        <div class="chart-container"><canvas id="deptChart"></canvas></div>
      </div>
      <div class="card chart-card">
        <div class="card-header"><h3>สัดส่วนแพทย์ตามแผนก</h3></div>
        <div class="chart-container"><canvas id="donutChart"></canvas></div>
        <div class="donut-legend">
          ${DEPARTMENTS.slice(0, 5).map(d => `
            <div class="donut-legend-item">
              <span class="donut-legend-dot" style="background:${d.color}"></span> ${d.name}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

    // Animate numbers
    document.querySelectorAll('[data-target]').forEach(el => {
        animateNumber(el, parseInt(el.dataset.target));
    });

    // Render Charts
    setTimeout(() => {
        const deptNames = DEPARTMENTS.map(d => d.name.substring(0, 4));
        const deptValues = [42, 36, 28, 22, 18, 45, 20, 12];
        const deptColors = DEPARTMENTS.map(d => d.color);

        drawBarChart(document.getElementById('deptChart'), {
            labels: deptNames, values: deptValues, colors: deptColors
        });

        drawDonutChart(document.getElementById('donutChart'), {
            values: DEPARTMENTS.slice(0, 5).map(d => d.totalDoctors),
            colors: DEPARTMENTS.slice(0, 5).map(d => d.color),
        });
    }, 400);
});
