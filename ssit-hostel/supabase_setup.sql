-- SSIT Rajagruha Hostel Portal - Supabase Database Schema Setup

-- Students Table
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

-- Leaves Table
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

-- Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id          BIGSERIAL PRIMARY KEY,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  room        TEXT,
  text        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  text        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Penalties Table
CREATE TABLE IF NOT EXISTS penalties (
  id          BIGSERIAL PRIMARY KEY,
  usn         TEXT NOT NULL,
  amount      NUMERIC,
  deadline    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Mess Menu Table
CREATE TABLE IF NOT EXISTS mess_menu (
  id          BIGSERIAL PRIMARY KEY,
  day         TEXT UNIQUE NOT NULL,
  day_order   INT,
  breakfast   TEXT DEFAULT '',
  lunch       TEXT DEFAULT '',
  snacks      TEXT DEFAULT '',
  dinner      TEXT DEFAULT ''
);

-- Seed default weekly menu
INSERT INTO mess_menu (day, day_order, breakfast, lunch, snacks, dinner) VALUES
  ('Monday',    1, 'Idli Sambar',    'Rice Dal Sabzi',  'Tea Biscuits',     'Chapati Paneer'),
  ('Tuesday',   2, 'Poha Upma',      'Rajma Rice',      'Samosa',           'Rice Dal Fry'),
  ('Wednesday', 3, 'Dosa Chutney',   'Chole Rice',      'Bread Butter',     'Veg Pulao'),
  ('Thursday',  4, 'Paratha Curd',   'Dal Tadka Rice',  'Vada Pav',         'Chapati Mix Veg'),
  ('Friday',    5, 'Rava Idli',      'Biryani Raita',   'Pakoda Tea',       'Puri Bhaji'),
  ('Saturday',  6, 'Aloo Paratha',   'Palak Paneer',    'Fruit Salad',      'Fried Rice'),
  ('Sunday',    7, 'Puri Halwa',     'Special Thali',   'Ice Cream',        'Noodles Soup')
ON CONFLICT (day) DO NOTHING;

-- Disable RLS for development environment
ALTER TABLE students   DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves     DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices    DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback   DISABLE ROW LEVEL SECURITY;
ALTER TABLE penalties  DISABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu  DISABLE ROW LEVEL SECURITY;

-- Setup complete
SELECT 'Database setup complete! 🏨' AS status;
