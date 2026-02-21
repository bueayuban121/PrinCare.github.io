// ==========================================
// PrinCare — Auth Routes
// ==========================================
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'princare-secret-key-2569';

// Middleware to verify JWT
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });

    const db = req.app.locals.db;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
            id: user.id, name: user.name, name_en: user.name_en, email: user.email,
            role: user.role, department: user.department, position: user.position,
            avatar: user.avatar, phone: user.phone
        }
    });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    const db = req.app.locals.db;
    const user = db.prepare('SELECT id, name, name_en, email, role, department, position, avatar, phone FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    res.json(user);
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
