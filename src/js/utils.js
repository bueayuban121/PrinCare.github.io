// ==========================================
// PrinCare — Utility Functions
// ==========================================

export const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export function formatThaiDate(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = THAI_MONTHS[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
}

export function formatThaiDateShort(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = THAI_MONTHS_SHORT[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
}

export function getThaiDay(date) {
    return THAI_DAYS[new Date(date).getDay()];
}

export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'สวัสดีตอนเช้า';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
}

export function getStatusBadge(status) {
    const map = {
        active: { class: 'badge-success', text: 'ปฏิบัติงาน' },
        'on-leave': { class: 'badge-warning', text: 'ลา' },
        inactive: { class: 'badge-neutral', text: 'ไม่ปฏิบัติงาน' },
        pending: { class: 'badge-warning', text: 'รออนุมัติ' },
        approved: { class: 'badge-success', text: 'อนุมัติแล้ว' },
        rejected: { class: 'badge-danger', text: 'ไม่อนุมัติ' },
    };
    return map[status] || { class: 'badge-neutral', text: status };
}

export function getRequestTypeName(type) {
    const map = {
        leave: 'ขอลา',
        swap: 'สลับเวร',
        replacement: 'หาคนแทน',
    };
    return map[type] || type;
}

// Simple chart helper — draws bar chart on canvas
export function drawBarChart(canvas, data, options = {}) {
    const ctx = canvas.getContext('2d');
    const { labels = [], values = [], colors = [], title = '' } = data;
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const maxVal = Math.max(...values) * 1.1 || 1;
    const barWidth = (chartW / values.length) * 0.6;
    const gap = (chartW / values.length) * 0.4;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Title
    if (title) {
        ctx.font = '600 13px Sarabun, Inter, sans-serif';
        ctx.fillStyle = '#2D3748';
        ctx.textAlign = 'left';
        ctx.fillText(title, padding.left, 18);
    }

    // Grid lines
    ctx.strokeStyle = '#EEF2F7';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        // Y labels
        ctx.font = '400 11px Sarabun, Inter, sans-serif';
        ctx.fillStyle = '#A0AEC0';
        ctx.textAlign = 'right';
        const val = Math.round(maxVal - (maxVal / gridLines) * i);
        ctx.fillText(val, padding.left - 8, y + 4);
    }

    // Bars
    values.forEach((val, i) => {
        const x = padding.left + (chartW / values.length) * i + gap / 2;
        const barH = (val / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        // Bar with rounded top
        const r = Math.min(4, barWidth / 2);
        ctx.fillStyle = colors[i] || '#4A90B8';
        ctx.beginPath();
        ctx.moveTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.arcTo(x + barWidth, y, x + barWidth, y + r, r);
        ctx.lineTo(x + barWidth, padding.top + chartH);
        ctx.lineTo(x, padding.top + chartH);
        ctx.closePath();
        ctx.fill();

        // X labels
        ctx.font = '400 10px Sarabun, Inter, sans-serif';
        ctx.fillStyle = '#718096';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i] || '', x + barWidth / 2, h - padding.bottom + 16);
    });
}

// Donut chart helper
export function drawDonutChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const { values = [], colors = [], labels = [] } = data;
    const width = canvas.width = canvas.offsetWidth * 2;
    const height = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 10;
    const innerRadius = radius * 0.6;
    const total = values.reduce((a, b) => a + b, 0) || 1;

    ctx.clearRect(0, 0, w, h);

    let startAngle = -Math.PI / 2;
    values.forEach((val, i) => {
        const angle = (val / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
        ctx.arc(cx, cy, innerRadius, startAngle + angle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = colors[i] || '#4A90B8';
        ctx.fill();
        startAngle += angle;
    });

    // Center text
    ctx.font = '700 22px Sarabun, Inter, sans-serif';
    ctx.fillStyle = '#2D3748';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);
    ctx.font = '400 11px Sarabun, Inter, sans-serif';
    ctx.fillStyle = '#A0AEC0';
    ctx.fillText('ทั้งหมด', cx, cy + 12);
}

// Animate number counter
export function animateNumber(element, target, duration = 1000) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        element.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

export const BRANCHES = [
    { id: 'PSV01', name: 'โรงพยาบาลพริ้นซ์ สุวรรณภูมิ' },
    { id: 'PNP02', name: 'โรงพยาบาลพริ้นซ์ ปากน้ำโพ 1' },
    { id: 'PNP03', name: 'โรงพยาบาลพริ้นซ์ ปากน้ำโพ 2' },
    { id: 'PUT04', name: 'โรงพยาบาลพริ้นซ์ อุทัยธานี' },
    { id: 'PVL05', name: 'โรงพยาบาลพิษณุเวช พิษณุโลก' },
    { id: 'PUT06', name: 'โรงพยาบาลพิษณุเวช อุตรดิตถ์' },
    { id: 'PPC07', name: 'โรงพยาบาลพิษณุเวช พิจิตร' },
    { id: 'SLP08', name: 'โรงพยาบาลศิริเวช ลำพูน' },
    { id: 'PLP09', name: 'โรงพยาบาลพริ้นซ์ ลำพูน' },
    { id: 'PSK10', name: 'โรงพยาบาลพริ้นซ์ ศรีสะเกษ' },
    { id: 'PUB11', name: 'โรงพยาบาลพริ้นซ์ อุบลราชธานี' },
    { id: 'PSK12', name: 'โรงพยาบาลพริ้นซ์ สกลนคร' },
    { id: 'VHC13', name: 'โรงพยาบาลวิรัชศิลป์ ชุมพร' },
    { id: 'RPH14', name: 'โรงพยาบาลรวมแพทย์ พิษณุโลก' },
    { id: 'PMK15', name: 'โรงพยาบาลพริ้นซ์ มุกดาหาร' }
];

export function getBranchName(id) {
    const branch = BRANCHES.find(b => b.id === id);
    return branch ? branch.name : id;
}
