// ==========================================
// PrinCare — Reports Page (No Emoji)
// ==========================================

import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { DEPARTMENTS, DOCTORS } from '../src/js/mock-data.js';
import { drawBarChart, drawDonutChart } from '../src/js/utils.js';

initApp('reports', 'รายงานและสถิติ', ['หน้าหลัก', 'รายงานและสถิติ']);

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('reportsContent');

  const workloadData = [
    { name: 'สมชาย รักษาดี', hours: 156, quota: 168, color: '#4A90B8' },
    { name: 'สุภาพร แสงทอง', hours: 120, quota: 168, color: '#5AAFA0' },
    { name: 'วิชัย ปัญญาดี', hours: 148, quota: 168, color: '#F6AD55' },
    { name: 'นิภา ศรีสุข', hours: 132, quota: 168, color: '#9F7AEA' },
    { name: 'อนันต์ สุขสมบูรณ์', hours: 172, quota: 168, color: '#FC8181' },
    { name: 'สุรชัย แกร่งดี', hours: 164, quota: 168, color: '#68D391' },
    { name: 'กิตติ ชาญเลิศ', hours: 140, quota: 168, color: '#63B3ED' },
    { name: 'ดวงใจ รักดี', hours: 128, quota: 168, color: '#F687B3' },
  ];

  content.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">${icons.chart} <span style="vertical-align:middle">รายงานและสถิติ</span></h1>
        <p class="page-subtitle">ข้อมูลสรุปการทำงานและภาระงานของแพทย์</p>
      </div>
      <div class="page-actions">
        <select class="form-select" style="width:auto;padding:8px 36px 8px 12px;">
          <option>กุมภาพันธ์ 2569</option>
          <option>มกราคม 2569</option>
          <option>ธันวาคม 2568</option>
        </select>
      </div>
    </div>

    <div class="export-bar">
      <button class="btn btn-secondary">${icons.file} <span style="vertical-align:middle">Export PDF</span></button>
      <button class="btn btn-secondary">${icons.download} <span style="vertical-align:middle">Export Excel</span></button>
      <button class="btn btn-ghost">${icons.printer} <span style="vertical-align:middle">พิมพ์</span></button>
    </div>

    <!-- Stats Summary -->
    <div class="stats-grid" style="margin-bottom:var(--space-8);">
      <div class="stat-card blue animate-fade-in-up delay-1">
        <div class="stat-icon blue">${icons.clock}</div>
        <div class="stat-info">
          <div class="stat-label">ชั่วโมงทำงานรวม</div>
          <div class="stat-value">1,160</div>
          <div class="stat-change up">${icons.trendingUp} <span style="vertical-align:middle">5% จากเดือนที่แล้ว</span></div>
        </div>
      </div>
      <div class="stat-card purple animate-fade-in-up delay-2">
        <div class="stat-icon purple">${icons.moon}</div>
        <div class="stat-info">
          <div class="stat-label">เวรดึกทั้งหมด</div>
          <div class="stat-value">45</div>
          <div class="stat-change down">${icons.trendingDown} <span style="vertical-align:middle">3 จากเดือนที่แล้ว</span></div>
        </div>
      </div>
      <div class="stat-card green animate-fade-in-up delay-3">
        <div class="stat-icon green">${icons.dollarSign}</div>
        <div class="stat-info">
          <div class="stat-label">OT ที่ต้องจ่าย</div>
          <div class="stat-value">48 ชม.</div>
          <div class="stat-change up">${icons.trendingUp} <span style="vertical-align:middle">12 ชม.</span></div>
        </div>
      </div>
      <div class="stat-card orange animate-fade-in-up delay-4">
        <div class="stat-icon orange">${icons.clipboard}</div>
        <div class="stat-info">
          <div class="stat-label">วันลาที่ใช้</div>
          <div class="stat-value">15</div>
          <div class="stat-change">จาก 8 แผนก</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="report-chart-row">
      <div class="chart-card animate-fade-in-up delay-3">
        <div class="chart-card-header"><h4>ชั่วโมงทำงานรายแผนก</h4></div>
        <div class="chart-area"><canvas id="deptHoursChart"></canvas></div>
      </div>
      <div class="chart-card animate-fade-in-up delay-4">
        <div class="chart-card-header"><h4>สัดส่วนประเภทเวร</h4></div>
        <div class="chart-area" style="height:180px;"><canvas id="shiftTypeChart"></canvas></div>
        <div class="donut-legend" style="margin-top:var(--space-3);">
          <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#63B3ED"></span>เวรเช้า (35%)</div>
          <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#F6AD55"></span>เวรบ่าย (25%)</div>
          <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#9F7AEA"></span>เวรดึก (20%)</div>
          <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#FC8181"></span>เวร ER (12%)</div>
          <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#4FD1C5"></span>On-Call (8%)</div>
        </div>
      </div>
    </div>

    <!-- Workload Balance -->
    <div class="card animate-fade-in-up delay-5">
      <div class="card-header">
        <h3>${icons.target} <span style="vertical-align:middle">Workload Balance Report — ภาระงานรายบุคคล</span></h3>
      </div>
      <div class="workload-bars">
        ${workloadData.map(d => {
    const pct = Math.round((d.hours / d.quota) * 100);
    const isOver = d.hours > d.quota;
    return `
          <div class="workload-item">
            <span class="workload-label">${d.name}</span>
            <div class="workload-bar-bg">
              <div class="workload-bar-fill" style="width:${Math.min(pct, 100)}%;background:${isOver ? '#FC8181' : d.color};"></div>
            </div>
            <span class="workload-value" style="color:${isOver ? '#C53030' : 'inherit'}">${d.hours}/${d.quota} ชม.</span>
          </div>`;
  }).join('')}
      </div>
    </div>

    <!-- Leave Statistics Table -->
    <div class="card animate-fade-in-up" style="margin-top:var(--space-6);">
      <div class="card-header">
        <h3>${icons.barChart2} <span style="vertical-align:middle">สถิติการลา/ขาด รายเดือน</span></h3>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr><th>แพทย์</th><th>แผนก</th><th>ลาพักร้อน</th><th>ลาป่วย</th><th>ลากิจ</th><th>ขาด</th><th>รวม (วัน)</th></tr>
          </thead>
          <tbody>
            <tr><td>พญ.สุภาพร แสงทอง</td><td>อายุรกรรม</td><td>3</td><td>0</td><td>0</td><td>0</td><td>3</td></tr>
            <tr><td>พญ.มาลี สวัสดี</td><td>วิสัญญีวิทยา</td><td>0</td><td>3</td><td>0</td><td>0</td><td>3</td></tr>
            <tr><td>นพ.กิตติ ชาญเลิศ</td><td>อายุรกรรม</td><td>0</td><td>0</td><td>3</td><td>0</td><td>3</td></tr>
            <tr><td>นพ.ประสิทธิ์ เก่งมาก</td><td>ออร์โธปิดิกส์</td><td>2</td><td>1</td><td>0</td><td>0</td><td>3</td></tr>
            <tr><td>พญ.ฉวีวรรณ ใจดี</td><td>จักษุวิทยา</td><td>1</td><td>0</td><td>1</td><td>0</td><td>2</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  setTimeout(() => {
    const deptNames = DEPARTMENTS.map(d => d.name.substring(0, 4));
    const deptHours = [156, 124, 98, 86, 72, 168, 94, 56];
    const deptColors = DEPARTMENTS.map(d => d.color);
    drawBarChart(document.getElementById('deptHoursChart'), { labels: deptNames, values: deptHours, colors: deptColors });
    drawDonutChart(document.getElementById('shiftTypeChart'), { values: [35, 25, 20, 12, 8], colors: ['#63B3ED', '#F6AD55', '#9F7AEA', '#FC8181', '#4FD1C5'] });
  }, 500);
});
