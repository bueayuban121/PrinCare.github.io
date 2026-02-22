// ==========================================
// PrinCare — Dashboard Page (API Connected)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, requireAuth, getUser } from '../src/js/api.js';
import { getGreeting, formatThaiDate, drawBarChart, drawDonutChart, animateNumber, formatNumber, BRANCHES } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('dashboard', 'แดชบอร์ด', ['หน้าหลัก', 'แดชบอร์ด']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('dashboardContent');
  const today = new Date();
  const greeting = getGreeting();
  const user = getUser();
  let currentBranch = 'all';

  const renderDashboard = async () => {
    content.innerHTML = `<div class="skeleton" style="height:200px;border-radius:16px;"></div>`;

    try {
      // Create branch query parameter
      const query = currentBranch !== 'all' ? `?branch=${currentBranch}` : '';

      const [stats, requests, doctors, schedules, departments] = await Promise.all([
        apiGet(`/reports/stats${query}`),
        apiGet('/requests'),
        apiGet('/doctors'),
        apiGet('/schedules'),
        apiGet('/settings/departments'),
      ]);

      // Filter local arrays if branch is selected (fallback, since backend /stats is now branch-aware)
      const filteredReqs = currentBranch !== 'all' ? requests.filter(r => r.branch === currentBranch) : requests;
      const filteredDocs = currentBranch !== 'all' ? doctors.filter(d => d.branch === currentBranch) : doctors;
      const filteredScheds = currentBranch !== 'all' ? schedules.filter(s => s.branch === currentBranch) : schedules;

      const pendingCount = filteredReqs.filter(r => r.status === 'pending').length;
      const activeDoctors = filteredDocs.filter(d => d.status === 'active').length;
      const todayStr = `2569-02-21`; // Note: using a specific string as per the original code
      const todayShifts = filteredScheds.filter(s => s.date === todayStr);

      const branchOptions = `<option value="all">ทุกสาขา</option>` + Object.entries(BRANCHES).map(([k, v]) => `<option value="${k}" ${currentBranch === k ? 'selected' : ''}>${v}</option>`).join('');

      content.innerHTML = `
        <div class="page-header" style="flex-direction:row; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
          <div></div>
          <div class="filters-row" style="display:flex; gap:12px;">
            <select id="dashBranchFilter" class="input">${branchOptions}</select>
          </div>
        </div>

        <div class="greeting-banner animate-fade-in">
          <div class="greeting-text">
            <p>${greeting}</p>
            <h2>${user?.name || 'แพทย์'}</h2>
            <span class="greeting-date">${icons.calendar} <span style="vertical-align:middle">${formatThaiDate(today)}</span></span>
          </div>
          <div class="greeting-stats">
            <div class="greeting-stat"><span class="greeting-stat-value" data-target="${todayShifts.length}">0</span><span class="greeting-stat-label">แพทย์ออนดิวตี้วันนี้</span></div>
            <div class="greeting-stat"><span class="greeting-stat-value" data-target="${filteredDocs.length}">0</span><span class="greeting-stat-label">แพทย์ทั้งหมด</span></div>
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
            <div class="stat-info"><div class="stat-label">คำขอแลกเวร/ลา</div><div class="stat-value" data-target="${filteredReqs.length}">0</div></div>
          </div>
        </div>

        <div class="charts-row animate-fade-in-up delay-4">
          <div class="card" style="flex:2;">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
              <h3>ตารางเวรวันนี้</h3>
              <a href="schedule.html" class="btn btn-outline btn-sm">ดูทั้งหมด</a>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead><tr><th>แพทย์</th><th>แผนก</th><th>ผลัด</th><th>สถานะ</th></tr></thead>
                <tbody>
                  ${todayShifts.slice(0, 5).map(s => {
        const docName = filteredDocs.find(d => d.id === s.doctor_id)?.name || s.doctor_id;
        return `<tr><td>${docName}</td><td>${s.dept_id}</td><td>${s.shift_id}</td><td><span class="badge badge-success badge-dot">เข้าเวร</span></td></tr>`
      }).join('')}
                  ${todayShifts.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--text-light);padding:var(--space-4);">ไม่มีเวรวันนี้</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
          <div class="card" style="flex:1;">
            <div class="card-header"><h3>คำขอล่าสุด</h3></div>
            <div class="table-responsive">
              <table class="table">
                <tbody>
                  ${filteredReqs.slice(0, 3).map(r => `
                    <tr>
                      <td>
                        <div style="font-weight:500;">${r.doctor_name}</div>
                        <div style="font-size:var(--font-size-sm);color:var(--text-light);">${r.type} • ${r.date}</div>
                      </td>
                      <td style="text-align:right;">
                        ${r.status === 'pending' ?
          `<button class="btn btn-sm" style="background:#E2E8F0;color:var(--text-main);padding:4px 8px;margin-right:4px;" onclick="rejectReq(${r.id})">${icons.close}</button>
                           <button class="btn btn-primary btn-sm" style="padding:4px 8px;" onclick="approveReq(${r.id})">${icons.check}</button>` :
          `<span class="badge badge-${r.status === 'approved' ? 'success' : 'danger'}">${r.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}</span>`
        }
                      </td>
                    </tr>
                  `).join('')}
                  ${filteredReqs.length === 0 ? '<tr><td colspan="2" style="text-align:center;color:var(--text-light);padding:var(--space-4);">ไม่มีคำขอใหม่</td></tr>' : ''}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="charts-row animate-fade-in-up delay-5">
          <div class="card chart-card"><div class="card-header"><h3>ชั่วโมงทำงานบุคคล (รวมทั้งหมด)</h3></div><div class="chart-container"><canvas id="workloadChart"></canvas></div></div>
          <div class="card chart-card" style="display:flex; flex-direction:column;">
            <div class="card-header"><h3>สัดส่วนแพทย์ตามแผนก</h3></div>
            <div class="chart-container" style="flex:1; min-height: 200px;"><canvas id="donutChart"></canvas></div>
            <div class="chart-legend" style="margin-top:20px; flex-shrink:0; display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:12px; font-size:13px; color:var(--text-light); border-top: 1px solid var(--border-color); padding-top: 15px;">
              ${stats.departments.map(d => {
          const count = parseInt(d.actual_doctors || 0, 10);
          if (count === 0) return '';
          return `
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="width:10px; height:10px; border-radius:50%; background-color:${d.color}; display:inline-block; flex-shrink:0;"></span>
                  <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${d.name}">${d.name}</span>
                  <span style="font-weight:600; color:var(--text-strong);">${count} คน</span>
                </div>
              `}).join('')}
            </div>
          </div>
        </div>
      `;

      document.querySelectorAll('[data-target]').forEach(el => animateNumber(el, parseInt(el.dataset.target)));

      // Event Listener for Branch Filter
      document.getElementById('dashBranchFilter').addEventListener('change', (e) => {
        currentBranch = e.target.value;
        renderDashboard();
      });

      setTimeout(() => {
        drawBarChart(document.getElementById('workloadChart'), {
          labels: stats.workloadData.map(w => w.name.split(' ')[0]),
          values: stats.workloadData.map(w => w.hours),
          colors: stats.workloadData.map((w, i) => ['#4A90B8', '#5AAFA0', '#F6AD55', '#9F7AEA', '#FC8181'][i % 5])
        });
        drawDonutChart(document.getElementById('donutChart'), {
          values: stats.departments.map(d => parseInt(d.actual_doctors || 0, 10)),
          colors: stats.departments.map(d => d.color),
          labels: stats.departments.map(d => d.name)
        });
      }, 400);

    } catch (err) {
      content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h3>เกิดข้อผิดพลาด</h3><p>${err.message}</p></div>`;
    }
  };

  // Initial render
  renderDashboard();

  window.approveReq = async (id) => {
    try {
      const { apiPut } = await import('../src/js/api.js');
      await apiPut(`/requests/${id}/approve`);
      renderDashboard();
    } catch (e) { alert(e.message); }
  };

  window.rejectReq = async (id) => {
    try {
      const { apiPut } = await import('../src/js/api.js');
      await apiPut(`/requests/${id}/reject`);
      renderDashboard();
    } catch (e) { alert(e.message); }
  };
});
