// ==========================================
// PrinCare — Schedules Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/schedules?month=02&year=2569
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { month, year, dept, branch } = req.query;
        let query = 'SELECT s.*, d.name as doctor_name, d.avatar, st.name as shift_name, st.color as shift_color, st.time as shift_time, dep.name as dept_name, dep.color as dept_color FROM schedules s LEFT JOIN doctors d ON s.doctor_id = d.id LEFT JOIN shift_types st ON s.shift_id = st.id LEFT JOIN departments dep ON s.dept_id = dep.id';
        const params = [];
        const conditions = [];

        if (month && year) {
            params.push(`${year}-${month}%`);
            conditions.push(`s.date LIKE $${params.length}`);
        }
        if (dept && dept !== 'all') {
            params.push(dept);
            conditions.push(`s.dept_id = $${params.length}`);
        }
        if (branch && branch !== 'all') {
            params.push(branch);
            conditions.push(`s.branch = $${params.length}`);
        }
        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY s.date, st.name';

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// POST /api/schedules
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { date, doctor_id, shift_id, dept_id, branch } = req.body;
        if (!date || !doctor_id || !shift_id || !dept_id) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

        const result = await db.query(
            'INSERT INTO schedules (date, doctor_id, shift_id, dept_id, branch) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [date, doctor_id, shift_id, dept_id, branch || 'PSV01']
        );

        await db.query(
            'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1,$2,$3,$4,$5)',
            ['A' + Date.now(), 'สร้างเวร', req.user.name, `สร้างเวรวันที่ ${date}`, new Date().toLocaleString('th-TH')]
        );

        res.json({ id: result.rows[0].id, message: 'สร้างเวรสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/schedules/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { shift_id, doctor_id, date, dept_id, branch } = req.body;

        await db.query(
            'UPDATE schedules SET shift_id = $1, doctor_id = $2, date = $3, dept_id = $4, branch = $5 WHERE id = $6',
            [shift_id, doctor_id, date, dept_id, branch || 'PSV01', req.params.id]
        );

        await db.query(
            'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1,$2,$3,$4,$5)',
            ['A' + Date.now(), 'แก้ไขเวร', req.user.name, `แก้ไขเวรวันที่ ${date}`, new Date().toLocaleString('th-TH')]
        );

        res.json({ message: 'อัปเดตเวรสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// DELETE /api/schedules/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        await db.query('DELETE FROM schedules WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบเวรสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
