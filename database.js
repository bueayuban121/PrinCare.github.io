// ==========================================
// PrinCare — PostgreSQL Database Setup
// ==========================================

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

let pool;

async function initDatabase() {
  // Determine connection string from env (Render/Supabase) or use local default
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/princare';

  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000, // Prevet infinite hang if IPv6/Port is blocked
    // Require SSL for remote connections, disable for localhost
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  // Catch background pool errors so they don't crash the Node.js process (Exit Status 1)
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    // Don't exit process here! Let Express stay alive.
  });

  console.log('Connecting to PostgreSQL database...');

  // ── Create Tables ──
  const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            name_en TEXT DEFAULT '',
            role TEXT NOT NULL DEFAULT 'doctor',
            department TEXT DEFAULT '',
            position TEXT DEFAULT '',
            avatar TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#4A90B8',
            min_staff INTEGER DEFAULT 1,
            total_doctors INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS shift_types (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            time TEXT NOT NULL,
            color TEXT DEFAULT '#4A90B8',
            icon_key TEXT DEFAULT 'clock'
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            dept TEXT NOT NULL,
            position TEXT DEFAULT '',
            seniority TEXT DEFAULT '',
            specialty TEXT DEFAULT '',
            license TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            avatar TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            email TEXT DEFAULT '',
            constraints_note TEXT DEFAULT '',
            user_id TEXT REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS schedules (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL,
            doctor_id TEXT NOT NULL,
            shift_id TEXT NOT NULL,
            dept_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            dept TEXT NOT NULL,
            date TEXT NOT NULL,
            reason TEXT DEFAULT '',
            swap_with TEXT DEFAULT '',
            swap_date TEXT DEFAULT '',
            status TEXT DEFAULT 'pending',
            approved_by TEXT DEFAULT '',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            icon_key TEXT DEFAULT 'bell',
            time TEXT NOT NULL,
            read INTEGER DEFAULT 0,
            user_id TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS holidays (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_log (
            id TEXT PRIMARY KEY,
            action TEXT NOT NULL,
            user_name TEXT NOT NULL,
            detail TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `;

  try {
    await pool.query(schema);
    console.log('PostgreSQL schema initialized.');

    // ── Seed Data ──
    const { rows } = await pool.query('SELECT COUNT(*) as c FROM users');
    const userCount = parseInt(rows[0].c, 10);

    if (userCount === 0) {
      console.log('No data found, seeding initial dataset...');
      await seedData(pool);
      console.log('Seed data inserted successfully.');
    } else {
      console.log(`Database already has ${userCount} users. Skipping seed.`);
    }
  } catch (err) {
    console.error('Failed to initialize or seed database:', err);
  }

  return pool;
}

async function seedData(pool) {
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // Helper function to insert in series
  const insertMany = async (queryText, dataRows) => {
    for (const row of dataRows) {
      await pool.query(queryText, row);
    }
  };

  // Users
  await insertMany(
    'INSERT INTO users (id, email, password, name, name_en, role, department, position, avatar, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
    [
      ['U001', 'admin@princare.com', hash('admin123'), 'นพ.สมชาย รักษาดี', 'Dr. Somchai Raksadee', 'admin', 'อายุรกรรม', 'ผู้อำนวยการฝ่ายการแพทย์', 'สร', '081-234-5678'],
      ['U002', 'head@princare.com', hash('head123'), 'นพ.วิชัย ปัญญาดี', 'Dr. Wichai Panyadee', 'head', 'ศัลยกรรม', 'หัวหน้าแผนก', 'วป', '083-456-7890'],
      ['U003', 'doctor@princare.com', hash('doctor123'), 'นพ.อนันต์ สุขสมบูรณ์', 'Dr. Anan Suksomboon', 'doctor', 'ฉุกเฉิน (ER)', 'แพทย์ประจำ', 'อส', '085-678-9012'],
    ]
  );

  // Departments
  await insertMany(
    'INSERT INTO departments (id, name, color, min_staff, total_doctors) VALUES ($1, $2, $3, $4, $5)',
    [
      ['DEP01', 'อายุรกรรม', '#4A90B8', 3, 12],
      ['DEP02', 'ศัลยกรรม', '#5AAFA0', 2, 8],
      ['DEP03', 'กุมารเวชกรรม', '#F6AD55', 2, 6],
      ['DEP04', 'สูตินรีเวชกรรม', '#9F7AEA', 2, 5],
      ['DEP05', 'ออร์โธปิดิกส์', '#FC8181', 1, 4],
      ['DEP06', 'ฉุกเฉิน (ER)', '#E53E3E', 3, 10],
      ['DEP07', 'วิสัญญีวิทยา', '#68D391', 2, 5],
      ['DEP08', 'จักษุวิทยา', '#63B3ED', 1, 3],
    ]
  );

  // Shift Types
  await insertMany(
    'INSERT INTO shift_types (id, name, time, color, icon_key) VALUES ($1, $2, $3, $4, $5)',
    [
      ['SH01', 'เวรเช้า', '08:00 - 16:00', '#63B3ED', 'sunrise'],
      ['SH02', 'เวรบ่าย', '16:00 - 00:00', '#F6AD55', 'sunset'],
      ['SH03', 'เวรดึก', '00:00 - 08:00', '#9F7AEA', 'moon'],
      ['SH04', 'เวร OPD', '08:00 - 17:00', '#68D391', 'hospital'],
      ['SH05', 'เวร ER', '24 ชม.', '#FC8181', 'ambulance'],
      ['SH06', 'เวร ICU', '24 ชม.', '#F687B3', 'heartPulse'],
      ['SH07', 'On-Call', 'ตามเรียก', '#4FD1C5', 'phoneCall'],
    ]
  );

  // Doctors
  await insertMany(
    'INSERT INTO doctors (id, name, dept, position, seniority, specialty, license, status, avatar, phone, email, constraints_note, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
    [
      ['D001', 'นพ.สมชาย รักษาดี', 'อายุรกรรม', 'อาจารย์แพทย์', 'อาวุโส', 'โรคหัวใจ', 'ว.12345', 'active', 'สร', '081-234-5678', 'somchai.r@princare.com', '', 'U001'],
      ['D002', 'พญ.สุภาพร แสงทอง', 'อายุรกรรม', 'แพทย์ประจำบ้าน', 'กลาง', 'โรคทางเดินอาหาร', 'ว.23456', 'active', 'สส', '082-345-6789', 'supaporn.s@princare.com', 'ตั้งครรภ์ 7 เดือน', null],
      ['D003', 'นพ.วิชัย ปัญญาดี', 'ศัลยกรรม', 'หัวหน้าแผนก', 'อาวุโส', 'ศัลยกรรมทั่วไป', 'ว.34567', 'active', 'วป', '083-456-7890', 'wichai.p@princare.com', '', 'U002'],
      ['D004', 'พญ.นิภา ศรีสุข', 'กุมารเวชกรรม', 'แพทย์ประจำ', 'กลาง', 'กุมารเวชทั่วไป', 'ว.45678', 'active', 'นศ', '084-567-8901', 'nipa.s@princare.com', 'ต้องรับลูกก่อน 17:00', null],
      ['D005', 'นพ.อนันต์ สุขสมบูรณ์', 'ฉุกเฉิน (ER)', 'แพทย์ประจำ', 'จูเนียร์', 'เวชศาสตร์ฉุกเฉิน', 'ว.56789', 'active', 'อส', '085-678-9012', 'anan.s@princare.com', '', 'U003'],
      ['D006', 'พญ.ดวงใจ รักดี', 'สูตินรีเวชกรรม', 'แพทย์ประจำ', 'อาวุโส', 'สูตินรีเวช', 'ว.67890', 'active', 'ดร', '086-789-0123', 'duangjai.r@princare.com', '', null],
      ['D007', 'นพ.ประสิทธิ์ เก่งมาก', 'ออร์โธปิดิกส์', 'แพทย์ประจำ', 'กลาง', 'ออร์โธปิดิกส์', 'ว.78901', 'active', 'ปก', '087-890-1234', 'prasit.k@princare.com', '', null],
      ['D008', 'พญ.มาลี สวัสดี', 'วิสัญญีวิทยา', 'แพทย์ประจำ', 'จูเนียร์', 'วิสัญญี', 'ว.89012', 'on-leave', 'มส', '088-901-2345', 'malee.s@princare.com', 'ลาพักร้อน', null],
      ['D009', 'นพ.สุรชัย แกร่งดี', 'ฉุกเฉิน (ER)', 'หัวหน้าแผนก', 'อาวุโส', 'เวชศาสตร์ฉุกเฉิน', 'ว.90123', 'active', 'สก', '089-012-3456', 'surachai.k@princare.com', '', null],
      ['D010', 'พญ.ฉวีวรรณ ใจดี', 'จักษุวิทยา', 'แพทย์ประจำ', 'กลาง', 'จักษุวิทยา', 'ว.01234', 'active', 'ฉจ', '090-123-4567', 'chaweewan.j@princare.com', '', null],
      ['D011', 'นพ.กิตติ ชาญเลิศ', 'อายุรกรรม', 'แพทย์ประจำ', 'จูเนียร์', 'อายุรกรรมทั่วไป', 'ว.11234', 'active', 'กช', '091-234-5678', 'kitti.c@princare.com', '', null],
      ['D012', 'พญ.อรุณ รุ่งเรือง', 'ศัลยกรรม', 'แพทย์ประจำบ้าน', 'จูเนียร์', 'ศัลยกรรมทั่วไป', 'ว.12234', 'active', 'อร', '092-345-6789', 'arun.r@princare.com', '', null],
    ]
  );

  // Schedules
  await insertMany(
    'INSERT INTO schedules (date, doctor_id, shift_id, dept_id) VALUES ($1, $2, $3, $4)',
    [
      ['2569-02-21', 'D001', 'SH01', 'DEP01'], ['2569-02-21', 'D002', 'SH02', 'DEP01'],
      ['2569-02-21', 'D005', 'SH05', 'DEP06'], ['2569-02-21', 'D009', 'SH05', 'DEP06'],
      ['2569-02-21', 'D003', 'SH01', 'DEP02'], ['2569-02-22', 'D001', 'SH03', 'DEP01'],
      ['2569-02-22', 'D011', 'SH01', 'DEP01'], ['2569-02-22', 'D005', 'SH07', 'DEP06'],
      ['2569-02-22', 'D006', 'SH01', 'DEP04'], ['2569-02-23', 'D002', 'SH04', 'DEP01'],
      ['2569-02-23', 'D003', 'SH01', 'DEP02'], ['2569-02-23', 'D007', 'SH01', 'DEP05'],
      ['2569-02-23', 'D009', 'SH03', 'DEP06'], ['2569-02-24', 'D004', 'SH01', 'DEP03'],
      ['2569-02-24', 'D010', 'SH01', 'DEP08'], ['2569-02-24', 'D012', 'SH02', 'DEP02'],
      ['2569-02-25', 'D001', 'SH04', 'DEP01'], ['2569-02-25', 'D005', 'SH05', 'DEP06'],
      ['2569-02-25', 'D006', 'SH01', 'DEP04'], ['2569-02-26', 'D003', 'SH01', 'DEP02'],
      ['2569-02-26', 'D009', 'SH05', 'DEP06'], ['2569-02-26', 'D011', 'SH03', 'DEP01'],
      ['2569-02-27', 'D002', 'SH01', 'DEP01'], ['2569-02-27', 'D007', 'SH01', 'DEP05'],
      ['2569-02-27', 'D004', 'SH04', 'DEP03'], ['2569-02-28', 'D001', 'SH01', 'DEP01'],
      ['2569-02-28', 'D005', 'SH03', 'DEP06'], ['2569-02-28', 'D012', 'SH01', 'DEP02'],
    ]
  );

  // Requests
  await insertMany(
    'INSERT INTO requests (id, type, doctor_name, dept, date, reason, swap_with, swap_date, status, approved_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
    [
      ['R001', 'leave', 'พญ.สุภาพร แสงทอง', 'อายุรกรรม', '1-3 มี.ค. 2569', 'ลาพักร้อน', '', '', 'approved', 'นพ.สมชาย รักษาดี', '15 ก.พ. 2569'],
      ['R002', 'swap', 'นพ.อนันต์ สุขสมบูรณ์', 'ฉุกเฉิน (ER)', '25 ก.พ. 2569', '', 'นพ.สุรชัย แกร่งดี', '27 ก.พ. 2569', 'pending', '', '19 ก.พ. 2569'],
      ['R003', 'replacement', 'พญ.มาลี สวัสดี', 'วิสัญญีวิทยา', '22-24 ก.พ. 2569', 'ป่วย', '', '', 'pending', '', '20 ก.พ. 2569'],
      ['R004', 'leave', 'นพ.กิตติ ชาญเลิศ', 'อายุรกรรม', '10-12 มี.ค. 2569', 'ลากิจ', '', '', 'pending', '', '18 ก.พ. 2569'],
      ['R005', 'swap', 'พญ.นิภา ศรีสุข', 'กุมารเวชกรรม', '5 มี.ค. 2569', 'ไม่ตรงคุณสมบัติ', 'พญ.ดวงใจ รักดี', '8 มี.ค. 2569', 'rejected', '', '16 ก.พ. 2569'],
    ]
  );

  // Notifications
  await insertMany(
    'INSERT INTO notifications (id, type, title, message, icon_key, time, read) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      ['N001', 'shift', 'เวรพรุ่งนี้', 'คุณมีเวรดึกวันพรุ่งนี้ (22 ก.พ. 2569) ที่แผนก ER', 'calendar', '2 ชั่วโมงที่แล้ว', 0],
      ['N002', 'request', 'คำขอสลับเวรใหม่', 'นพ.อนันต์ ขอสลับเวรวันที่ 25 ก.พ. กับคุณ', 'swap', '3 ชั่วโมงที่แล้ว', 0],
      ['N003', 'approval', 'คำขอลาได้รับอนุมัติ', 'คำขอลาวันที่ 1-3 มี.ค. ได้รับการอนุมัติจากหัวหน้าแผนก', 'checkCircle', '5 ชั่วโมงที่แล้ว', 1],
      ['N004', 'emergency', 'แจ้งเตือนฉุกเฉิน', 'แผนก ER ขาดแคลนแพทย์วันที่ 28 ก.พ. ต้องการ 2 คน', 'alertCircle', '1 วันที่แล้ว', 0],
      ['N005', 'system', 'ตารางเวรเดือน มี.ค. เผยแพร่แล้ว', 'ตรวจสอบตารางเวรเดือนมีนาคม 2569 ได้ที่หน้าตารางเวร', 'clipboard', '2 วันที่แล้ว', 1],
    ]
  );

  // Holidays
  await insertMany(
    'INSERT INTO holidays (date, name) VALUES ($1, $2)',
    [
      ['2569-01-01', 'วันขึ้นปีใหม่'], ['2569-02-26', 'วันมาฆบูชา'], ['2569-04-06', 'วันจักรี'],
      ['2569-04-13', 'วันสงกรานต์'], ['2569-04-14', 'วันสงกรานต์'], ['2569-04-15', 'วันสงกรานต์'],
      ['2569-05-01', 'วันแรงงาน'], ['2569-05-04', 'วันฉัตรมงคล'], ['2569-05-12', 'วันวิสาขบูชา'],
      ['2569-06-03', 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี'], ['2569-07-28', 'วันเฉลิมพระชนมพรรษา ร.10'],
      ['2569-08-12', 'วันแม่แห่งชาติ'], ['2569-10-13', 'วันคล้ายวันสวรรคต ร.9'],
      ['2569-10-23', 'วันปิยมหาราช'], ['2569-12-05', 'วันพ่อแห่งชาติ'],
      ['2569-12-10', 'วันรัฐธรรมนูญ'], ['2569-12-31', 'วันสิ้นปี'],
    ]
  );

  // Audit Log
  await insertMany(
    'INSERT INTO audit_log (id, action, user_name, detail, timestamp) VALUES ($1, $2, $3, $4, $5)',
    [
      ['A001', 'แก้ไขตารางเวร', 'นพ.สมชาย รักษาดี', 'เปลี่ยนเวร นพ.อนันต์ จากเวรเช้าเป็นเวรบ่าย วันที่ 22 ก.พ.', '21 ก.พ. 2569 10:30'],
      ['A002', 'อนุมัติคำขอลา', 'นพ.สมชาย รักษาดี', 'อนุมัติคำขอลาพักร้อน พญ.สุภาพร 1-3 มี.ค.', '20 ก.พ. 2569 14:15'],
      ['A003', 'เพิ่มแพทย์ใหม่', 'HR Admin', 'เพิ่ม พญ.อรุณ รุ่งเรือง แผนกศัลยกรรม', '18 ก.พ. 2569 09:00'],
      ['A004', 'เผยแพร่ตารางเวร', 'นพ.สมชาย รักษาดี', 'เผยแพร่ตารางเวรเดือน มี.ค. 2569', '17 ก.พ. 2569 16:45'],
      ['A005', 'แก้ไขกฎระบบ', 'System Admin', 'เปลี่ยนจำนวนชั่วโมงพักขั้นต่ำจาก 8 เป็น 10 ชม.', '15 ก.พ. 2569 11:20'],
    ]
  );

  // Settings
  await insertMany(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
    [
      ['min_rest_hours', '10'],
      ['max_night_shifts_per_month', '8'],
      ['max_consecutive_nights', '2'],
      ['max_holiday_shifts_per_month', '2'],
      ['workload_balance_tolerance', '10'],
      ['max_weekly_hours', '60'],
      ['pregnant_no_night', 'true'],
      ['er_min_staff', '3'],
    ]
  );
}

module.exports = { initDatabase };
