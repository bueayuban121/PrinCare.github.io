// ==========================================
// PrinCare — Reports Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, requireAuth } from '../src/js/api.js';
import { drawBarChart, drawDonutChart, animateNumber, formatNumber } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('reports', 'รายงานและสถิติ', ['หน้าหลัก', 'รายงานและสถิติ']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('reportsContent');
  content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;

  try {
    const stats = await apiGet('/reports/stats');
    content.innerHTML = `
      <div class="page-header">
        <div><h1 class="page-title">${icons.chart} <span style="vertical-align:middle">รายงานและสถิติ</span></h1></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card blue animate-fade-in-up delay-1"><div class="stat-icon blue">${icons.clock}</div><div class="stat-info"><div class="stat-label">ชั่วโมงทำงานรวม</div><div class="stat-value" data-target="${stats.totalHours}">0</div></div></div>
        <div class="stat-card green animate-fade-in-up delay-2"><div class="stat-icon green">${icons.userDoctor}</div><div class="stat-info"><div class="stat-label">แพทย์ทั้งหมด</div><div class="stat-value" data-target="${stats.totalDoctors}">0</div></div></div>
        <div class="stat-card orange animate-fade-in-up delay-3"><div class="stat-icon orange">${icons.moon}</div><div class="stat-info"><div class="stat-label">เวรดึกทั้งหมด</div><div class="stat-value" data-target="${stats.nightShifts}">0</div></div></div>
        <div class="stat-card red animate-fade-in-up delay-4"><div class="stat-icon red">${icons.clipboard}</div><div class="stat-info"><div class="stat-label">คำขอรออนุมัติ</div><div class="stat-value" data-target="${stats.pendingRequests}">0</div></div></div>
      </div>
      <div class="charts-row animate-fade-in-up delay-4">
        <div class="card chart-card"><div class="card-header"><h3>ชั่วโมงทำงานรายแผนก</h3></div><div class="chart-container"><canvas id="deptChart"></canvas></div></div>
        <div class="card chart-card"><div class="card-header"><h3>สัดส่วนแพทย์ตามแผนก</h3></div><div class="chart-container"><canvas id="donutChart"></canvas></div></div>
      </div>
      <div class="card animate-fade-in-up delay-5" style="margin-top:var(--space-4);">
        <div class="card-header"><h3>ภาระงานแพทย์</h3></div>
        <table class="table"><thead><tr><th>ชื่อแพทย์</th><th>ชั่วโมงทำงาน</th><th>โควต้า</th><th>สถานะ</th></tr></thead><tbody>
          ${stats.workloadData.map(w => `<tr><td>${w.name}</td><td>${w.hours} ชม.</td><td>${w.quota} ชม.</td><td><span class="badge ${w.hours > w.quota ? 'badge-danger' : 'badge-success'} badge-dot">${w.hours > w.quota ? 'เกินโควต้า' : 'ปกติ'}</span></td></tr>`).join('')}
        </tbody></table>
      </div>
    `;
    document.querySelectorAll('[data-target]').forEach(el => animateNumber(el, parseInt(el.dataset.target)));
    setTimeout(() => {
      drawBarChart(document.getElementById('deptChart'), { labels: stats.departments.map(d => d.name.substring(0, 4)), values: [42, 36, 28, 22, 18, 45, 20, 12].slice(0, stats.departments.length), colors: stats.departments.map(d => d.color) });
      drawDonutChart(document.getElementById('donutChart'), { values: stats.departments.map(d => d.total_doctors), colors: stats.departments.map(d => d.color) });
    }, 400);
  } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
});
