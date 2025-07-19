const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const countries = require('./data/countries.json');
const usersFile = path.join(__dirname, 'data', 'users.json');
const JWT_SECRET = 'your-secret-key'; // Replace with a secure key in production

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    let users = [];
    try {
      const data = await fs.readFile(usersFile, 'utf8');
      users = JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('users.json not found, creating new file');
        await fs.writeFile(usersFile, JSON.stringify([]));
      } else {
        console.error('Error reading users.json:', err);
        return res.status(500).json({ error: 'Server error reading users.json' });
      }
    }
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    users.push({ username, password, gameHistory: [] });
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    console.log(`Registered user: ${username}`);
    res.json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error in /api/login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get flags (protected)
app.get('/api/flags', verifyToken, (req, res) => {
  res.json(countries);
});

// Save game result
app.post('/api/game-result', verifyToken, async (req, res) => {
  const { score, correct, wrong, timeTaken } = req.body;
  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.gameHistory.push({ score, correct, wrong, timeTaken, date: new Date() });
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
    res.json({ message: 'Game result saved' });
  } catch (err) {
    console.error('Error in /api/game-result:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    const user = users.find(u => u.username === req.user.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ username: user.username, gameHistory: user.gameHistory });
  } catch (err) {
    console.error('Error in /api/profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});