-- ============================================================
--  SSIT RAJAGRUHA HOSTEL PORTAL — Supabase Database Setup
--  Run this entire script in Supabase → SQL Editor → New Query
-- ============================================================

-- 1. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  usn         TEXT UNIQUE NOT NULL,
  branch      TEXT,
  address     TEXT,
  dob         DATE,
  email       TEXT,
  phone       TEXT,
  year        INT,
  room        TEXT,
  fees        NUMERIC DEFAULT 55000,
  penalty     NUMERIC DEFAULT 0,
  room_locked BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEAVES
CREATE TABLE IF NOT EXISTS leaves (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  room        TEXT,
  from_date   DATE,
  to_date     DATE,
  reason      TEXT,
  status      TEXT DEFAULT 'Pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NOTICES
CREATE TABLE IF NOT EXISTS notices (
  id          BIGSERIAL PRIMARY KEY,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  room        TEXT,
  text        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  text        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PENALTIES
CREATE TABLE IF NOT EXISTS penalties (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  amount      NUMERIC,
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESS MENU
CREATE TABLE IF NOT EXISTS mess_menu (
  id          BIGSERIAL PRIMARY KEY,
  day         TEXT UNIQUE NOT NULL,
  day_order   INT,
  breakfast   TEXT DEFAULT '',
  lunch       TEXT DEFAULT '',
  snacks      TEXT DEFAULT '',
  dinner      TEXT DEFAULT ''
);

-- Seed default mess days
INSERT INTO mess_menu (day, day_order, breakfast, lunch, snacks, dinner) VALUES
  ('Monday',    1, 'Idli Sambar',    'Rice Dal Sabzi',  'Tea Biscuits',     'Chapati Paneer'),
  ('Tuesday',   2, 'Poha Upma',      'Rajma Rice',      'Samosa',           'Rice Dal Fry'),
  ('Wednesday', 3, 'Dosa Chutney',   'Chole Rice',      'Bread Butter',     'Veg Pulao'),
  ('Thursday',  4, 'Paratha Curd',   'Dal Tadka Rice',  'Vada Pav',         'Chapati Mix Veg'),
  ('Friday',    5, 'Rava Idli',      'Biryani Raita',   'Pakoda Tea',       'Puri Bhaji'),
  ('Saturday',  6, 'Aloo Paratha',   'Palak Paneer',    'Fruit Salad',      'Fried Rice'),
  ('Sunday',    7, 'Puri Halwa',     'Special Thali',   'Ice Cream',        'Noodles Soup')
ON CONFLICT (day) DO NOTHING;

-- ============================================================
--  DISABLE RLS for easy dev (enable & add policies in prod)
-- ============================================================
ALTER TABLE students   DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves     DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices    DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback   DISABLE ROW LEVEL SECURITY;
ALTER TABLE penalties  DISABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu  DISABLE ROW LEVEL SECURITY;

-- Done! ✅
SELECT 'Database setup complete! 🏨' AS status;
