// ==========================================
// PrinCare — Doctors Page (API Connected)
// ==========================================
import { initApp } from '../src/js/app.js';
import { icons } from '../src/js/icons.js';
import { apiGet, apiPost, apiPut, apiDelete, requireAuth } from '../src/js/api.js';
import { getStatusBadge } from '../src/js/utils.js';

if (!requireAuth()) throw new Error('Not authenticated');
initApp('doctors', 'ข้อมูลแพทย์', ['หน้าหลัก', 'ข้อมูลแพทย์']);

document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('doctorsContent');
  let departments = [];

  async function render() {
    content.innerHTML = `<div class="skeleton" style="height:400px;border-radius:16px;"></div>`;
    try {
      const [doctors, depts] = await Promise.all([apiGet('/doctors'), apiGet('/settings/departments')]);
      departments = depts;
      content.innerHTML = `
        <div class="page-header">
          <div><h1 class="page-title">${icons.userDoctor} <span style="vertical-align:middle">ข้อมูลแพทย์</span></h1>
          <p class="page-subtitle">แพทย์ทั้งหมด ${doctors.length} คน · พร้อมปฏิบัติงาน ${doctors.filter(d => d.status === 'active').length} คน</p></div>
          <div class="page-actions"><button class="btn btn-primary" onclick="showAddDoctor()">${icons.plus} <span style="vertical-align:middle">เพิ่มแพทย์</span></button></div>
        </div>
        <div class="doctor-grid">
          ${doctors.map((doc, i) => {
        const status = getStatusBadge(doc.status);
        return `<div class="doctor-card animate-fade-in-up delay-${Math.min(i + 1, 5)}">
              <div class="doctor-card-header">
                <div class="doctor-avatar">${doc.avatar || '??'}</div>
                <div><div class="doctor-name">${doc.name}</div><div class="doctor-position">${doc.position}</div></div>
                <span class="badge ${status.class} badge-dot">${status.text}</span>
              </div>
              <div class="doctor-details">
                <div class="doctor-detail">${icons.hospital} <span style="vertical-align:middle">${doc.dept}</span></div>
                <div class="doctor-detail">${icons.star} <span style="vertical-align:middle">${doc.specialty || '-'}</span></div>
                <div class="doctor-detail">${icons.fileText} <span style="vertical-align:middle">${doc.license || '-'}</span></div>
                ${doc.phone ? `<div class="doctor-detail">${icons.phoneCall} <span style="vertical-align:middle">${doc.phone}</span></div>` : ''}
                ${doc.email ? `<div class="doctor-detail">${icons.mail} <span style="vertical-align:middle">${doc.email}</span></div>` : ''}
                ${doc.constraints_note ? `<div class="doctor-constraint">${icons.alert} <span style="vertical-align:middle">${doc.constraints_note}</span></div>` : ''}
              </div>
              <div class="doctor-card-actions">
                <button class="btn btn-sm btn-secondary" onclick="editDoctor('${doc.id}')">${icons.edit} แก้ไข</button>
                <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${doc.id}','${doc.name}')">${icons.trash} ลบ</button>
              </div>
            </div>`;
      }).join('')}
        </div>
        <div class="modal-overlay" id="addDoctorModal">
          <div class="modal" style="max-width:600px;">
            <div class="modal-header"><h3>เพิ่มแพทย์ใหม่</h3><button class="modal-close" onclick="closeAddDoctor()">${icons.x}</button></div>
            <form id="addDoctorForm">
              <div class="form-group"><label class="form-label">ชื่อ-นามสกุล</label><input type="text" class="form-input" id="docName" placeholder="นพ./พญ. ..." required /></div>
              <div class="form-group"><label class="form-label">อีเมล (รับแจ้งเตือน)</label><input type="email" class="form-input" id="docEmail" placeholder="doctor@princare.com" /></div>
              <div class="form-group"><label class="form-label">แผนก</label><select class="form-select" id="docDept">${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}</select></div>
              <div class="form-group"><label class="form-label">ตำแหน่ง</label><input type="text" class="form-input" id="docPosition" placeholder="แพทย์ประจำ" /></div>
              <div class="form-group"><label class="form-label">ความชำนาญ</label><input type="text" class="form-input" id="docSpecialty" /></div>
              <div class="form-group"><label class="form-label">เลขใบอนุญาต</label><input type="text" class="form-input" id="docLicense" placeholder="ว.xxxxx" /></div>
              <div class="form-group"><label class="form-label">เบอร์โทร</label><input type="text" class="form-input" id="docPhone" /></div>
              <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeAddDoctor()">ยกเลิก</button><button type="submit" class="btn btn-primary">บันทึก</button></div>
            </form>
          </div>
        </div>

        <div class="modal-overlay" id="editDoctorModal">
          <div class="modal" style="max-width:600px;">
            <div class="modal-header"><h3>แก้ไขข้อมูลแพทย์</h3><button class="modal-close" onclick="closeEditDoctor()">${icons.x}</button></div>
            <form id="editDoctorForm">
              <input type="hidden" id="editDocId" />
              <div class="form-group"><label class="form-label">ชื่อ-นามสกุล</label><input type="text" class="form-input" id="editDocName" required /></div>
              <div class="form-group"><label class="form-label">อีเมล (รับแจ้งเตือน)</label><input type="email" class="form-input" id="editDocEmail" /></div>
              <div class="form-group"><label class="form-label">แผนก</label><select class="form-select" id="editDocDept">${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}</select></div>
              <div class="form-group"><label class="form-label">ตำแหน่ง</label><input type="text" class="form-input" id="editDocPosition" /></div>
              <div class="form-group"><label class="form-label">ความชำนาญ</label><input type="text" class="form-input" id="editDocSpecialty" /></div>
              <div class="form-group"><label class="form-label">เลขใบอนุญาต</label><input type="text" class="form-input" id="editDocLicense" /></div>
              <div class="form-group"><label class="form-label">เบอร์โทร</label><input type="text" class="form-input" id="editDocPhone" /></div>
              <div class="form-group"><label class="form-label">สถานะ</label>
                <select class="form-select" id="editDocStatus">
                  <option value="active">พร้อมปฏิบัติงาน</option>
                  <option value="on-leave">ลาพัก</option>
                  <option value="inactive">พ้นสภาพ</option>
                </select>
              </div>
              <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeEditDoctor()">ยกเลิก</button><button type="submit" class="btn btn-primary">บันทึกการแก้ไข</button></div>
            </form>
          </div>
        </div>
      `;
      document.getElementById('addDoctorForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await apiPost('/doctors', { name: document.getElementById('docName').value, email: document.getElementById('docEmail').value, dept: document.getElementById('docDept').value, position: document.getElementById('docPosition').value, specialty: document.getElementById('docSpecialty').value, license: document.getElementById('docLicense').value, phone: document.getElementById('docPhone').value });
          closeAddDoctor(); render();
        } catch (err) { alert(err.message); }
      });

      document.getElementById('editDoctorForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const id = document.getElementById('editDocId').value;
          await apiPut(`/doctors/${id}`, {
            name: document.getElementById('editDocName').value,
            email: document.getElementById('editDocEmail').value,
            dept: document.getElementById('editDocDept').value,
            position: document.getElementById('editDocPosition').value,
            specialty: document.getElementById('editDocSpecialty').value,
            license: document.getElementById('editDocLicense').value,
            phone: document.getElementById('editDocPhone').value,
            status: document.getElementById('editDocStatus').value
          });
          closeEditDoctor(); render();
        } catch (err) { alert(err.message); }
      });
    } catch (err) { content.innerHTML = `<div class="card" style="padding:40px;text-align:center;"><p>${err.message}</p></div>`; }
  }
  render();
  window.showAddDoctor = () => document.getElementById('addDoctorModal')?.classList.add('active');
  window.closeAddDoctor = () => document.getElementById('addDoctorModal')?.classList.remove('active');
  window.deleteDoctor = async (id, name) => { if (confirm(`ต้องการลบ ${name} ?`)) { await apiDelete(`/doctors/${id}`); render(); } };

  window.editDoctor = async (id) => {
    try {
      const doc = await apiGet(`/doctors/${id}`);
      document.getElementById('editDocId').value = doc.id;
      document.getElementById('editDocName').value = doc.name || '';
      document.getElementById('editDocEmail').value = doc.email || '';
      document.getElementById('editDocDept').value = doc.dept || '';
      document.getElementById('editDocPosition').value = doc.position || '';
      document.getElementById('editDocSpecialty').value = doc.specialty || '';
      document.getElementById('editDocLicense').value = doc.license || '';
      document.getElementById('editDocPhone').value = doc.phone || '';
      document.getElementById('editDocStatus').value = doc.status || 'active';
      document.getElementById('editDoctorModal')?.classList.add('active');
    } catch (err) {
      alert('Could not load doctor details: ' + err.message);
    }
  };

  window.closeEditDoctor = () => document.getElementById('editDoctorModal')?.classList.remove('active');
});
