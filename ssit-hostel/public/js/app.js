// SSIT Rajagruha Hostel Portal - Client Application

const API = '';  // same-origin Node.js server
const ADMIN = { username: 'admin', password: 'Admin@SSIT123' };

let currentStudent = null;
let allStudents = [];
let selectedRoom = null;
let occupiedRooms = new Set();

// Particles Background
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1
    };
  }

  resize();
  for (let i = 0; i < 90; i++) particles.push(mkParticle());
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// Utility helpers
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function setMsg(id, msg, type = 'success') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-msg ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'form-msg'; }, 4000);
}

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  return res.json();
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generatePassword(name, dob) {
  const first3 = name.substring(0, 3).toUpperCase();
  const parts  = dob.split('-');   // YYYY-MM-DD
  const fmt    = parts[2] + parts[1] + parts[0].substring(2);
  return first3 + fmt;
}

// Authentication & Login flow
function togglePass() {
  const inp  = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    inp.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

async function doLogin() {
  const usn  = document.getElementById('loginUsn').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!usn || !pass) { errEl.textContent = 'Please fill in both fields.'; return; }

  // Admin login
  if (usn === ADMIN.username && pass === ADMIN.password) {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('adminShell').classList.remove('hidden');
    loadAdminDashboard();
    return;
  }

  // Student login
  try {
    const student = await api('/api/login', 'POST', { usn });
    if (!student) { errEl.textContent = 'Student not found.'; return; }
    const expected = generatePassword(student.name, student.dob);
    if (pass !== expected) { errEl.textContent = 'Incorrect password.'; return; }

    currentStudent = student;
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('studentShell').classList.remove('hidden');

    document.getElementById('stuHeroName').textContent = student.name;
    document.getElementById('stuHeroUsn').textContent  = student.usn + ' • ' + (student.branch || '') + ' Yr' + (student.year || '');
    renderProfileDetails();
  } catch (e) {
    errEl.textContent = 'Server error. Please try again.';
  }
}

// Theme Management (Light/Dark mode)
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const isLight = html.getAttribute('data-theme') === 'light';
  
  if (isLight) {
    html.setAttribute('data-theme', 'dark');
    icon.className = 'fas fa-moon';
    localStorage.setItem('theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    icon.className = 'fas fa-sun';
    localStorage.setItem('theme', 'light');
  }
}

// Load saved theme
(function() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  window.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
  });
})();

function doLogout() {
  currentStudent = null;
  selectedRoom   = null;
  document.getElementById('loginUsn').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('adminShell').classList.add('hidden');
  document.getElementById('studentShell').classList.add('hidden');
  document.getElementById('loginPage').classList.add('active');
}

document.getElementById('loginPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// Responsive Sidebar Toggle
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mob-open');
  } else {
    sb.classList.toggle('collapsed');
  }
}

// Admin View & Navigation Panel
const PAGE_TITLES = {
  adminDashboard:    'Dashboard',
  addStudentPage:    'Add Student',
  viewStudentsPage:  'All Students',
  roomStatusPage:    'Room Status',
  leaveAdminPage:    'Leave Applications',
  noticeAdminPage:   'Notices',
  penaltyAdminPage:  'Penalties',
  complaintsAdminPage: 'Complaints',
  feedbackAdminPage: 'Feedback',
  messAdminPage:     'Mess Menu'
};

function adminNav(linkEl, pageId) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  if (linkEl) linkEl.classList.add('active');
  document.getElementById('adminPageTitle').textContent = PAGE_TITLES[pageId] || '';

  // Load data
  if (pageId === 'adminDashboard')    loadAdminDashboard();
  if (pageId === 'viewStudentsPage')  loadStudentsTable();
  if (pageId === 'roomStatusPage')    loadAdminRooms();
  if (pageId === 'leaveAdminPage')    loadLeavesTable();
  if (pageId === 'noticeAdminPage')   loadNoticesAdmin();
  if (pageId === 'penaltyAdminPage')  loadPenaltiesAdmin();
  if (pageId === 'complaintsAdminPage') loadComplaintsAdmin();
  if (pageId === 'feedbackAdminPage') loadFeedbackAdmin();
  if (pageId === 'messAdminPage')     loadMessAdmin();
}

// Admin Dashboard stats & recent activity
async function loadAdminDashboard() {
  try {
    const [students, leaves, complaints, notices] = await Promise.all([
      api('/api/students'),
      api('/api/leaves'),
      api('/api/complaints'),
      api('/api/notices')
    ]);

    allStudents = students || [];
    occupiedRooms = new Set(allStudents.filter(s => s.room).map(s => String(s.room)));

    document.getElementById('statStudents').textContent  = allStudents.length;
    document.getElementById('statRooms').textContent     = occupiedRooms.size;
    document.getElementById('statLeaves').textContent    = (leaves || []).filter(l => l.status === 'Pending').length;
    document.getElementById('statComplaints').textContent = (complaints || []).length;

    const dashN = document.getElementById('dashNotices');
    dashN.innerHTML = (notices || []).slice(0, 5).map(n =>
      `<div class="dash-item">📢 ${n.message} <br><small>${fmtDate(n.created_at)}</small></div>`
    ).join('') || '<div class="dash-item">No notices</div>';

    const dashL = document.getElementById('dashLeaves');
    dashL.innerHTML = (leaves || []).filter(l => l.status === 'Pending').slice(0, 5).map(l =>
      `<div class="dash-item">📋 ${l.usn} — ${fmtDate(l.from_date)} to ${fmtDate(l.to_date)}</div>`
    ).join('') || '<div class="dash-item">No pending leaves</div>';

  } catch (e) { console.error(e); }
}

// Register new student
async function addStudent() {
  const name    = document.getElementById('sName').value.trim();
  const usn     = document.getElementById('sUsn').value.trim();
  const branch  = document.getElementById('sBranch').value;
  const year    = document.getElementById('sYear').value;
  const dob     = document.getElementById('sDob').value;
  const phone   = document.getElementById('sPhone').value.trim();
  const email   = document.getElementById('sEmail').value.trim();
  const address = document.getElementById('sAddress').value.trim();

  if (!name || !usn || !dob) { setMsg('addStudentMsg', 'Name, USN and DOB are required.', 'error'); return; }

  try {
    const res = await api('/api/students', 'POST', { name, usn, branch, year, dob, phone, email, address });
    if (res.error) { setMsg('addStudentMsg', 'Error: ' + res.error, 'error'); return; }
    setMsg('addStudentMsg', `✅ Student ${name} added! Password: ${generatePassword(name, dob)}`, 'success');
    ['sName','sUsn','sPhone','sEmail','sAddress'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('sDob').value = '';
  } catch (e) {
    setMsg('addStudentMsg', 'Server error.', 'error');
  }
}

// Fetch and render students directory
let studentsCache = [];

async function loadStudentsTable() {
  try {
    studentsCache = await api('/api/students');
    allStudents = studentsCache;
    renderStudentsTable(studentsCache);
  } catch (e) { console.error(e); }
}

function renderStudentsTable(data) {
  document.getElementById('studentCount').textContent = `${data.length} students`;
  const tbody = document.getElementById('studentsBody');
  tbody.innerHTML = data.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td style="font-family:monospace;font-size:0.85rem">${s.usn}</td>
      <td>${s.branch || '—'}</td>
      <td>${s.year || '—'}</td>
      <td>${s.room || '—'}</td>
      <td>₹${s.fees ?? 0}</td>
      <td>₹${s.penalty ?? 0}</td>
      <td><span class="badge ${s.room_locked ? 'badge-approved' : 'badge-pending'}">${s.room_locked ? 'Paid' : 'Pending'}</span></td>
    </tr>
  `).join('');
}

function filterStudents() {
  const q = document.getElementById('studentSearch').value.toLowerCase();
  const filtered = studentsCache.filter(s =>
    s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)
  );
  renderStudentsTable(filtered);
}

// Render hostel room allocation matrix for Admin
async function loadAdminRooms() {
  if (!allStudents.length) allStudents = await api('/api/students');
  occupiedRooms = new Set(allStudents.filter(s => s.room).map(s => String(s.room)));
  const grid = document.getElementById('adminRoomGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 120; i++) {
    const occ = occupiedRooms.has(String(i));
    const tile = document.createElement('div');
    tile.className = 'room-tile ' + (occ ? 'occ' : 'free');
    const student = allStudents.find(s => String(s.room) === String(i));
    tile.innerHTML = `<div>${i}</div>${occ ? `<div style="font-size:0.65rem;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${student?.name?.split(' ')[0] || ''}</div>` : ''}`;
    if (occ) tile.title = student ? `${student.name} (${student.usn})` : '';
    grid.appendChild(tile);
  }
}

// Leaves review and updates
async function loadLeavesTable() {
  const leaves = await api('/api/leaves');
  const tbody = document.getElementById('leavesBody');
  tbody.innerHTML = (leaves || []).map(l => `
    <tr>
      <td>${l.usn}</td>
      <td>${l.room || '—'}</td>
      <td>${fmtDate(l.from_date)}</td>
      <td>${fmtDate(l.to_date)}</td>
      <td style="max-width:200px">${l.reason || '—'}</td>
      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
      <td>
        ${l.status === 'Pending' ? `
          <button class="btn-sm btn-approve" onclick="updateLeave(${l.id},'Approved')">✓ Approve</button>
          <button class="btn-sm btn-reject"  onclick="updateLeave(${l.id},'Rejected')">✗ Reject</button>
        ` : '—'}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text2)">No leave applications</td></tr>';
}

async function updateLeave(id, status) {
  await api(`/api/leaves/${id}`, 'PATCH', { status });
  showToast(`Leave ${status}`, status === 'Approved' ? 'success' : 'error');
  loadLeavesTable();
}

// Notice board alerts management
async function loadNoticesAdmin() {
  const notices = await api('/api/notices');
  const list = document.getElementById('noticesList');
  list.innerHTML = (notices || []).map(n => `
    <div class="notice-item">
      <div class="flex-1">
        <div class="notice-text">${n.message}</div>
        <div class="notice-date">${fmtDate(n.created_at)}</div>
      </div>
      <button class="notice-del" onclick="deleteNotice(${n.id})"><i class="fas fa-trash"></i></button>
    </div>
  `).join('') || '<p style="color:var(--text2);padding:1rem">No notices posted</p>';
}

async function postNotice() {
  const msg = document.getElementById('noticeText').value.trim();
  if (!msg) return;
  await api('/api/notices', 'POST', { message: msg });
  document.getElementById('noticeText').value = '';
  showToast('Notice posted!', 'success');
  loadNoticesAdmin();
}

async function deleteNotice(id) {
  if (!confirm('Delete this notice?')) return;
  await api(`/api/notices/${id}`, 'DELETE');
  showToast('Notice deleted');
  loadNoticesAdmin();
}

// Levy penalties on specific rooms/students
async function loadPenaltiesAdmin() {
  const penalties = await api('/api/penalties');
  const tbody = document.getElementById('penaltiesBody');
  tbody.innerHTML = (penalties || []).map(p => `
    <tr>
      <td>${p.usn}</td>
      <td>₹${p.amount}</td>
      <td>${fmtDate(p.deadline)}</td>
      <td>${fmtDate(p.created_at)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text2)">No penalties</td></tr>';
}

async function chargePenalty() {
  const room   = document.getElementById('pRoom').value.trim();
  const amount = document.getElementById('pAmount').value;
  const date   = document.getElementById('pDate').value;

  if (!room || !amount || !date) { setMsg('penaltyMsg', 'All fields required.', 'error'); return; }

  if (!allStudents.length) allStudents = await api('/api/students');
  const targets = allStudents.filter(s => String(s.room) === room);

  if (!targets.length) { setMsg('penaltyMsg', 'No students found in room ' + room, 'error'); return; }

  for (const s of targets) {
    await api('/api/penalties', 'POST', { usn: s.usn, amount, deadline: date });
  }
  setMsg('penaltyMsg', `✅ Penalty applied to ${targets.length} student(s) in room ${room}`, 'success');
  document.getElementById('pRoom').value = '';
  document.getElementById('pAmount').value = '';
  loadPenaltiesAdmin();
}

// View complaints log
async function loadComplaintsAdmin() {
  const complaints = await api('/api/complaints');
  const tbody = document.getElementById('complaintsBody');
  tbody.innerHTML = (complaints || []).map(c => `
    <tr>
      <td>${c.usn}</td>
      <td>${c.room || '—'}</td>
      <td style="max-width:300px">${c.text}</td>
      <td>${fmtDate(c.created_at)}</td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text2)">No complaints</td></tr>';
}

// Feedback board review
async function loadFeedbackAdmin() {
  const feedback = await api('/api/feedback');
  const grid = document.getElementById('feedbackCards');
  grid.innerHTML = (feedback || []).map(f => `
    <div class="feedback-card">
      <div class="fb-usn"><i class="fas fa-user"></i> ${f.usn}</div>
      <div class="fb-text">${f.text}</div>
      <div class="fb-date">${fmtDate(f.created_at)}</div>
    </div>
  `).join('') || '<p style="color:var(--text2)">No feedback submitted</p>';
}

// Update and display Mess Schedule
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

async function loadMessAdmin() {
  const menu = await api('/api/mess');
  const tbody = document.getElementById('messBody');
  tbody.innerHTML = DAYS.map(day => {
    const item = (menu || []).find(m => m.day === day) || {};
    return `<tr>
      <td><strong>${day}</strong></td>
      <td><input id="m_${day}_b" value="${item.breakfast || ''}"></td>
      <td><input id="m_${day}_l" value="${item.lunch || ''}"></td>
      <td><input id="m_${day}_s" value="${item.snacks || ''}"></td>
      <td><input id="m_${day}_d" value="${item.dinner || ''}"></td>
    </tr>`;
  }).join('');
}

async function saveMess() {
  const menu = DAYS.map((day, i) => ({
    day,
    day_order: i + 1,
    breakfast: document.getElementById(`m_${day}_b`).value,
    lunch:     document.getElementById(`m_${day}_l`).value,
    snacks:    document.getElementById(`m_${day}_s`).value,
    dinner:    document.getElementById(`m_${day}_d`).value
  }));
  await api('/api/mess', 'POST', { menu });
  setMsg('messMsg', '✅ Mess menu saved!', 'success');
}

// Student View & Mobile Navigation
function stuNav(linkEl, pageId) {
  document.querySelectorAll('.stu-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sn-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  if (linkEl) linkEl.classList.add('active');
  else {
    // highlight matching bottom nav
    const map = { stuHome:'stuHome', stuDashboard:'stuDashboard', stuRoom:'stuRoom', stuLeave:'stuLeave' };
    document.querySelectorAll('.sn-link').forEach(l => {
      if (l.getAttribute('onclick') && l.getAttribute('onclick').includes(pageId)) l.classList.add('active');
    });
  }

  // Load data for each page
  if (pageId === 'stuRoom')      loadStudentRooms();
  if (pageId === 'stuNotices')   loadStudentNotices();
  if (pageId === 'stuMess')      loadStudentMess();
  if (pageId === 'stuFees')      renderFeesPage();
  if (pageId === 'stuLeave')     loadStudentLeaveHistory();
  if (pageId === 'stuPenalty')   loadStudentPenalties();
}

// Display Student profile data
function renderProfileDetails() {
  const s = currentStudent;
  document.getElementById('profileDetails').innerHTML = `
    <div class="profile-row"><span class="pkey">Name</span><span class="pval">${s.name}</span></div>
    <div class="profile-row"><span class="pkey">USN</span><span class="pval">${s.usn}</span></div>
    <div class="profile-row"><span class="pkey">Branch</span><span class="pval">${s.branch || '—'}</span></div>
    <div class="profile-row"><span class="pkey">Year</span><span class="pval">${s.year || '—'}</span></div>
    <div class="profile-row"><span class="pkey">DOB</span><span class="pval">${fmtDate(s.dob)}</span></div>
    <div class="profile-row"><span class="pkey">Phone</span><span class="pval">${s.phone || '—'}</span></div>
    <div class="profile-row"><span class="pkey">Email</span><span class="pval">${s.email || '—'}</span></div>
    <div class="profile-row"><span class="pkey">Room</span><span class="pval">${s.room || 'Not booked'}</span></div>
    <div class="profile-row"><span class="pkey">Fees Due</span><span class="pval" style="color:${s.fees > 0 ? 'var(--danger)' : 'var(--success)'}">₹${s.fees ?? 0}</span></div>
    <div class="profile-row"><span class="pkey">Address</span><span class="pval">${s.address || '—'}</span></div>
  `;
}

// Load and select room for students
async function loadStudentRooms() {
  if (currentStudent.room_locked) {
    document.getElementById('roomLockedMsg').classList.remove('hidden');
    document.getElementById('roomBookingArea').style.display = 'none';
    return;
  }

  if (!allStudents.length) allStudents = await api('/api/students');
  occupiedRooms = new Set(allStudents.filter(s => s.room).map(s => String(s.room)));

  const grid = document.getElementById('stuRoomGrid');
  grid.innerHTML = '';
  for (let i = 1; i <= 120; i++) {
    const tile = document.createElement('div');
    const taken = occupiedRooms.has(String(i));
    tile.className = 'stu-room-tile' + (taken ? ' taken' : '');
    tile.textContent = i;
    if (!taken) {
      tile.onclick = () => selectRoom(i, tile);
    }
    grid.appendChild(tile);
  }
}

function selectRoom(num, tile) {
  selectedRoom = num;
  document.querySelectorAll('.stu-room-tile').forEach(t => t.classList.remove('selected'));
  tile.classList.add('selected');
  document.getElementById('selectedRoomNum').textContent = num;
  document.getElementById('selectedRoomInfo').classList.remove('hidden');
}

async function bookRoom() {
  if (!selectedRoom) return;
  try {
    const res = await api('/api/update-room', 'POST', { usn: currentStudent.usn, room: selectedRoom });
    if (res && res.error) {
      showToast('Error: ' + res.error, 'error');
      return;
    }
    currentStudent.room = selectedRoom;
    showToast('Room ' + selectedRoom + ' booked! Proceed to payment.', 'success');
    stuNav(null, 'stuFees');
  } catch (e) {
    showToast('Server error. Please try again.', 'error');
  }
}

// Hostel Fees details and payment simulation
function renderFeesPage() {
  const container = document.getElementById('feesContent');
  if (currentStudent.fees > 0) {
    container.innerHTML = `
      <div class="fees-due">Hostel Fees Due</div>
      <div class="fees-amount">₹${currentStudent.fees}</div>
      <p style="color:var(--text2);font-size:0.85rem;margin-bottom:1.5rem">Room: ${currentStudent.room || 'Not booked'}</p>
      <button class="btn-primary" onclick="payFees()"><i class="fas fa-credit-card"></i> Pay Now (Simulated)</button>
    `;
  } else {
    container.innerHTML = `
      <i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);margin-bottom:1rem"></i>
      <div style="font-size:1.1rem;font-weight:600;color:var(--success)">All fees paid!</div>
      <p style="color:var(--text2);font-size:0.85rem;margin-top:8px">Room ${currentStudent.room} is confirmed.</p>
    `;
  }
}

async function payFees() {
  try {
    const res = await api('/api/update-payment', 'POST', { usn: currentStudent.usn });
    if (res && res.error) {
      showToast('Error: ' + res.error, 'error');
      return;
    }
    currentStudent.fees = 0;
    currentStudent.room_locked = true;
    showToast('Payment successful! Room confirmed.', 'success');
    renderFeesPage();
    renderProfileDetails();
  } catch (e) {
    showToast('Server error. Please try again.', 'error');
  }
}

// Student leave applications submission & history
async function applyLeave() {
  const from   = document.getElementById('leaveFrom').value;
  const to     = document.getElementById('leaveTo').value;
  const reason = document.getElementById('leaveReason').value.trim();

  if (!from || !to || !reason) { setMsg('leaveMsg', 'All fields required.', 'error'); return; }
  try {
    const res = await api('/api/leaves', 'POST', { usn: currentStudent.usn, room: currentStudent.room, from_date: from, to_date: to, reason });
    if (res && res.error) {
      setMsg('leaveMsg', 'Error: ' + res.error, 'error');
      return;
    }
    setMsg('leaveMsg', '✅ Leave application submitted!', 'success');
    document.getElementById('leaveFrom').value = '';
    document.getElementById('leaveTo').value   = '';
    document.getElementById('leaveReason').value = '';
    loadStudentLeaveHistory();
  } catch (e) {
    setMsg('leaveMsg', 'Server error. Please try again.', 'error');
  }
}

async function loadStudentLeaveHistory() {
  const leaves = await api('/api/leaves');
  const myLeaves = (leaves || []).filter(l => l.usn === currentStudent.usn);
  const container = document.getElementById('stuLeaveHistory');
  container.innerHTML = myLeaves.map(l => `
    <div class="leave-item">
      <div class="li-row">
        <span style="font-weight:600">Leave Application</span>
        <span class="badge badge-${l.status.toLowerCase()}">${l.status}</span>
      </div>
      <div class="li-dates">📅 ${fmtDate(l.from_date)} → ${fmtDate(l.to_date)}</div>
      <div class="li-reason">📝 ${l.reason}</div>
    </div>
  `).join('') || '<p style="color:var(--text2);font-size:0.88rem">No leave applications yet.</p>';
}

// Render administrative announcements
async function loadStudentNotices() {
  const notices = await api('/api/notices');
  const list = document.getElementById('stuNoticesList');
  list.innerHTML = (notices || []).map(n => `
    <div class="notice-item">
      <div>
        <div class="notice-text">${n.message}</div>
        <div class="notice-date">${fmtDate(n.created_at)}</div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--text2);padding:1rem">No notices at this time.</p>';
}

// Mess Menu schedule view
async function loadStudentMess() {
  const menu = await api('/api/mess');
  const grid = document.getElementById('stuMessGrid');
  grid.innerHTML = (menu || []).map(m => `
    <div class="mess-day-card">
      <div class="mess-day-header">📅 ${m.day}</div>
      <div class="mess-day-body">
        <div class="mess-meal"><div class="mess-meal-label">Breakfast</div><div class="mess-meal-val">${m.breakfast || '—'}</div></div>
        <div class="mess-meal"><div class="mess-meal-label">Lunch</div><div class="mess-meal-val">${m.lunch || '—'}</div></div>
        <div class="mess-meal"><div class="mess-meal-label">Snacks</div><div class="mess-meal-val">${m.snacks || '—'}</div></div>
        <div class="mess-meal"><div class="mess-meal-label">Dinner</div><div class="mess-meal-val">${m.dinner || '—'}</div></div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--text2)">Mess menu not available.</p>';
}

// Student grievances submission
async function submitComplaint() {
  const text = document.getElementById('complaintText').value.trim();
  if (!text) { setMsg('complaintMsg', 'Please describe your complaint.', 'error'); return; }
  try {
    const res = await api('/api/complaints', 'POST', { usn: currentStudent.usn, room: currentStudent.room, text });
    if (res && res.error) {
      setMsg('complaintMsg', 'Error: ' + res.error, 'error');
      return;
    }
    setMsg('complaintMsg', '✅ Complaint submitted successfully.', 'success');
    document.getElementById('complaintText').value = '';
  } catch (e) {
    setMsg('complaintMsg', 'Server error. Please try again.', 'error');
  }
}

// Feedback submission
async function submitFeedback() {
  const text = document.getElementById('feedbackText').value.trim();
  if (!text) { setMsg('feedbackMsg', 'Please enter your feedback.', 'error'); return; }
  try {
    const res = await api('/api/feedback', 'POST', { usn: currentStudent.usn, text });
    if (res && res.error) {
      setMsg('feedbackMsg', 'Error: ' + res.error, 'error');
      return;
    }
    setMsg('feedbackMsg', '✅ Thank you for your feedback!', 'success');
    document.getElementById('feedbackText').value = '';
  } catch (e) {
    setMsg('feedbackMsg', 'Server error. Please try again.', 'error');
  }
}

// Penalty check and deadlines
async function loadStudentPenalties() {
  const penalties = await api('/api/penalties');
  const mine = (penalties || []).filter(p => p.usn === currentStudent.usn);
  const list = document.getElementById('stuPenaltiesList');
  list.innerHTML = mine.map(p => `
    <div class="penalty-item">
      <div>
        <div class="penalty-amount">₹${p.amount}</div>
        <div class="penalty-deadline">Deadline: ${fmtDate(p.deadline)}</div>
      </div>
      <i class="fas fa-gavel" style="color:var(--danger);font-size:1.5rem"></i>
    </div>
  `).join('') || '<p style="color:var(--text2);font-size:0.88rem">No penalties charged.</p>';
}

// Application Initialization
window.addEventListener('DOMContentLoaded', () => {
  // Preload students list silently
  api('/api/students').then(data => { allStudents = data || []; });
});
