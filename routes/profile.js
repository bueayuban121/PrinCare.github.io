// ==========================================
// PrinCare — Profile Routes
// ==========================================
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/profile
router.get('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const user = db.prepare('SELECT id, name, name_en, email, role, department, position, avatar, phone FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    res.json(user);
});

// PUT /api/profile
router.put('/', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { name, name_en, email, phone } = req.body;
    db.prepare('UPDATE users SET name=?, name_en=?, email=?, phone=? WHERE id=?').run(name, name_en || '', email, phone || '', req.user.id);
    res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
});

// PUT /api/profile/password
router.put('/password', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
    if (new_password.length < 6) return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password)) {
        return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id);
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
});

module.exports = router;
