// ==========================================
// PrinCare — Mock Data (Thai)
// ==========================================

export const CURRENT_USER = {
    id: 'D001',
    name: 'นพ.สมชาย รักษาดี',
    nameEn: 'Dr. Somchai Raksadee',
    role: 'admin',
    department: 'อายุรกรรม',
    position: 'ผู้อำนวยการฝ่ายการแพทย์',
    avatar: 'สร',
    email: 'somchai@princare.com',
    phone: '081-234-5678',
};

export const DEPARTMENTS = [
    { id: 'DEP01', name: 'อายุรกรรม', color: '#4A90B8', minStaff: 3, totalDoctors: 12 },
    { id: 'DEP02', name: 'ศัลยกรรม', color: '#5AAFA0', minStaff: 2, totalDoctors: 8 },
    { id: 'DEP03', name: 'กุมารเวชกรรม', color: '#F6AD55', minStaff: 2, totalDoctors: 6 },
    { id: 'DEP04', name: 'สูตินรีเวชกรรม', color: '#9F7AEA', minStaff: 2, totalDoctors: 5 },
    { id: 'DEP05', name: 'ออร์โธปิดิกส์', color: '#FC8181', minStaff: 1, totalDoctors: 4 },
    { id: 'DEP06', name: 'ฉุกเฉิน (ER)', color: '#E53E3E', minStaff: 3, totalDoctors: 10 },
    { id: 'DEP07', name: 'วิสัญญีวิทยา', color: '#68D391', minStaff: 2, totalDoctors: 5 },
    { id: 'DEP08', name: 'จักษุวิทยา', color: '#63B3ED', minStaff: 1, totalDoctors: 3 },
];

export const SHIFT_TYPES = [
    { id: 'SH01', name: 'เวรเช้า', time: '08:00 - 16:00', color: '#63B3ED', iconKey: 'sunrise' },
    { id: 'SH02', name: 'เวรบ่าย', time: '16:00 - 00:00', color: '#F6AD55', iconKey: 'sunset' },
    { id: 'SH03', name: 'เวรดึก', time: '00:00 - 08:00', color: '#9F7AEA', iconKey: 'moon' },
    { id: 'SH04', name: 'เวร OPD', time: '08:00 - 17:00', color: '#68D391', iconKey: 'hospital' },
    { id: 'SH05', name: 'เวร ER', time: '24 ชม.', color: '#FC8181', iconKey: 'ambulance' },
    { id: 'SH06', name: 'เวร ICU', time: '24 ชม.', color: '#F687B3', iconKey: 'heartPulse' },
    { id: 'SH07', name: 'On-Call', time: 'ตามเรียก', color: '#4FD1C5', iconKey: 'phoneCall' },
];

export const DOCTORS = [
    { id: 'D001', name: 'นพ.สมชาย รักษาดี', dept: 'อายุรกรรม', position: 'อาจารย์แพทย์', seniority: 'อาวุโส', specialty: 'โรคหัวใจ', license: 'ว.12345', status: 'active', avatar: 'สร', phone: '081-234-5678', constraints: '' },
    { id: 'D002', name: 'พญ.สุภาพร แสงทอง', dept: 'อายุรกรรม', position: 'แพทย์ประจำบ้าน', seniority: 'กลาง', specialty: 'โรคทางเดินอาหาร', license: 'ว.23456', status: 'active', avatar: 'สส', phone: '082-345-6789', constraints: 'ตั้งครรภ์ 7 เดือน' },
    { id: 'D003', name: 'นพ.วิชัย ปัญญาดี', dept: 'ศัลยกรรม', position: 'หัวหน้าแผนก', seniority: 'อาวุโส', specialty: 'ศัลยกรรมทั่วไป', license: 'ว.34567', status: 'active', avatar: 'วป', phone: '083-456-7890', constraints: '' },
    { id: 'D004', name: 'พญ.นิภา ศรีสุข', dept: 'กุมารเวชกรรม', position: 'แพทย์ประจำ', seniority: 'กลาง', specialty: 'กุมารเวชทั่วไป', license: 'ว.45678', status: 'active', avatar: 'นศ', phone: '084-567-8901', constraints: 'ต้องรับลูกก่อน 17:00' },
    { id: 'D005', name: 'นพ.อนันต์ สุขสมบูรณ์', dept: 'ฉุกเฉิน (ER)', position: 'แพทย์ประจำ', seniority: 'จูเนียร์', specialty: 'เวชศาสตร์ฉุกเฉิน', license: 'ว.56789', status: 'active', avatar: 'อส', phone: '085-678-9012', constraints: '' },
    { id: 'D006', name: 'พญ.ดวงใจ รักดี', dept: 'สูตินรีเวชกรรม', position: 'แพทย์ประจำ', seniority: 'อาวุโส', specialty: 'สูตินรีเวช', license: 'ว.67890', status: 'active', avatar: 'ดร', phone: '086-789-0123', constraints: '' },
    { id: 'D007', name: 'นพ.ประสิทธิ์ เก่งมาก', dept: 'ออร์โธปิดิกส์', position: 'แพทย์ประจำ', seniority: 'กลาง', specialty: 'ออร์โธปิดิกส์', license: 'ว.78901', status: 'active', avatar: 'ปก', phone: '087-890-1234', constraints: '' },
    { id: 'D008', name: 'พญ.มาลี สวัสดี', dept: 'วิสัญญีวิทยา', position: 'แพทย์ประจำ', seniority: 'จูเนียร์', specialty: 'วิสัญญี', license: 'ว.89012', status: 'on-leave', avatar: 'มส', phone: '088-901-2345', constraints: 'ลาพักร้อน' },
    { id: 'D009', name: 'นพ.สุรชัย แกร่งดี', dept: 'ฉุกเฉิน (ER)', position: 'หัวหน้าแผนก', seniority: 'อาวุโส', specialty: 'เวชศาสตร์ฉุกเฉิน', license: 'ว.90123', status: 'active', avatar: 'สก', phone: '089-012-3456', constraints: '' },
    { id: 'D010', name: 'พญ.ฉวีวรรณ ใจดี', dept: 'จักษุวิทยา', position: 'แพทย์ประจำ', seniority: 'กลาง', specialty: 'จักษุวิทยา', license: 'ว.01234', status: 'active', avatar: 'ฉจ', phone: '090-123-4567', constraints: '' },
    { id: 'D011', name: 'นพ.กิตติ ชาญเลิศ', dept: 'อายุรกรรม', position: 'แพทย์ประจำ', seniority: 'จูเนียร์', specialty: 'อายุรกรรมทั่วไป', license: 'ว.11234', status: 'active', avatar: 'กช', phone: '091-234-5678', constraints: '' },
    { id: 'D012', name: 'พญ.อรุณ รุ่งเรือง', dept: 'ศัลยกรรม', position: 'แพทย์ประจำบ้าน', seniority: 'จูเนียร์', specialty: 'ศัลยกรรมทั่วไป', license: 'ว.12234', status: 'active', avatar: 'อร', phone: '092-345-6789', constraints: '' },
];

export const NOTIFICATIONS = [
    { id: 'N001', type: 'shift', title: 'เวรพรุ่งนี้', message: 'คุณมีเวรดึกวันพรุ่งนี้ (22 ก.พ. 2569) ที่แผนก ER', time: '2 ชั่วโมงที่แล้ว', read: false, iconKey: 'calendar' },
    { id: 'N002', type: 'request', title: 'คำขอสลับเวรใหม่', message: 'นพ.อนันต์ ขอสลับเวรวันที่ 25 ก.พ. กับคุณ', time: '3 ชั่วโมงที่แล้ว', read: false, iconKey: 'swap' },
    { id: 'N003', type: 'approval', title: 'คำขอลาได้รับอนุมัติ', message: 'คำขอลาวันที่ 1-3 มี.ค. ได้รับการอนุมัติจากหัวหน้าแผนก', time: '5 ชั่วโมงที่แล้ว', read: true, iconKey: 'checkCircle' },
    { id: 'N004', type: 'emergency', title: 'แจ้งเตือนฉุกเฉิน', message: 'แผนก ER ขาดแคลนแพทย์วันที่ 28 ก.พ. ต้องการ 2 คน', time: '1 วันที่แล้ว', read: false, iconKey: 'alertCircle' },
    { id: 'N005', type: 'system', title: 'ตารางเวรเดือน มี.ค. เผยแพร่แล้ว', message: 'ตรวจสอบตารางเวรเดือนมีนาคม 2569 ได้ที่หน้าตารางเวร', time: '2 วันที่แล้ว', read: true, iconKey: 'clipboard' },
];

export const REQUESTS = [
    { id: 'R001', type: 'leave', doctor: 'พญ.สุภาพร แสงทอง', dept: 'อายุรกรรม', date: '1-3 มี.ค. 2569', reason: 'ลาพักร้อน', status: 'approved', approvedBy: 'นพ.สมชาย รักษาดี', createdAt: '15 ก.พ. 2569' },
    { id: 'R002', type: 'swap', doctor: 'นพ.อนันต์ สุขสมบูรณ์', dept: 'ฉุกเฉิน (ER)', date: '25 ก.พ. 2569', swapWith: 'นพ.สุรชัย แกร่งดี', swapDate: '27 ก.พ. 2569', status: 'pending', createdAt: '19 ก.พ. 2569' },
    { id: 'R003', type: 'replacement', doctor: 'พญ.มาลี สวัสดี', dept: 'วิสัญญีวิทยา', date: '22-24 ก.พ. 2569', reason: 'ป่วย', status: 'pending', createdAt: '20 ก.พ. 2569' },
    { id: 'R004', type: 'leave', doctor: 'นพ.กิตติ ชาญเลิศ', dept: 'อายุรกรรม', date: '10-12 มี.ค. 2569', reason: 'ลากิจ', status: 'pending', createdAt: '18 ก.พ. 2569' },
    { id: 'R005', type: 'swap', doctor: 'พญ.นิภา ศรีสุข', dept: 'กุมารเวชกรรม', date: '5 มี.ค. 2569', swapWith: 'พญ.ดวงใจ รักดี', swapDate: '8 มี.ค. 2569', status: 'rejected', reason: 'ไม่ตรงคุณสมบัติ', createdAt: '16 ก.พ. 2569' },
];

// Schedule data for calendar
export const SCHEDULE_DATA = [
    { date: '2569-02-21', doctor: 'D001', shift: 'SH01', dept: 'DEP01' },
    { date: '2569-02-21', doctor: 'D002', shift: 'SH02', dept: 'DEP01' },
    { date: '2569-02-21', doctor: 'D005', shift: 'SH05', dept: 'DEP06' },
    { date: '2569-02-21', doctor: 'D009', shift: 'SH05', dept: 'DEP06' },
    { date: '2569-02-21', doctor: 'D003', shift: 'SH01', dept: 'DEP02' },
    { date: '2569-02-22', doctor: 'D001', shift: 'SH03', dept: 'DEP01' },
    { date: '2569-02-22', doctor: 'D011', shift: 'SH01', dept: 'DEP01' },
    { date: '2569-02-22', doctor: 'D005', shift: 'SH07', dept: 'DEP06' },
    { date: '2569-02-22', doctor: 'D006', shift: 'SH01', dept: 'DEP04' },
    { date: '2569-02-23', doctor: 'D002', shift: 'SH04', dept: 'DEP01' },
    { date: '2569-02-23', doctor: 'D003', shift: 'SH01', dept: 'DEP02' },
    { date: '2569-02-23', doctor: 'D007', shift: 'SH01', dept: 'DEP05' },
    { date: '2569-02-23', doctor: 'D009', shift: 'SH03', dept: 'DEP06' },
    { date: '2569-02-24', doctor: 'D004', shift: 'SH01', dept: 'DEP03' },
    { date: '2569-02-24', doctor: 'D010', shift: 'SH01', dept: 'DEP08' },
    { date: '2569-02-24', doctor: 'D012', shift: 'SH02', dept: 'DEP02' },
    { date: '2569-02-25', doctor: 'D001', shift: 'SH04', dept: 'DEP01' },
    { date: '2569-02-25', doctor: 'D005', shift: 'SH05', dept: 'DEP06' },
    { date: '2569-02-25', doctor: 'D006', shift: 'SH01', dept: 'DEP04' },
    { date: '2569-02-26', doctor: 'D003', shift: 'SH01', dept: 'DEP02' },
    { date: '2569-02-26', doctor: 'D009', shift: 'SH05', dept: 'DEP06' },
    { date: '2569-02-26', doctor: 'D011', shift: 'SH03', dept: 'DEP01' },
    { date: '2569-02-27', doctor: 'D002', shift: 'SH01', dept: 'DEP01' },
    { date: '2569-02-27', doctor: 'D007', shift: 'SH01', dept: 'DEP05' },
    { date: '2569-02-27', doctor: 'D004', shift: 'SH04', dept: 'DEP03' },
    { date: '2569-02-28', doctor: 'D001', shift: 'SH01', dept: 'DEP01' },
    { date: '2569-02-28', doctor: 'D005', shift: 'SH03', dept: 'DEP06' },
    { date: '2569-02-28', doctor: 'D012', shift: 'SH01', dept: 'DEP02' },
];

export const HOLIDAYS = [
    { date: '2569-01-01', name: 'วันขึ้นปีใหม่' },
    { date: '2569-02-26', name: 'วันมาฆบูชา' },
    { date: '2569-04-06', name: 'วันจักรี' },
    { date: '2569-04-13', name: 'วันสงกรานต์' },
    { date: '2569-04-14', name: 'วันสงกรานต์' },
    { date: '2569-04-15', name: 'วันสงกรานต์' },
    { date: '2569-05-01', name: 'วันแรงงาน' },
    { date: '2569-05-04', name: 'วันฉัตรมงคล' },
    { date: '2569-05-12', name: 'วันวิสาขบูชา' },
    { date: '2569-06-03', name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระราชินี' },
    { date: '2569-07-28', name: 'วันเฉลิมพระชนมพรรษา ร.10' },
    { date: '2569-08-12', name: 'วันแม่แห่งชาติ' },
    { date: '2569-10-13', name: 'วันคล้ายวันสวรรคต ร.9' },
    { date: '2569-10-23', name: 'วันปิยมหาราช' },
    { date: '2569-12-05', name: 'วันพ่อแห่งชาติ' },
    { date: '2569-12-10', name: 'วันรัฐธรรมนูญ' },
    { date: '2569-12-31', name: 'วันสิ้นปี' },
];

export const AUDIT_LOG = [
    { id: 'A001', action: 'แก้ไขตารางเวร', user: 'นพ.สมชาย รักษาดี', detail: 'เปลี่ยนเวร นพ.อนันต์ จากเวรเช้าเป็นเวรบ่าย วันที่ 22 ก.พ.', timestamp: '21 ก.พ. 2569 10:30' },
    { id: 'A002', action: 'อนุมัติคำขอลา', user: 'นพ.สมชาย รักษาดี', detail: 'อนุมัติคำขอลาพักร้อน พญ.สุภาพร 1-3 มี.ค.', timestamp: '20 ก.พ. 2569 14:15' },
    { id: 'A003', action: 'เพิ่มแพทย์ใหม่', user: 'HR Admin', detail: 'เพิ่ม พญ.อรุณ รุ่งเรือง แผนกศัลยกรรม', timestamp: '18 ก.พ. 2569 09:00' },
    { id: 'A004', action: 'เผยแพร่ตารางเวร', user: 'นพ.สมชาย รักษาดี', detail: 'เผยแพร่ตารางเวรเดือน มี.ค. 2569', timestamp: '17 ก.พ. 2569 16:45' },
    { id: 'A005', action: 'แก้ไขกฎระบบ', user: 'System Admin', detail: 'เปลี่ยนจำนวนชั่วโมงพักขั้นต่ำจาก 8 เป็น 10 ชม.', timestamp: '15 ก.พ. 2569 11:20' },
];
