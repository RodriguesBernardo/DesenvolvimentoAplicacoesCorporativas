// controllers/watchlistController.js
const db = require('../config/db');

exports.getWatchlist = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT w.movie_id as id, w.title, m.poster_path, m.vote_average 
      FROM watchlist w
      LEFT JOIN movies_cache m ON w.movie_id = m.id
      WHERE w.user_id = ?`, [req.userId]); // Adapte para seu sistema de autenticação
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM watchlist WHERE movie_id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};