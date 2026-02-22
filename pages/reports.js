// ==========================================
// PrinCare — Reports Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, requireAuth } from '../src/js/api.js';
import { drawBarChart, drawDonutChart, animateNumber, formatNumber, BRANCHES } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('reports', 'รายงานและสถิติ', ['หน้าหลัก', 'รายงานและสถิติ']);

// Utility to download CSV
function downloadCSV(data, filename) {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Thai chars

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";

    data.forEach(row => {
      const rowArr = headers.map(header => {
        let val = row[header] === null || row[header] === undefined ? '' : row[header];
        val = String(val).replace(/"/g, '""'); // Escape double quotes
        return `"${val}"`;
      });
      csvContent += rowArr.join(",") + "\n";
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('reportsContent');

  // State for Filters
  let currentBranch = 'all';
  let currentDept = 'all';
  let startDate = '';
  let endDate = '';
  let currentWorkloadData = [];

  const renderReports = async () => {
    content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;

    try {
      // Build Query Params
      const params = new URLSearchParams();
      if (currentBranch !== 'all') params.append('branch', currentBranch);
      if (currentDept !== 'all') params.append('dept', currentDept);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const stats = await apiGet(`/reports/stats?${params.toString()}`);
      currentWorkloadData = stats.workloadData; // Save for CSV export

      const branchOptions = `<option value="all">ทุกสาขา</option>` + Object.entries(BRANCHES).map(([k, v]) => `<option value="${k}" ${currentBranch === k ? 'selected' : ''}>${v}</option>`).join('');
      const deptOptions = `<option value="all">ทุกแผนก</option>` + stats.departments.map(d => `<option value="${d.name}" ${currentDept === d.name ? 'selected' : ''}>${d.name}</option>`).join('');

      content.innerHTML = `
        <div class="page-header" style="flex-wrap: wrap; gap: 16px;">
          <div><h1 class="page-title">${icons.chart} <span style="vertical-align:middle">รายงานและสถิติเชิงลึก</span></h1></div>
          
          <div class="filter-controls" style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px;color:var(--text-light);">จาก</span>
              <input type="date" id="repStartDate" class="input" value="${startDate}">
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px;color:var(--text-light);">ถึง</span>
              <input type="date" id="repEndDate" class="input" value="${endDate}">
            </div>
            <select id="repBranch" class="input">${branchOptions}</select>
            <select id="repDept" class="input">${deptOptions}</select>
            <button id="btnFilter" class="btn btn-primary" style="padding: 0 var(--space-4);">คัดกรอง</button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card blue animate-fade-in-up delay-1"><div class="stat-icon blue">${icons.clock}</div><div class="stat-info"><div class="stat-label">ชั่วโมงทำงานรวม</div><div class="stat-value" data-target="${stats.totalHours}">0</div></div></div>
          <div class="stat-card green animate-fade-in-up delay-2"><div class="stat-icon green">${icons.userDoctor}</div><div class="stat-info"><div class="stat-label">แพทย์ทั้งหมด (เฉพาะเงื่อนไข)</div><div class="stat-value" data-target="${stats.totalDoctors}">0</div></div></div>
          <div class="stat-card orange animate-fade-in-up delay-3"><div class="stat-icon orange">${icons.moon}</div><div class="stat-info"><div class="stat-label">เวรดึกทั้งหมด</div><div class="stat-value" data-target="${stats.nightShifts}">0</div></div></div>
          <div class="stat-card red animate-fade-in-up delay-4"><div class="stat-icon red">${icons.clipboard}</div><div class="stat-info"><div class="stat-label">OT รวม (ชม.)</div><div class="stat-value" data-target="${stats.otHours}">0</div></div></div>
        </div>

        <div class="charts-row animate-fade-in-up delay-4">
          <div class="card chart-card"><div class="card-header"><h3>ชั่วโมงทำงานรายแผนก</h3></div><div class="chart-container"><canvas id="deptChart"></canvas></div></div>
          <div class="card chart-card"><div class="card-header"><h3>สัดส่วนแพทย์ตามแผนก</h3></div><div class="chart-container"><canvas id="donutChart"></canvas></div></div>
        </div>

        <div class="card animate-fade-in-up delay-5" style="margin-top:var(--space-4);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3>ภาระงานแพทย์ระดับบุคคล (Workloads)</h3>
            <button id="btnDownloadCsv" class="btn btn-outline btn-sm" style="display:flex; align-items:center; gap:6px;">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download CSV
            </button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead><tr><th>ชื่อแพทย์</th><th>แผนก</th><th>ชั่วโมงทำงานรวม</th><th>มาตรฐานโควต้าต่อเดือน</th><th>สถานะความหนาแน่น</th></tr></thead>
              <tbody>
                ${stats.workloadData.length > 0 ? stats.workloadData.map(w => `
                  <tr>
                    <td><div style="font-weight:500;">${w.name}</div></td>
                    <td>${w.dept}</td>
                    <td>${w.hours} ชม.</td>
                    <td>${w.quota} ชม.</td>
                    <td><span class="badge ${w.hours > w.quota ? 'badge-danger' : 'badge-success'} badge-dot">${w.hours > w.quota ? 'เกินโควต้า (เสี่ยง Burnout)' : 'ปกติ'}</span></td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:var(--space-4);">ไม่พบข้อมูลภายใต้เงื่อนไขที่เลือก</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Animate Numbers
      document.querySelectorAll('[data-target]').forEach(el => animateNumber(el, parseInt(el.dataset.target)));

      // Render Charts
      setTimeout(() => {
        // Prepare Dept Chart Data (Aggregating hours by dept for the bar chart)
        const deptNames = stats.departments.map(d => d.name);
        // Note: For real environment, the query should aggregate hours by dept.
        // For UI purposes and since the backend returns workload details:
        let deptHoursMap = {};
        stats.workloadData.forEach(w => {
          deptHoursMap[w.dept] = (deptHoursMap[w.dept] || 0) + w.hours;
        });
        const deptHoursData = deptNames.map(name => deptHoursMap[name] || 0);

        drawBarChart(document.getElementById('deptChart'), {
          labels: deptNames.map(n => n.length > 15 ? n.substring(0, 15) + '...' : n),
          values: deptHoursData,
          colors: stats.departments.map(d => d.color)
        });

        drawDonutChart(document.getElementById('donutChart'), {
          values: stats.departments.map(d => parseInt(d.actual_doctors || 0, 10)),
          colors: stats.departments.map(d => d.color)
        });
      }, 400);

      // Attach Listeners
      document.getElementById('btnFilter').addEventListener('click', () => {
        startDate = document.getElementById('repStartDate').value;
        endDate = document.getElementById('repEndDate').value;
        currentBranch = document.getElementById('repBranch').value;
        currentDept = document.getElementById('repDept').value;

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          alert('วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด');
          return;
        }

        renderReports();
      });

      document.getElementById('btnDownloadCsv').addEventListener('click', () => {
        const exportData = currentWorkloadData.map(w => ({
          "Doctor Name": w.name,
          "Department": w.dept,
          "Total Worked Hours": w.hours,
          "Standard Quota": w.quota,
          "Status": w.hours > w.quota ? "Over Quota" : "Normal"
        }));

        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(exportData, `PrinCare_Workload_Report_${timestamp}.csv`);
      });

    } catch (err) {
      content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><h3 style="color:var(--danger)">เกิดข้อผิดพลาด</h3><p>${err.message}</p></div>`;
    }
  };

  // Initial Load
  renderReports();
});
