# 🏨 SSIT Rajagruha Hostel Portal v2.0
### Node.js + Supabase — No XAMPP Required

---

## 📋 What's Inside

```
ssit-hostel/
├── server/
│   └── server.js          ← Node.js Express API (all routes)
├── public/
│   ├── index.html         ← Single-page app (Login + Admin + Student)
│   ├── css/style.css      ← Full aesthetic CSS (Navy + Gold + Teal)
│   ├── js/app.js          ← All client-side logic
│   └── assets/
│       ├── logo.png        ← SSIT logo
│       └── rajgruha.jpg    ← Hostel photo
├── supabase_setup.sql     ← Run this ONCE in Supabase SQL Editor
├── package.json
└── README.md
```

---

## 🗄️ STEP 1 — Set Up Supabase Database

1. Go to → https://supabase.com and log in
2. Open your project: **fnholegxpuulgtbntjtq**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase_setup.sql` from this folder
6. Copy ALL the content and paste it into the SQL Editor
7. Click **Run** (green button)
8. You should see: `Database setup complete! 🏨`

> ✅ This creates all 7 tables: students, leaves, notices, complaints, feedback, penalties, mess_menu

---

## 💻 STEP 2 — Install Node.js (if not installed)

1. Go to → https://nodejs.org
2. Download **LTS version** (e.g., v20.x)
3. Install it (Next → Next → Finish)
4. Verify: open terminal and run:
   ```
   node --version
   npm --version
   ```
   Both should print version numbers.

---

## 📦 STEP 3 — Install Project Dependencies

1. Open a terminal / command prompt
2. Navigate to the project folder:
   ```
   cd path/to/ssit-hostel
   ```
   Example on Windows:
   ```
   cd C:\Users\YourName\Downloads\ssit-hostel
   ```
3. Run:
   ```
   npm install
   ```
   This installs: express, @supabase/supabase-js, cors, nodemon

---

## 🚀 STEP 4 — Start the Server

```bash
npm start
```

You will see:
```
🏨 SSIT Hostel Portal running at http://localhost:3000
```

---

## 🌐 STEP 5 — Open the Portal

Open your browser and go to:
```
http://localhost:3000
```

---

## 🔐 Login Credentials

### Admin Login
| Field    | Value          |
|----------|----------------|
| Username | `admin`        |
| Password | `Admin@SSIT123`|

### Student Login
| Field    | Value                                              |
|----------|----------------------------------------------------|
| Username | Student's USN (e.g., `1SI21CS001`)                 |
| Password | First 3 letters of name (CAPS) + DDMMYY of DOB    |

**Example:** Name = "Ravi Kumar", DOB = 2003-05-15
→ Password = `RAV150503`

---

## ✨ Features

### 🛡️ Admin Panel
- **Dashboard** — Live stats: total students, rooms occupied, pending leaves, complaints
- **Add Student** — Register new students with auto-generated password
- **All Students** — Searchable table with fees & room status
- **Room Status** — Visual grid of all 120 rooms (occupied/vacant)
- **Leave Applications** — Approve/Reject with one click
- **Post Notices** — Announce to all students, delete old ones
- **Charge Penalty** — Apply room-wise penalties with deadline
- **View Complaints** — All student complaints
- **View Feedback** — Card-style feedback display
- **Mess Menu** — Edit weekly breakfast/lunch/snacks/dinner

### 👨‍🎓 Student Portal
- **Profile** — Full personal details & status
- **Room Booking** — Visual 120-room grid, select & book
- **Fee Payment** — View dues, simulate payment
- **Apply Leave** — Submit with dates & reason, view history + status
- **Notices** — Real-time announcements from admin
- **Mess Menu** — Weekly meal schedule
- **Lodge Complaint** — Submit complaints to admin
- **Give Feedback** — Share experience
- **Penalties** — View charged penalties

---

## 🔄 Development Mode (Auto-Restart on Changes)

```bash
npm run dev
```

---

## 🌍 Deploy to Internet (Optional)

### Option A: Railway (Free)
1. Go to https://railway.app
2. Connect your GitHub repo
3. Add env variable: `PORT=3000`
4. Deploy!

### Option B: Render (Free)
1. Go to https://render.com
2. New → Web Service → Connect repo
3. Build: `npm install` | Start: `npm start`

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| Port 3000 in use | Change PORT in server.js line 122 |
| Login not working | Run the SQL setup script first |
| Students not showing | Check Supabase RLS is disabled (SQL script does this) |
| Blank screen | Check browser console (F12) for errors |

---

## 📞 Supabase Credentials Used
- **URL:** `https://fnholegxpuulgtbntjtq.supabase.co`
- **Key:** Stored in `server/server.js`

---

*Built for Sri Siddhartha Institute of Technology — Rajagruha Hostel* 🏛️
