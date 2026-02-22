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
        const { branch, startDate, endDate, dept } = req.query;

        // Base conditions
        let docConditions = [];
        let docParams = [];
        let schConditions = [];
        let schParams = [];
        let reqConditions = [];
        let reqParams = [];

        if (branch && branch !== 'all') {
            docConditions.push(`branch = $${docParams.length + 1}`);
            docParams.push(branch);
            schConditions.push(`branch = $${schParams.length + 1}`);
            schParams.push(branch);
            reqConditions.push(`branch = $${reqParams.length + 1}`);
            reqParams.push(branch);
        }

        if (dept && dept !== 'all') {
            docConditions.push(`dept = $${docParams.length + 1}`);
            docParams.push(dept);
            schConditions.push(`dept_id = $${schParams.length + 1}`);
            schParams.push(dept);
        }

        if (startDate && endDate) {
            schConditions.push(`date >= $${schParams.length + 1} AND date <= $${schParams.length + 2}`);
            schParams.push(startDate, endDate);
        }

        const docWhere = docConditions.length > 0 ? 'WHERE ' + docConditions.join(' AND ') : '';
        const schWhere = schConditions.length > 0 ? 'WHERE ' + schConditions.join(' AND ') : '';
        const reqWhere = reqConditions.length > 0 ? 'WHERE ' + reqConditions.join(' AND ') : '';

        const totalDoctorsRes = await db.query(`SELECT COUNT(*) as c FROM doctors ${docWhere}`, docParams);
        const activeDoctorsRes = await db.query(`SELECT COUNT(*) as c FROM doctors ${docWhere ? docWhere + " AND status='active'" : "WHERE status='active'"}`, docParams);
        const totalSchedulesRes = await db.query(`SELECT COUNT(*) as c FROM schedules ${schWhere}`, schParams);
        const pendingRequestsRes = await db.query(`SELECT COUNT(*) as c FROM requests ${reqWhere ? reqWhere + " AND status='pending'" : "WHERE status='pending'"}`, reqParams);

        let deptQuery = `SELECT d.*, (SELECT COUNT(*) FROM doctors doc WHERE doc.dept = d.name ${branch && branch !== 'all' ? `AND doc.branch = '${branch}'` : ''}) as actual_doctors FROM departments d`;
        const departmentsRes = await db.query(deptQuery);

        const nightShiftsRes = await db.query(`SELECT COUNT(*) as c FROM schedules ${schWhere ? schWhere + " AND shift_id='SH03'" : "WHERE shift_id='SH03'"}`, schParams);

        // Fetch dynamic workload
        let workloadQuery = `
            SELECT 
                d.name,
                d.dept,
                COUNT(s.id) * 8 as hours
            FROM doctors d
            LEFT JOIN schedules s ON d.id = s.doctor_id
            ${branch && branch !== 'all' ? `WHERE d.branch = '${branch}'` : ''}
            GROUP BY d.id, d.name, d.dept
            ORDER BY hours DESC
        `;
        const workloadRes = await db.query(workloadQuery);
        const workloadData = workloadRes.rows.map(row => ({
            name: row.name,
            dept: row.dept,
            hours: parseInt(row.hours, 10) || 0,
            quota: 168 // Standard monthly quota assumption
        }));

        res.json({
            totalDoctors: parseInt(totalDoctorsRes.rows[0].c, 10),
            activeDoctors: parseInt(activeDoctorsRes.rows[0].c, 10),
            totalSchedules: parseInt(totalSchedulesRes.rows[0].c, 10),
            pendingRequests: parseInt(pendingRequestsRes.rows[0].c, 10),
            nightShifts: parseInt(nightShiftsRes.rows[0].c, 10),
            departments: departmentsRes.rows,
            totalHours: workloadData.reduce((sum, w) => sum + w.hours, 0),
            otHours: workloadData.reduce((sum, w) => sum + Math.max(0, w.hours - w.quota), 0),
            leaveDays: 0, // Mock for now until leave table exists
            workloadData: workloadData
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
