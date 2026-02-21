// ==========================================
// PrinCare — Express Server
// ==========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./database');

// Import environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database asynchronously before setting up routes
async function startServer() {
    try {
        console.log('Starting server initialization...');
        if (!process.env.DATABASE_URL) {
            console.warn('WARNING: DATABASE_URL environment variable is not set. Falling back to localhost.');
        } else {
            console.log('DATABASE_URL detected. Connecting to PostgreSQL...');
        }

        const pool = await initDatabase();
        app.locals.db = pool;
        console.log('Database connected successfully and attached to app locals.');
    } catch (err) {
        console.error('FATAL ERROR: Failed to connect to database during startup.');
        console.error('Error Details:', err.message);
        console.error('Stack Trace:', err.stack);
        // Don't exit process in Render immediately, let the port bind so we can see the logs
        // process.exit(1);
    }

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

    // Catch-all for unhandled /api routes
    app.use('/api', (req, res) => {
        res.status(404).json({ error: `ไม่พบ API: ${req.method} ${req.path}` });
    });

    // ── Static files (after API routes) ──
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
        // In Production: Serve compiled frontend from 'dist'
        app.use(express.static(distPath));
        // Serve index.html as fallback for SPA routing if needed
        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(path.join(distPath, 'index.html'));
            }
        });
    } else {
        // In Development: Serve raw files (usually handled by Vite on port 3000 though)
        app.use('/src', express.static(path.join(__dirname, 'src')));
        app.use('/pages', express.static(path.join(__dirname, 'pages')));
        app.use(express.static(__dirname, {
            index: 'index.html',
            extensions: ['html']
        }));
    }

    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error('SERVER ERROR:', err);
        if (req.path.startsWith('/api')) {
            res.status(500).json({ error: 'ระบบขัดข้อง: ' + err.message });
        } else {
            res.status(500).send('<h2>ระบบขัดข้อง</h2><p>' + err.message + '</p>');
        }
    });

    app.listen(PORT, () => {
        console.log(`PrinCare server running on http://localhost:${PORT}`);
    });
}

startServer();
