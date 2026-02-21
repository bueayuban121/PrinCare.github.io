// ==========================================
// PrinCare — Notifications Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/notifications
router.get('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    res.json(db.prepare('SELECT * FROM notifications ORDER BY read ASC, rowid DESC').all());
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'อ่านแล้ว' });
});

// PUT /api/notifications/read-all
router.put('/read-all/batch', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('UPDATE notifications SET read = 1').run();
    res.json({ message: 'อ่านทั้งหมดแล้ว' });
});

module.exports = router;
