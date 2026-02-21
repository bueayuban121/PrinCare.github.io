// ==========================================
// PrinCare — Requests Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/requests
router.get('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { type, status } = req.query;
    let query = 'SELECT * FROM requests';
    const params = [];
    const conditions = [];
    if (type && type !== 'all') { conditions.push('type = ?'); params.push(type); }
    if (status && status !== 'all') { conditions.push('status = ?'); params.push(status); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY rowid DESC';

    res.json(db.prepare(query).all(...params));
});

// POST /api/requests
router.post('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { type, doctor_name, dept, date, reason, swap_with, swap_date } = req.body;
    if (!type || !date) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

    const id = 'R' + String(Date.now()).slice(-6);
    const created_at = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    db.prepare('INSERT INTO requests (id, type, doctor_name, dept, date, reason, swap_with, swap_date, status, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .run(id, type, doctor_name || req.user.name, dept || '', date, reason || '', swap_with || '', swap_date || '', 'pending', created_at);

    res.json({ id, message: 'สร้างคำขอสำเร็จ' });
});

// PUT /api/requests/:id/approve
router.put('/:id/approve', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('UPDATE requests SET status = ?, approved_by = ? WHERE id = ?').run('approved', req.user.name, req.params.id);

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    db.prepare('INSERT INTO audit_log (id, action, user, detail, timestamp) VALUES (?,?,?,?,?)')
        .run('A' + Date.now(), 'อนุมัติคำขอ', req.user.name, `อนุมัติคำขอ ${request?.type} ของ ${request?.doctor_name}`, new Date().toLocaleString('th-TH'));

    // Create notification
    db.prepare('INSERT INTO notifications (id, type, title, message, icon_key, time, read) VALUES (?,?,?,?,?,?,?)')
        .run('N' + Date.now(), 'approval', 'คำขอได้รับอนุมัติ', `คำขอ${request?.type === 'leave' ? 'ลา' : 'สลับเวร'} ${request?.date} ได้รับอนุมัติ`, 'checkCircle', 'เมื่อสักครู่', 0);

    res.json({ message: 'อนุมัติสำเร็จ' });
});

// PUT /api/requests/:id/reject
router.put('/:id/reject', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('UPDATE requests SET status = ? WHERE id = ?').run('rejected', req.params.id);

    const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id);
    db.prepare('INSERT INTO audit_log (id, action, user, detail, timestamp) VALUES (?,?,?,?,?)')
        .run('A' + Date.now(), 'ไม่อนุมัติคำขอ', req.user.name, `ไม่อนุมัติคำขอ ${request?.type} ของ ${request?.doctor_name}`, new Date().toLocaleString('th-TH'));

    res.json({ message: 'ไม่อนุมัติแล้ว' });
});

module.exports = router;
