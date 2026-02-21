// ==========================================
// PrinCare — Settings Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/settings/departments
router.get('/departments', authMiddleware, async (req, res, next) => {
    try {
        const { rows } = await req.app.locals.db.query('SELECT * FROM departments ORDER BY name');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// POST /api/settings/departments
router.post('/departments', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, color, min_staff } = req.body;
        const id = 'DEP' + String(Date.now()).slice(-4);
        await db.query(
            'INSERT INTO departments (id, name, color, min_staff, total_doctors) VALUES ($1,$2,$3,$4,0)',
            [id, name, color || '#4A90B8', min_staff || 1]
        );
        res.json({ id, message: 'เพิ่มแผนกสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// DELETE /api/settings/departments/:id
router.delete('/departments/:id', authMiddleware, async (req, res, next) => {
    try {
        await req.app.locals.db.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบแผนกสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// GET /api/settings/shift-types
router.get('/shift-types', authMiddleware, async (req, res, next) => {
    try {
        const { rows } = await req.app.locals.db.query('SELECT * FROM shift_types');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// POST /api/settings/shift-types
router.post('/shift-types', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, time, color, icon_key } = req.body;
        const id = 'SH' + String(Date.now()).slice(-4);
        await db.query(
            'INSERT INTO shift_types (id, name, time, color, icon_key) VALUES ($1,$2,$3,$4,$5)',
            [id, name, time, color || '#4A90B8', icon_key || 'clock']
        );
        res.json({ id, message: 'เพิ่มประเภทเวรสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// DELETE /api/settings/shift-types/:id
router.delete('/shift-types/:id', authMiddleware, async (req, res, next) => {
    try {
        await req.app.locals.db.query('DELETE FROM shift_types WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบประเภทเวรสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// GET /api/settings/holidays
router.get('/holidays', authMiddleware, async (req, res, next) => {
    try {
        const { rows } = await req.app.locals.db.query('SELECT * FROM holidays ORDER BY date');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// POST /api/settings/holidays
router.post('/holidays', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { date, name } = req.body;
        const result = await db.query(
            'INSERT INTO holidays (date, name) VALUES ($1,$2) RETURNING id',
            [date, name]
        );
        res.json({ id: result.rows[0].id, message: 'เพิ่มวันหยุดสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// DELETE /api/settings/holidays/:id
router.delete('/holidays/:id', authMiddleware, async (req, res, next) => {
    try {
        await req.app.locals.db.query('DELETE FROM holidays WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบวันหยุดสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// GET /api/settings/rules
router.get('/rules', authMiddleware, async (req, res, next) => {
    try {
        const { rows } = await req.app.locals.db.query('SELECT * FROM settings');
        const obj = {};
        rows.forEach(r => obj[r.key] = r.value);
        res.json(obj);
    } catch (e) {
        next(e);
    }
});

// PUT /api/settings/rules
router.put('/rules', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        for (const [key, value] of Object.entries(req.body)) {
            await db.query(
                'INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                [key, String(value)]
            );
        }
        res.json({ message: 'บันทึกกฎสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// GET /api/settings/audit-log
router.get('/audit-log', authMiddleware, async (req, res, next) => {
    try {
        const { rows } = await req.app.locals.db.query('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
