// ==========================================
// PrinCare — Reports Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/reports/stats
router.get('/stats', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;

        const totalDoctorsRes = await db.query('SELECT COUNT(*) as c FROM doctors');
        const activeDoctorsRes = await db.query("SELECT COUNT(*) as c FROM doctors WHERE status='active'");
        const totalSchedulesRes = await db.query('SELECT COUNT(*) as c FROM schedules');
        const pendingRequestsRes = await db.query("SELECT COUNT(*) as c FROM requests WHERE status='pending'");
        const departmentsRes = await db.query('SELECT d.*, (SELECT COUNT(*) FROM doctors doc WHERE doc.dept = d.name) as actual_doctors FROM departments d');
        const nightShiftsRes = await db.query("SELECT COUNT(*) as c FROM schedules WHERE shift_id='SH03'");

        res.json({
            totalDoctors: parseInt(totalDoctorsRes.rows[0].c, 10),
            activeDoctors: parseInt(activeDoctorsRes.rows[0].c, 10),
            totalSchedules: parseInt(totalSchedulesRes.rows[0].c, 10),
            pendingRequests: parseInt(pendingRequestsRes.rows[0].c, 10),
            nightShifts: parseInt(nightShiftsRes.rows[0].c, 10),
            departments: departmentsRes.rows,
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
    } catch (e) {
        next(e);
    }
});

module.exports = router;
