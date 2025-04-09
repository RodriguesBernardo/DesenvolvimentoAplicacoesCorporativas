const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

// Adicionar à watchlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { movieId, title, posterPath } = req.body;
    const userId = req.user.id; // Corrigido para pegar do middleware

    // 1. Verificar se o filme já está na watchlist
    const [existing] = await db.query(
      'SELECT * FROM watchlists WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Este filme já está na sua watchlist' 
      });
    }

    // 2. Adicionar à watchlist
    await db.query(
      'INSERT INTO watchlists (user_id, movie_id, title, poster_path) VALUES (?, ?, ?, ?)',
      [userId, movieId, title, posterPath]
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Filme adicionado à watchlist com sucesso'
    });

  } catch (err) {
    console.error('Erro ao adicionar à watchlist:', err);
    
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Tabela watchlists não existe',
        suggestion: 'Execute o script de criação de tabelas'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao adicionar à watchlist',
      details: err.message 
    });
  }
});

// Obter watchlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [movies] = await db.query(
      'SELECT movie_id as movieId, title, poster_path as posterPath FROM watchlists WHERE user_id = ?',
      [req.user.id] // Corrigido para pegar do middleware
    );
    
    res.json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (err) {
    console.error('Erro ao buscar watchlist:', err);
    
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Tabela watchlists não existe',
        suggestion: 'Execute o script de criação de tabelas'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao buscar watchlist',
      details: err.message 
    });
  }
});

module.exports = router;