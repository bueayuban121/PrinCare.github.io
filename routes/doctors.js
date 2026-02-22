// ==========================================
// PrinCare — Doctors Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');

// GET /api/doctors
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { rows } = await db.query('SELECT * FROM doctors ORDER BY name');
        res.json(rows);
    } catch (e) {
        next(e);
    }
});

// GET /api/doctors/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { rows } = await db.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
        const doc = rows[0];
        if (!doc) return res.status(404).json({ error: 'ไม่พบแพทย์' });
        res.json(doc);
    } catch (e) {
        next(e);
    }
});

// POST /api/doctors
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, email, dept, position, seniority, specialty, license, phone, constraints_note, branch, avatar } = req.body;
        if (!name || !dept) return res.status(400).json({ error: 'กรุณากรอกชื่อและแผนก' });

        const id = 'D' + String(Date.now()).slice(-6);
        const autoAvatar = name.replace(/^(นพ\.|พญ\.)/, '').trim().substring(0, 2);
        const finalAvatar = avatar || autoAvatar;

        await db.query(
            'INSERT INTO doctors (id, name, email, dept, branch, position, seniority, specialty, license, status, avatar, phone, constraints_note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
            [id, name, email || '', dept, branch || 'PSV01', position || '', seniority || '', specialty || '', license || '', 'active', finalAvatar, phone || '', constraints_note || '']
        );

        // Audit
        await db.query(
            'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1,$2,$3,$4,$5)',
            ['A' + Date.now(), 'เพิ่มแพทย์ใหม่', req.user.name, `เพิ่ม ${name} แผนก${dept}`, new Date().toLocaleString('th-TH')]
        );

        res.json({ id, message: 'เพิ่มแพทย์สำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// PUT /api/doctors/:id
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { name, email, dept, position, seniority, specialty, license, status, phone, constraints_note, branch, avatar } = req.body;

        if (avatar) {
            await db.query(
                'UPDATE doctors SET name=$1, email=$2, dept=$3, position=$4, seniority=$5, specialty=$6, license=$7, status=$8, phone=$9, constraints_note=$10, branch=$11, avatar=$12 WHERE id=$13',
                [name, email || '', dept, position, seniority, specialty, license, status, phone, constraints_note || '', branch || 'PSV01', avatar, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE doctors SET name=$1, email=$2, dept=$3, position=$4, seniority=$5, specialty=$6, license=$7, status=$8, phone=$9, constraints_note=$10, branch=$11 WHERE id=$12',
                [name, email || '', dept, position, seniority, specialty, license, status, phone, constraints_note || '', branch || 'PSV01', req.params.id]
            );
        }

        res.json({ message: 'แก้ไขข้อมูลแพทย์สำเร็จ' });
    } catch (e) {
        next(e);
    }
});

// DELETE /api/doctors/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        // Delete dependent schedules before deleting the doctor to prevent foreign key errors
        await db.query('DELETE FROM schedules WHERE doctor_id = $1', [req.params.id]);
        await db.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
        res.json({ message: 'ลบแพทย์สำเร็จ' });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
