// ==========================================
// PrinCare — SQLite Database Setup
// ==========================================

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'princare.db');

function initDatabase() {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // ── Create Tables ──
    db.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      constraints_note TEXT DEFAULT '',
      user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      shift_id TEXT NOT NULL,
      dept_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      user TEXT NOT NULL,
      detail TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

    // ── Seed Data ──
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
    if (userCount === 0) {
        seedData(db);
    }

    return db;
}

function seedData(db) {
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    // Users
    const insertUser = db.prepare('INSERT INTO users (id, email, password, name, name_en, role, department, position, avatar, phone) VALUES (?,?,?,?,?,?,?,?,?,?)');
    insertUser.run('U001', 'admin@princare.com', hash('admin123'), 'นพ.สมชาย รักษาดี', 'Dr. Somchai Raksadee', 'admin', 'อายุรกรรม', 'ผู้อำนวยการฝ่ายการแพทย์', 'สร', '081-234-5678');
    insertUser.run('U002', 'head@princare.com', hash('head123'), 'นพ.วิชัย ปัญญาดี', 'Dr. Wichai Panyadee', 'head', 'ศัลยกรรม', 'หัวหน้าแผนก', 'วป', '083-456-7890');
    insertUser.run('U003', 'doctor@princare.com', hash('doctor123'), 'นพ.อนันต์ สุขสมบูรณ์', 'Dr. Anan Suksomboon', 'doctor', 'ฉุกเฉิน (ER)', 'แพทย์ประจำ', 'อส', '085-678-9012');

    // Departments
    const insertDept = db.prepare('INSERT INTO departments (id, name, color, min_staff, total_doctors) VALUES (?,?,?,?,?)');
    [
        ['DEP01', 'อายุรกรรม', '#4A90B8', 3, 12],
        ['DEP02', 'ศัลยกรรม', '#5AAFA0', 2, 8],
        ['DEP03', 'กุมารเวชกรรม', '#F6AD55', 2, 6],
        ['DEP04', 'สูตินรีเวชกรรม', '#9F7AEA', 2, 5],
        ['DEP05', 'ออร์โธปิดิกส์', '#FC8181', 1, 4],
        ['DEP06', 'ฉุกเฉิน (ER)', '#E53E3E', 3, 10],
        ['DEP07', 'วิสัญญีวิทยา', '#68D391', 2, 5],
        ['DEP08', 'จักษุวิทยา', '#63B3ED', 1, 3],
    ].forEach(d => insertDept.run(...d));

    // Shift Types
    const insertShift = db.prepare('INSERT INTO shift_types (id, name, time, color, icon_key) VALUES (?,?,?,?,?)');
    [
        ['SH01', 'เวรเช้า', '08:00 - 16:00', '#63B3ED', 'sunrise'],
        ['SH02', 'เวรบ่าย', '16:00 - 00:00', '#F6AD55', 'sunset'],
        ['SH03', 'เวรดึก', '00:00 - 08:00', '#9F7AEA', 'moon'],
        ['SH04', 'เวร OPD', '08:00 - 17:00', '#68D391', 'hospital'],
        ['SH05', 'เวร ER', '24 ชม.', '#FC8181', 'ambulance'],
        ['SH06', 'เวร ICU', '24 ชม.', '#F687B3', 'heartPulse'],
        ['SH07', 'On-Call', 'ตามเรียก', '#4FD1C5', 'phoneCall'],
    ].forEach(s => insertShift.run(...s));

    // Doctors
    const insertDoc = db.prepare('INSERT INTO doctors (id, name, dept, position, seniority, specialty, license, status, avatar, phone, constraints_note, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
    [
        ['D001', 'นพ.สมชาย รักษาดี', 'อายุรกรรม', 'อาจารย์แพทย์', 'อาวุโส', 'โรคหัวใจ', 'ว.12345', 'active', 'สร', '081-234-5678', '', 'U001'],
        ['D002', 'พญ.สุภาพร แสงทอง', 'อายุรกรรม', 'แพทย์ประจำบ้าน', 'กลาง', 'โรคทางเดินอาหาร', 'ว.23456', 'active', 'สส', '082-345-6789', 'ตั้งครรภ์ 7 เดือน', null],
        ['D003', 'นพ.วิชัย ปัญญาดี', 'ศัลยกรรม', 'หัวหน้าแผนก', 'อาวุโส', 'ศัลยกรรมทั่วไป', 'ว.34567', 'active', 'วป', '083-456-7890', '', 'U002'],
        ['D004', 'พญ.นิภา ศรีสุข', 'กุมารเวชกรรม', 'แพทย์ประจำ', 'กลาง', 'กุมารเวชทั่วไป', 'ว.45678', 'active', 'นศ', '084-567-8901', 'ต้องรับลูกก่อน 17:00', null],
        ['D005', 'นพ.อนันต์ สุขสมบูรณ์', 'ฉุกเฉิน (ER)', 'แพทย์ประจำ', 'จูเนียร์', 'เวชศาสตร์ฉุกเฉิน', 'ว.56789', 'active', 'อส', '085-678-9012', '', 'U003'],
        ['D006', 'พญ.ดวงใจ รักดี', 'สูตินรีเวชกรรม', 'แพทย์ประจำ', 'อาวุโส', 'สูตินรีเวช', 'ว.67890', 'active', 'ดร', '086-789-0123', '', null],
        ['D007', 'นพ.ประสิทธิ์ เก่งมาก', 'ออร์โธปิดิกส์', 'แพทย์ประจำ', 'กลาง', 'ออร์โธปิดิกส์', 'ว.78901', 'active', 'ปก', '087-890-1234', '', null],
        ['D008', 'พญ.มาลี สวัสดี', 'วิสัญญีวิทยา', 'แพทย์ประจำ', 'จูเนียร์', 'วิสัญญี', 'ว.89012', 'on-leave', 'มส', '088-901-2345', 'ลาพักร้อน', null],
        ['D009', 'นพ.สุรชัย แกร่งดี', 'ฉุกเฉิน (ER)', 'หัวหน้าแผนก', 'อาวุโส', 'เวชศาสตร์ฉุกเฉิน', 'ว.90123', 'active', 'สก', '089-012-3456', '', null],
        ['D010', 'พญ.ฉวีวรรณ ใจดี', 'จักษุวิทยา', 'แพทย์ประจำ', 'กลาง', 'จักษุวิทยา', 'ว.01234', 'active', 'ฉจ', '090-123-4567', '', null],
        ['D011', 'นพ.กิตติ ชาญเลิศ', 'อายุรกรรม', 'แพทย์ประจำ', 'จูเนียร์', 'อายุรกรรมทั่วไป', 'ว.11234', 'active', 'กช', '091-234-5678', '', null],
        ['D012', 'พญ.อรุณ รุ่งเรือง', 'ศัลยกรรม', 'แพทย์ประจำบ้าน', 'จูเนียร์', 'ศัลยกรรมทั่วไป', 'ว.12234', 'active', 'อร', '092-345-6789', '', null],
    ].forEach(d => insertDoc.run(...d));

    // Schedules
    const insertSched = db.prepare('INSERT INTO schedules (date, doctor_id, shift_id, dept_id) VALUES (?,?,?,?)');
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
    ].forEach(s => insertSched.run(...s));

    // Requests
    const insertReq = db.prepare('INSERT INTO requests (id, type, doctor_name, dept, date, reason, swap_with, swap_date, status, approved_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    insertReq.run('R001', 'leave', 'พญ.สุภาพร แสงทอง', 'อายุรกรรม', '1-3 มี.ค. 2569', 'ลาพักร้อน', '', '', 'approved', 'นพ.สมชาย รักษาดี', '15 ก.พ. 2569');
    insertReq.run('R002', 'swap', 'นพ.อนันต์ สุขสมบูรณ์', 'ฉุกเฉิน (ER)', '25 ก.พ. 2569', '', 'นพ.สุรชัย แกร่งดี', '27 ก.พ. 2569', 'pending', '', '19 ก.พ. 2569');
    insertReq.run('R003', 'replacement', 'พญ.มาลี สวัสดี', 'วิสัญญีวิทยา', '22-24 ก.พ. 2569', 'ป่วย', '', '', 'pending', '', '20 ก.พ. 2569');
    insertReq.run('R004', 'leave', 'นพ.กิตติ ชาญเลิศ', 'อายุรกรรม', '10-12 มี.ค. 2569', 'ลากิจ', '', '', 'pending', '', '18 ก.พ. 2569');
    insertReq.run('R005', 'swap', 'พญ.นิภา ศรีสุข', 'กุมารเวชกรรม', '5 มี.ค. 2569', 'ไม่ตรงคุณสมบัติ', 'พญ.ดวงใจ รักดี', '8 มี.ค. 2569', 'rejected', '', '16 ก.พ. 2569');

    // Notifications
    const insertNotif = db.prepare('INSERT INTO notifications (id, type, title, message, icon_key, time, read) VALUES (?,?,?,?,?,?,?)');
    insertNotif.run('N001', 'shift', 'เวรพรุ่งนี้', 'คุณมีเวรดึกวันพรุ่งนี้ (22 ก.พ. 2569) ที่แผนก ER', 'calendar', '2 ชั่วโมงที่แล้ว', 0);
    insertNotif.run('N002', 'request', 'คำขอสลับเวรใหม่', 'นพ.อนันต์ ขอสลับเวรวันที่ 25 ก.พ. กับคุณ', 'swap', '3 ชั่วโมงที่แล้ว', 0);
    insertNotif.run('N003', 'approval', 'คำขอลาได้รับอนุมัติ', 'คำขอลาวันที่ 1-3 มี.ค. ได้รับการอนุมัติจากหัวหน้าแผนก', 'checkCircle', '5 ชั่วโมงที่แล้ว', 1);
    insertNotif.run('N004', 'emergency', 'แจ้งเตือนฉุกเฉิน', 'แผนก ER ขาดแคลนแพทย์วันที่ 28 ก.พ. ต้องการ 2 คน', 'alertCircle', '1 วันที่แล้ว', 0);
    insertNotif.run('N005', 'system', 'ตารางเวรเดือน มี.ค. เผยแพร่แล้ว', 'ตรวจสอบตารางเวรเดือนมีนาคม 2569 ได้ที่หน้าตารางเวร', 'clipboard', '2 วันที่แล้ว', 1);

    // Holidays
    const insertHol = db.prepare('INSERT INTO holidays (date, name) VALUES (?,?)');
    [
        ['2569-01-01', 'วันขึ้นปีใหม่'], ['2569-02-26', 'วันมาฆบูชา'], ['2569-04-06', 'วันจักรี'],
        ['2569-04-13', 'วันสงกรานต์'], ['2569-04-14', 'วันสงกรานต์'], ['2569-04-15', 'วันสงกรานต์'],
        ['2569-05-01', 'วันแรงงาน'], ['2569-05-04', 'วันฉัตรมงคล'], ['2569-05-12', 'วันวิสาขบูชา'],
        ['2569-06-03', 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี'], ['2569-07-28', 'วันเฉลิมพระชนมพรรษา ร.10'],
        ['2569-08-12', 'วันแม่แห่งชาติ'], ['2569-10-13', 'วันคล้ายวันสวรรคต ร.9'],
        ['2569-10-23', 'วันปิยมหาราช'], ['2569-12-05', 'วันพ่อแห่งชาติ'],
        ['2569-12-10', 'วันรัฐธรรมนูญ'], ['2569-12-31', 'วันสิ้นปี'],
    ].forEach(h => insertHol.run(...h));

    // Audit Log
    const insertAudit = db.prepare('INSERT INTO audit_log (id, action, user, detail, timestamp) VALUES (?,?,?,?,?)');
    insertAudit.run('A001', 'แก้ไขตารางเวร', 'นพ.สมชาย รักษาดี', 'เปลี่ยนเวร นพ.อนันต์ จากเวรเช้าเป็นเวรบ่าย วันที่ 22 ก.พ.', '21 ก.พ. 2569 10:30');
    insertAudit.run('A002', 'อนุมัติคำขอลา', 'นพ.สมชาย รักษาดี', 'อนุมัติคำขอลาพักร้อน พญ.สุภาพร 1-3 มี.ค.', '20 ก.พ. 2569 14:15');
    insertAudit.run('A003', 'เพิ่มแพทย์ใหม่', 'HR Admin', 'เพิ่ม พญ.อรุณ รุ่งเรือง แผนกศัลยกรรม', '18 ก.พ. 2569 09:00');
    insertAudit.run('A004', 'เผยแพร่ตารางเวร', 'นพ.สมชาย รักษาดี', 'เผยแพร่ตารางเวรเดือน มี.ค. 2569', '17 ก.พ. 2569 16:45');
    insertAudit.run('A005', 'แก้ไขกฎระบบ', 'System Admin', 'เปลี่ยนจำนวนชั่วโมงพักขั้นต่ำจาก 8 เป็น 10 ชม.', '15 ก.พ. 2569 11:20');

    // Settings
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)');
    insertSetting.run('min_rest_hours', '10');
    insertSetting.run('max_night_shifts_per_month', '8');
    insertSetting.run('max_consecutive_nights', '2');
    insertSetting.run('max_holiday_shifts_per_month', '2');
    insertSetting.run('workload_balance_tolerance', '10');
    insertSetting.run('max_weekly_hours', '60');
    insertSetting.run('pregnant_no_night', 'true');
    insertSetting.run('er_min_staff', '3');
}

module.exports = { initDatabase };
