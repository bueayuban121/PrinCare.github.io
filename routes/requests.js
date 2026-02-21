// ==========================================
// PrinCare — Requests Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/requests
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { type, status } = req.query;
        let query = 'SELECT * FROM requests';
        const params = [];
        const conditions = [];

        if (type && type !== 'all') {
            params.push(type);
            conditions.push(`type = $${params.length}`);
        }
        if (status && status !== 'all') {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
        // using creating_at? no, use id desc for ordering since it's just R + timestamp
        query += ' ORDER BY id DESC';

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// POST /api/requests
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { type, doctor_name, dept, date, reason, swap_with, swap_date } = req.body;
        if (!type || !date) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

        const id = 'R' + String(Date.now()).slice(-6);
        const created_at = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

        await db.query(
            'INSERT INTO requests (id, type, doctor_name, dept, date, reason, swap_with, swap_date, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
            [id, type, doctor_name || req.user.name, dept || '', date, reason || '', swap_with || '', swap_date || '', 'pending', created_at]
        );

        res.json({ id, message: 'สร้างคำขอสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/requests/:id/approve
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        await db.query('UPDATE requests SET status = $1, approved_by = $2 WHERE id = $3', ['approved', req.user.name, req.params.id]);

        const { rows } = await db.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
        const request = rows[0];

        await db.query(
            'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1,$2,$3,$4,$5)',
            ['A' + Date.now(), 'อนุมัติคำขอ', req.user.name, `อนุมัติคำขอ ${request?.type} ของ ${request?.doctor_name}`, new Date().toLocaleString('th-TH')]
        );

        // Create notification
        await db.query(
            'INSERT INTO notifications (id, type, title, message, icon_key, time, read) VALUES ($1,$2,$3,$4,$5,$6,$7)',
            ['N' + Date.now(), 'approval', 'คำขอได้รับอนุมัติ', `คำขอ${request?.type === 'leave' ? 'ลา' : 'สลับเวร'} ${request?.date} ได้รับอนุมัติ`, 'checkCircle', 'เมื่อสักครู่', 0]
        );

        res.json({ message: 'อนุมัติสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/requests/:id/reject
router.put('/:id/reject', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        await db.query('UPDATE requests SET status = $1 WHERE id = $2', ['rejected', req.params.id]);

        const { rows } = await db.query('SELECT * FROM requests WHERE id = $1', [req.params.id]);
        const request = rows[0];

        await db.query(
            'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1,$2,$3,$4,$5)',
            ['A' + Date.now(), 'ไม่อนุมัติคำขอ', req.user.name, `ไม่อนุมัติคำขอ ${request?.type} ของ ${request?.doctor_name}`, new Date().toLocaleString('th-TH')]
        );

        res.json({ message: 'ไม่อนุมัติแล้ว' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
