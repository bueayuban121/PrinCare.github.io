// ==========================================
// PrinCare — Settings Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/settings/departments
router.get('/departments', authMiddleware, (req, res) => {
    res.json(req.app.locals.db.prepare('SELECT * FROM departments ORDER BY name').all());
});

// POST /api/settings/departments
router.post('/departments', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { name, color, min_staff } = req.body;
    const id = 'DEP' + String(Date.now()).slice(-4);
    db.prepare('INSERT INTO departments (id, name, color, min_staff, total_doctors) VALUES (?,?,?,?,0)').run(id, name, color || '#4A90B8', min_staff || 1);
    res.json({ id, message: 'เพิ่มแผนกสำเร็จ' });
});

// DELETE /api/settings/departments/:id
router.delete('/departments/:id', authMiddleware, (req, res) => {
    req.app.locals.db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
    res.json({ message: 'ลบแผนกสำเร็จ' });
});

// GET /api/settings/shift-types
router.get('/shift-types', authMiddleware, (req, res) => {
    res.json(req.app.locals.db.prepare('SELECT * FROM shift_types').all());
});

// POST /api/settings/shift-types
router.post('/shift-types', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { name, time, color, icon_key } = req.body;
    const id = 'SH' + String(Date.now()).slice(-4);
    db.prepare('INSERT INTO shift_types (id, name, time, color, icon_key) VALUES (?,?,?,?,?)').run(id, name, time, color || '#4A90B8', icon_key || 'clock');
    res.json({ id, message: 'เพิ่มประเภทเวรสำเร็จ' });
});

// DELETE /api/settings/shift-types/:id
router.delete('/shift-types/:id', authMiddleware, (req, res) => {
    req.app.locals.db.prepare('DELETE FROM shift_types WHERE id = ?').run(req.params.id);
    res.json({ message: 'ลบประเภทเวรสำเร็จ' });
});

// GET /api/settings/holidays
router.get('/holidays', authMiddleware, (req, res) => {
    res.json(req.app.locals.db.prepare('SELECT * FROM holidays ORDER BY date').all());
});

// POST /api/settings/holidays
router.post('/holidays', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { date, name } = req.body;
    const result = db.prepare('INSERT INTO holidays (date, name) VALUES (?,?)').run(date, name);
    res.json({ id: result.lastInsertRowid, message: 'เพิ่มวันหยุดสำเร็จ' });
});

// DELETE /api/settings/holidays/:id
router.delete('/holidays/:id', authMiddleware, (req, res) => {
    req.app.locals.db.prepare('DELETE FROM holidays WHERE id = ?').run(req.params.id);
    res.json({ message: 'ลบวันหยุดสำเร็จ' });
});

// GET /api/settings/rules
router.get('/rules', authMiddleware, (req, res) => {
    const rows = req.app.locals.db.prepare('SELECT * FROM settings').all();
    const obj = {};
    rows.forEach(r => obj[r.key] = r.value);
    res.json(obj);
});

// PUT /api/settings/rules
router.put('/rules', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    Object.entries(req.body).forEach(([key, value]) => {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)').run(key, String(value));
    });
    res.json({ message: 'บันทึกกฎสำเร็จ' });
});

// GET /api/settings/audit-log
router.get('/audit-log', authMiddleware, (req, res) => {
    res.json(req.app.locals.db.prepare('SELECT * FROM audit_log ORDER BY rowid DESC LIMIT 50').all());
});

module.exports = router;
