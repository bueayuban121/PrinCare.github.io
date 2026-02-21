// ==========================================
// PrinCare — Dashboard Page (API Connected)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, requireAuth, getUser } from '../src/js/api.js';
import { getGreeting, formatThaiDate, drawBarChart, drawDonutChart, animateNumber, formatNumber } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('dashboard', 'แดชบอร์ด', ['หน้าหลัก', 'แดชบอร์ด']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('dashboardContent');
  const today = new Date();
  const greeting = getGreeting();
  const user = getUser();

  content.innerHTML = `<div class="skeleton" style="height:200px;border-radius:16px;"></div>`;

  try {
    const [stats, requests, doctors, schedules, departments, shiftTypes] = await Promise.all([
      apiGet('/reports/stats'),
      apiGet('/requests'),
      apiGet('/doctors'),
      apiGet('/schedules'),
      apiGet('/settings/departments'),
    ]);

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const activeDoctors = doctors.filter(d => d.status === 'active').length;
    const todayStr = `2569-02-21`;
    const todayShifts = schedules.filter(s => s.date === todayStr);

    content.innerHTML = `
      <div class="greeting-banner animate-fade-in">
        <div class="greeting-text">
          <p>${greeting}</p>
          <h2>${user?.name || 'แพทย์'}</h2>
          <span class="greeting-date">${icons.calendar} <span style="vertical-align:middle">${formatThaiDate(today)}</span></span>
        </div>
        <div class="greeting-stats">
          <div class="greeting-stat"><span class="greeting-stat-value" data-target="${todayShifts.length}">0</span><span class="greeting-stat-label">แพทย์ออนดิวตี้วันนี้</span></div>
          <div class="greeting-stat"><span class="greeting-stat-value" data-target="${doctors.length}">0</span><span class="greeting-stat-label">แพทย์ทั้งหมด</span></div>
          <div class="greeting-stat"><span class="greeting-stat-value" data-target="${departments.length}">0</span><span class="greeting-stat-label">แผนก</span></div>
          <div class="greeting-stat"><span class="greeting-stat-value" data-target="${pendingCount}">0</span><span class="greeting-stat-label">คำขอรออนุมัติ</span></div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card blue animate-fade-in-up delay-1">
          <div class="stat-icon blue">${icons.userDoctor}</div>
          <div class="stat-info"><div class="stat-label">แพทย์ออนดิวตี้วันนี้</div><div class="stat-value" data-target="${todayShifts.length}">0</div></div>
        </div>
        <div class="stat-card green animate-fade-in-up delay-2">
          <div class="stat-icon green">${icons.checkCircle}</div>
          <div class="stat-info"><div class="stat-label">แพทย์พร้อมปฏิบัติงาน</div><div class="stat-value" data-target="${activeDoctors}">0</div></div>
        </div>
        <div class="stat-card orange animate-fade-in-up delay-3">
          <div class="stat-icon orange">${icons.clipboard}</div>
          <div class="stat-info"><div class="stat-label">คำขอรออนุมัติ</div><div class="stat-value" data-target="${pendingCount}">0</div></div>
        </div>
        <div class="stat-card red animate-fade-in-up delay-4">
          <div class="stat-icon red">${icons.alertCircle}</div>
          <div class="stat-info"><div class="stat-label">แผนกทั้งหมด</div><div class="stat-value" data-target="${departments.length}">0</div></div>
        </div>
      </div>

      <div class="dashboard-row">
        <div class="card dashboard-left animate-fade-in-up delay-3">
          <div class="card-header"><h3>ตารางเวรล่าสุด</h3><a href="/pages/schedule.html" class="btn btn-sm btn-ghost">ดูทั้งหมด</a></div>
          <div class="schedule-list">
            ${schedules.slice(0, 5).map(s => `
              <div class="schedule-item">
                <div class="schedule-avatar" style="background:${s.dept_color || '#4A90B8'}20;color:${s.dept_color || '#4A90B8'}">${s.avatar || '?'}</div>
                <div class="schedule-info">
                  <div class="schedule-name">${s.doctor_name || 'N/A'}</div>
                  <div class="schedule-dept">${s.dept_name || 'N/A'}</div>
                </div>
                <div class="schedule-shift">
                  <span class="badge" style="background:${s.shift_color || '#4A90B8'}20;color:${s.shift_color}">${s.shift_name || ''}</span>
                  <span class="schedule-time">${s.date}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="dashboard-right">
          <div class="card animate-fade-in-up delay-4">
            <div class="card-header"><h3>คำขอรอดำเนินการ</h3><a href="/pages/requests.html" class="btn btn-sm btn-ghost">ดูทั้งหมด</a></div>
            ${requests.filter(r => r.status === 'pending').map(req => `
              <div class="pending-item">
                <div class="pending-info">
                  <div class="pending-title">${req.doctor_name}</div>
                  <div class="pending-desc">${req.type === 'leave' ? 'ขอลา' : req.type === 'swap' ? 'สลับเวร' : 'หาคนแทน'} — ${req.date}</div>
                </div>
                <div class="pending-actions">
                  <button class="btn btn-sm btn-success" onclick="approveReq('${req.id}')">${icons.check}</button>
                  <button class="btn btn-sm btn-danger" onclick="rejectReq('${req.id}')">${icons.x}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="charts-row animate-fade-in-up delay-5">
        <div class="card chart-card"><div class="card-header"><h3>ชั่วโมงทำงานบุคคล (สัปดาห์นี้)</h3></div><div class="chart-container"><canvas id="workloadChart"></canvas></div></div>
        <div class="card chart-card"><div class="card-header"><h3>สัดส่วนแพทย์ตามแผนก</h3></div><div class="chart-container"><canvas id="donutChart"></canvas></div></div>
      </div>
    `;

    document.querySelectorAll('[data-target]').forEach(el => animateNumber(el, parseInt(el.dataset.target)));

    setTimeout(() => {
      drawBarChart(document.getElementById('workloadChart'), {
        labels: stats.workloadData.map(w => w.name.split(' ')[0]),
        values: stats.workloadData.map(w => w.hours),
        colors: stats.workloadData.map((w, i) => ['#4A90B8', '#5AAFA0', '#F6AD55', '#9F7AEA', '#FC8181'][i % 5])
      });
      drawDonutChart(document.getElementById('donutChart'), {
        values: stats.departments.map(d => d.actual_doctors),
        colors: stats.departments.map(d => d.color),
        labels: stats.departments.map(d => d.name)
      });
    }, 400);

  } catch (err) {
    content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h3>เกิดข้อผิดพลาด</h3><p>${err.message}</p></div>`;
  }

  window.approveReq = async (id) => {
    try {
      const { apiPut } = await import('../src/js/api.js');
      await apiPut(`/requests/${id}/approve`);
      location.reload();
    } catch (e) { alert(e.message); }
  };

  window.rejectReq = async (id) => {
    try {
      const { apiPut } = await import('../src/js/api.js');
      await apiPut(`/requests/${id}/reject`);
      location.reload();
    } catch (e) { alert(e.message); }
  };
});
