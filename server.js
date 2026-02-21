// ==========================================
// PrinCare — Express Server
// ==========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = initDatabase();
app.locals.db = db;

// Middleware
app.use(cors());
app.use(express.json());

// ── API Routes (MUST come before static files) ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/n8n', require('./routes/n8n'));

// ── Static files (after API routes) ──
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Serve dist if exists (production build), else project root
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}
app.use(express.static(__dirname, {
    index: 'index.html',
    extensions: ['html']
}));

app.listen(PORT, () => {
    console.log(`PrinCare server running on http://localhost:${PORT}`);
});
