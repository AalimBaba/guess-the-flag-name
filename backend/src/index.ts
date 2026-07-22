import express, { Request, Response } from 'express';
import path from 'path';
import { readFileSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Path to countries data file (relative to the project root)
const countriesDataPath = path.join(__dirname, '../../countries.json');

// Load countries data
let countries: { name: string; flag: string }[] = [];
try {
  const data = readFileSync(countriesDataPath, 'utf8');
  countries = JSON.parse(data);
  console.log(`Loaded ${countries.length} countries from ${countriesDataPath}`);
} catch (error) {
  console.error('Failed to load countries data:', error);
  // In a real app, you might want to exit or use a fallback
  countries = [];
}

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// GET /api/countries
app.get('/api/countries', (_req: Request, res: Response) => {
  res.json(countries);
});

// GET /api/daily-challenge
app.get('/api/daily-challenge', (_req: Request, res: Response) => {
  if (countries.length === 0) {
    return res.status(500).json({ error: 'No countries data available' });
  }
  // Use the current date to select a country (so it's the same for everyone on a given day)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % countries.length;
  const country = countries[index];
  res.json({
    name: country.name,
    flag: country.flag
  });
});

// In-memory leaderboard
interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  date: string; // ISO string
}
let leaderboard: LeaderboardEntry[] = [];
let nextId = 1;

// GET /api/leaderboard
app.get('/api/leaderboard', (_req: Request, res: Response) => {
  // Sort by score descending, then by date ascending (earlier date first)
  const sorted = [...leaderboard].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  res.json(sorted);
});

// POST /api/leaderboard
app.post('/api/leaderboard', (req: Request, res: Response) => {
  const { name, score } = req.body;
  if (typeof name !== 'string' || typeof score !== 'number' || !isFinite(score) || score < 0) {
    return res.status(400).json({ error: 'Invalid input: name (string) and score (non-negative number) required' });
  }
  const newEntry: LeaderboardEntry = {
    id: nextId++,
    name,
    score,
    date: new Date().toISOString()
  };
  leaderboard.push(newEntry);
  res.status(201).json(newEntry);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
