const express = require('express');
const router = express.Router();

// GET /api/n8n/upcoming-shifts
// Returns schedule for the next N days (default 7), joined with doctor emails.
// Useful for sending automated shift reminders.
router.get('/upcoming-shifts', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;

        // Date calculation for the query (today to today + N days)
        const getThaiDateStr = (d) => {
            const year = d.getFullYear() + 543;
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const today = new Date();
        const startStr = getThaiDateStr(today);
        const end = new Date(today);
        end.setDate(end.getDate() + days);
        const endStr = getThaiDateStr(end);

        const sql = `
            SELECT 
                s.date,
                d.name as doctor_name,
                d.email as doctor_email,
                d.phone as doctor_phone,
                d.dept,
                st.name as shift_name,
                st.time as shift_time
            FROM schedules s
            JOIN doctors d ON s.doctor_id = d.id
            JOIN shift_types st ON s.shift_id = st.id
            WHERE s.date >= $1 AND s.date <= $2
            ORDER BY s.date ASC, st.name ASC
        `;

        const { rows } = await req.app.locals.db.query(sql, [startStr, endStr]);

        res.json({
            success: true,
            count: rows.length,
            dateRange: { start: startStr, end: endStr },
            data: rows
        });
    } catch (error) {
        console.error('n8n API error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;
