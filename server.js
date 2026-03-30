const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { db, User, Task } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Auth middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Access denied. No token provided.' });
  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API',
    status: 'Running',
    endpoints: {
      health: '/health',
      register: '/api/register',
      login: '/api/login',
      tasks: '/api/tasks'
    }
  });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Tasks routes
app.get('/api/tasks', requireAuth, async (req, res) => {
  const tasks = await Task.findAll({ where: { userId: req.user.id } });
  res.json({ tasks, total: tasks.length });
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const task = await Task.create({ title, description, priority: priority || 'medium', userId: req.user.id });
  res.status(201).json({ message: 'Task created', task });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));