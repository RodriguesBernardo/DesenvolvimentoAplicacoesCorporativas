const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

// Adicionar à watchlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { movieId, title, posterPath } = req.body;
    
    await db.query(
      'INSERT INTO watchlist (user_id, movie_id, title, poster_path) VALUES (?, ?, ?, ?)',
      [req.userId, movieId, title, posterPath]
    );
    
    res.status(201).json({ message: 'Adicionado à watchlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter watchlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [movies] = await db.query(
      'SELECT movie_id, title, poster_path FROM watchlist WHERE user_id = ?',
      [req.userId]
    );
    
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;