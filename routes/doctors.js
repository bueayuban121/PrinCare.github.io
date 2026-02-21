// ==========================================
// PrinCare — Doctors Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/doctors
router.get('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const doctors = db.prepare('SELECT * FROM doctors ORDER BY name').all();
    res.json(doctors);
});

// GET /api/doctors/:id
router.get('/:id', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const doc = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'ไม่พบแพทย์' });
    res.json(doc);
});

// POST /api/doctors
router.post('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { name, email, dept, position, seniority, specialty, license, phone, constraints_note } = req.body;
    if (!name || !dept) return res.status(400).json({ error: 'กรุณากรอกชื่อและแผนก' });

    const id = 'D' + String(Date.now()).slice(-6);
    const avatar = name.replace(/^(นพ\.|พญ\.)/, '').trim().substring(0, 2);

    db.prepare('INSERT INTO doctors (id, name, email, dept, position, seniority, specialty, license, status, avatar, phone, constraints_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, name, email || '', dept, position || '', seniority || '', specialty || '', license || '', 'active', avatar, phone || '', constraints_note || '');

    // Audit
    db.prepare('INSERT INTO audit_log (id, action, user, detail, timestamp) VALUES (?,?,?,?,?)')
        .run('A' + Date.now(), 'เพิ่มแพทย์ใหม่', req.user.name, `เพิ่ม ${name} แผนก${dept}`, new Date().toLocaleString('th-TH'));

    res.json({ id, message: 'เพิ่มแพทย์สำเร็จ' });
});

// PUT /api/doctors/:id
router.put('/:id', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { name, email, dept, position, seniority, specialty, license, status, phone, constraints_note } = req.body;

    db.prepare('UPDATE doctors SET name=?, email=?, dept=?, position=?, seniority=?, specialty=?, license=?, status=?, phone=?, constraints_note=? WHERE id=?')
        .run(name, email || '', dept, position, seniority, specialty, license, status, phone, constraints_note || '', req.params.id);

    res.json({ message: 'แก้ไขข้อมูลแพทย์สำเร็จ' });
});

// DELETE /api/doctors/:id
router.delete('/:id', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
    res.json({ message: 'ลบแพทย์สำเร็จ' });
});

module.exports = router;
