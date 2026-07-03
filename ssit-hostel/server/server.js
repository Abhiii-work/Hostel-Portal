const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Supabase config
const SUPABASE_URL = 'https://fnholegxpuulgtbntjtq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaG9sZWd4cHV1bGd0Ym50anRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Njk3OTcsImV4cCI6MjA5MjQ0NTc5N30.6oKDy0_24KDfFDpOTYIyxIDx39qBLlcwIG4-BoBNkQ8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Authentication
app.post('/api/login', async (req, res) => {
  const { usn } = req.body;
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('usn', usn)
    .single();
  if (error || !data) return res.json(null);
  res.json(data);
});

// Student Management
app.get('/api/students', async (req, res) => {
  const { data, error } = await supabase.from('students').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/students', async (req, res) => {
  const { name, usn, branch, address, dob, email, phone, year } = req.body;
  const { data, error } = await supabase.from('students').insert([
    { name, usn, branch, address, dob, email, phone, year, room: null, fees: 55000, penalty: 0, room_locked: false }
  ]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

// Room Allotment
app.post('/api/update-room', async (req, res) => {
  const { usn, room } = req.body;
  const { error } = await supabase.from('students').update({ room }).eq('usn', usn);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post('/api/update-payment', async (req, res) => {
  const { usn } = req.body;
  const { error } = await supabase.from('students').update({ fees: 0, room_locked: true }).eq('usn', usn);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Leave Applications
app.get('/api/leaves', async (req, res) => {
  const { data, error } = await supabase.from('leaves').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/leaves', async (req, res) => {
  const { usn, room, from_date, to_date, reason } = req.body;
  const { error } = await supabase.from('leaves').insert([{ usn, room, from_date, to_date, reason, status: 'Pending' }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.patch('/api/leaves/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { error } = await supabase.from('leaves').update({ status }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Notice Board
app.get('/api/notices', async (req, res) => {
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/notices', async (req, res) => {
  const { message } = req.body;
  const { error } = await supabase.from('notices').insert([{ message }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.delete('/api/notices/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Complaints
app.get('/api/complaints', async (req, res) => {
  const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/complaints', async (req, res) => {
  const { usn, room, text } = req.body;
  const { error } = await supabase.from('complaints').insert([{ usn, room, text }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Feedback
app.get('/api/feedback', async (req, res) => {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/feedback', async (req, res) => {
  const { usn, text } = req.body;
  const { error } = await supabase.from('feedback').insert([{ usn, text }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Penalties
app.get('/api/penalties', async (req, res) => {
  const { data, error } = await supabase.from('penalties').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/penalties', async (req, res) => {
  const { usn, amount, deadline } = req.body;
  const { error } = await supabase.from('penalties').insert([{ usn, amount, deadline }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Mess Menu
app.get('/api/mess', async (req, res) => {
  const { data, error } = await supabase.from('mess_menu').select('*').order('day_order');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/mess', async (req, res) => {
  const { menu } = req.body;
  // Upsert all 7 days
  const { error } = await supabase.from('mess_menu').upsert(menu, { onConflict: 'day' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hostel Portal running at http://localhost:${PORT}`));
