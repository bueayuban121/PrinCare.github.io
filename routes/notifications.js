// ==========================================
// PrinCare — Notifications Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/notifications
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { rows } = await db.query('SELECT * FROM notifications ORDER BY read ASC, id DESC');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        await db.query('UPDATE notifications SET read = 1 WHERE id = $1', [req.params.id]);
        res.json({ message: 'อ่านแล้ว' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/notifications/read-all
router.put('/read-all/batch', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        await db.query('UPDATE notifications SET read = 1');
        res.json({ message: 'อ่านทั้งหมดแล้ว' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
