const { Pool } = require('pg');

const connectionString = 'postgresql://postgres.zhvxvhsfthfudiyebsyo:gHSirmhngwRYC4Ld@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
});

async function testConnection() {
    try {
        console.log('Testing connection to Supabase...');
        const result = await pool.query('SELECT NOW()');
        console.log('Connection successful! Server time:', result.rows[0].now);
    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        pool.end();
    }
}

testConnection();
