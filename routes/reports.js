// ==========================================
// PrinCare — Reports Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/reports/stats
router.get('/stats', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const totalDoctors = db.prepare('SELECT COUNT(*) as c FROM doctors').get().c;
    const activeDoctors = db.prepare("SELECT COUNT(*) as c FROM doctors WHERE status='active'").get().c;
    const totalSchedules = db.prepare('SELECT COUNT(*) as c FROM schedules').get().c;
    const pendingRequests = db.prepare("SELECT COUNT(*) as c FROM requests WHERE status='pending'").get().c;
    const departments = db.prepare('SELECT d.*, (SELECT COUNT(*) FROM doctors doc WHERE doc.dept = d.name) as actual_doctors FROM departments d').all();
    const nightShifts = db.prepare("SELECT COUNT(*) as c FROM schedules WHERE shift_id='SH03'").get().c;

    res.json({
        totalDoctors, activeDoctors, totalSchedules, pendingRequests, nightShifts,
        departments,
        totalHours: 1160, otHours: 48, leaveDays: 15,
        workloadData: [
            { name: 'สมชาย รักษาดี', hours: 156, quota: 168 },
            { name: 'สุภาพร แสงทอง', hours: 120, quota: 168 },
            { name: 'วิชัย ปัญญาดี', hours: 148, quota: 168 },
            { name: 'นิภา ศรีสุข', hours: 132, quota: 168 },
            { name: 'อนันต์ สุขสมบูรณ์', hours: 172, quota: 168 },
            { name: 'สุรชัย แกร่งดี', hours: 164, quota: 168 },
            { name: 'กิตติ ชาญเลิศ', hours: 140, quota: 168 },
            { name: 'ดวงใจ รักดี', hours: 128, quota: 168 },
        ]
    });
});

module.exports = router;
