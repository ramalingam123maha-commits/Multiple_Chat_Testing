const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Setup multer for image uploads
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'book-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Initialize SQLite database
const db = new sqlite3.Database('./booktracker.db', (err) => {
  if (err) console.error('DB connection error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      coverImage TEXT,
      status TEXT DEFAULT 'To Read',
      rating INTEGER,
      dateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
      dateStarted DATETIME,
      dateFinished DATETIME
    )
  `);
});

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books ORDER BY dateAdded DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new book
app.post('/api/books', upload.single('coverImage'), (req, res) => {
  const { title, author } = req.body;
  const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  db.run(
    'INSERT INTO books (title, author, coverImage) VALUES (?, ?, ?)',
    [title, author, coverImage],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, title, author, coverImage, status: 'To Read' });
    }
  );
});

// Update book status
app.put('/api/books/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['To Read', 'Reading', 'Finished'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    `UPDATE books SET status = ?, dateStarted = CASE WHEN ? = 'Reading' AND dateStarted IS NULL THEN CURRENT_TIMESTAMP ELSE dateStarted END, dateFinished = CASE WHEN ? = 'Finished' AND dateFinished IS NULL THEN CURRENT_TIMESTAMP ELSE dateFinished END WHERE id = ?`,
    [status, status, status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id });
    }
  );
});

// Update book rating
app.put('/api/books/:id/rating', (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }

  db.run(
    'UPDATE books SET rating = ? WHERE id = ?',
    [rating, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id });
    }
  );
});

// Delete a book
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true, id });
  });
});

// Get reading stats
app.get('/api/stats', (req, res) => {
  db.serialize(() => {
    // Get total books
    db.get('SELECT COUNT(*) as total FROM books', (err, total) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get books by status
      db.all(
        `SELECT status, COUNT(*) as count FROM books GROUP BY status`,
        (err, byStatus) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // Get books finished per month
          db.all(
            `SELECT strftime('%Y-%m', dateFinished) as month, COUNT(*) as count
             FROM books
             WHERE status = 'Finished' AND dateFinished IS NOT NULL
             GROUP BY month
             ORDER BY month DESC
             LIMIT 12`,
            (err, perMonth) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }

              // Get average rating
              db.get(
                `SELECT AVG(rating) as avgRating FROM books WHERE rating > 0`,
                (err, avgRating) => {
                  if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                  }

                  res.json({
                    total: total.total,
                    byStatus: byStatus,
                    booksPerMonth: perMonth,
                    averageRating: avgRating.avgRating ? avgRating.avgRating.toFixed(1) : 0
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Book Tracker server running on port ${PORT}`);
});
