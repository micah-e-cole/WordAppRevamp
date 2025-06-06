const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Initialize database connection
const db = new sqlite3.Database(path.join(__dirname, 'data', 'randomWords.db'), err => {
  if (err) {
    console.error('❌ Failed to connect to the database:', err.message);
  } else {
    console.log('✅ Connected to the SQLite database.');
  }
});

// Parse JSON bodies
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API: Get a random word based on difficulty
app.get('/api/word', (req, res) => {
  const allowedDifficulties = ['Easy', 'Medium', 'Hard'];
  const difficulty = allowedDifficulties.includes(req.query.difficulty) ? req.query.difficulty : 'Easy';

  let minLen = 0;
  let maxLen = Infinity;

  if (difficulty === 'Easy') {
    maxLen = 5;
  } else if (difficulty === 'Medium') {
    minLen = 6;
    maxLen = 9;
  } else if (difficulty === 'Hard') {
    minLen = 10;
  }

  const sql = `
    SELECT word FROM words
    WHERE LENGTH(word) >= ? AND LENGTH(word) <= ?
    ORDER BY RANDOM()
    LIMIT 1
  `;

  db.get(sql, [minLen, maxLen], (err, row) => {
    if (err) {
      console.error('❌ DB Error:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'No word found for difficulty' });
    }
    res.json({ word: row.word });
  });
});

// SPA fallback route for index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).send('Not Found');
  }

  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      console.error(`❌ Error sending index.html for ${req.url}:`, err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`✅ Served index.html for ${req.url}`);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
