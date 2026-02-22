// ==========================================
// PrinCare — Profile Routes
// ==========================================
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/profile
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { rows } = await db.query('SELECT id, name, name_en, email, role, branch, department, position, avatar, phone FROM users WHERE id = $1', [req.user.id]);
        const user = rows[0];
        if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
        res.json(user);
    } catch (e) {
        next(e);
    }
});

// PUT /api/profile
router.put('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, name_en, email, phone, avatar, branch } = req.body;
        if (avatar) {
            await db.query('UPDATE users SET name=$1, name_en=$2, email=$3, phone=$4, avatar=$5, branch=$6 WHERE id=$7', [name, name_en || '', email, phone || '', avatar, branch || 'PSV01', req.user.id]);
        } else {
            await db.query('UPDATE users SET name=$1, name_en=$2, email=$3, phone=$4, branch=$5 WHERE id=$6', [name, name_en || '', email, phone || '', branch || 'PSV01', req.user.id]);
        }
        res.json({ message: 'บันทึกข้อมูลสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/profile/password
router.put('/password', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) return res.status(400).json({ error: 'กรุณากรอกรหัสผ่าน' });
        if (new_password.length < 6) return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });

        const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = rows[0];

        if (!user || !bcrypt.compareSync(current_password, user.password)) {
            return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
        }

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [bcrypt.hashSync(new_password, 10), req.user.id]);
        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
