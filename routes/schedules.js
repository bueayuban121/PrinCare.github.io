// ==========================================
// PrinCare — Schedules Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/schedules?month=02&year=2569
router.get('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { month, year, dept } = req.query;
    let query = 'SELECT s.*, d.name as doctor_name, d.avatar, st.name as shift_name, st.color as shift_color, st.time as shift_time, dep.name as dept_name, dep.color as dept_color FROM schedules s LEFT JOIN doctors d ON s.doctor_id = d.id LEFT JOIN shift_types st ON s.shift_id = st.id LEFT JOIN departments dep ON s.dept_id = dep.id';
    const params = [];
    const conditions = [];

    if (month && year) {
        conditions.push("s.date LIKE ?");
        params.push(`${year}-${month}%`);
    }
    if (dept && dept !== 'all') {
        conditions.push("s.dept_id = ?");
        params.push(dept);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.date, st.name';

    const schedules = db.prepare(query).all(...params);
    res.json(schedules);
});

// POST /api/schedules
router.post('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { date, doctor_id, shift_id, dept_id } = req.body;
    if (!date || !doctor_id || !shift_id || !dept_id) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

    const result = db.prepare('INSERT INTO schedules (date, doctor_id, shift_id, dept_id) VALUES (?,?,?,?)').run(date, doctor_id, shift_id, dept_id);

    db.prepare('INSERT INTO audit_log (id, action, user, detail, timestamp) VALUES (?,?,?,?,?)')
        .run('A' + Date.now(), 'สร้างเวร', req.user.name, `สร้างเวรวันที่ ${date}`, new Date().toLocaleString('th-TH'));

    res.json({ id: result.lastInsertRowid, message: 'สร้างเวรสำเร็จ' });
});

// DELETE /api/schedules/:id
router.delete('/:id', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
    res.json({ message: 'ลบเวรสำเร็จ' });
});

module.exports = router;
