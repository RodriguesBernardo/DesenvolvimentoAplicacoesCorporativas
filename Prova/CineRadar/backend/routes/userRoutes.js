const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');


router.use(express.json()); // Para parsear application/json
router.use(express.urlencoded({ extended: true })); // Para parsear form data

// Configuração do upload de avatar
const storageDir = path.join(__dirname, '../public/uploads/avatars');

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const upload = multer({ 
  dest: storageDir,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de arquivo inválido. Apenas JPEG, PNG ou GIF são permitidos');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
    cb(null, true);
  }
});

// Middleware para tratamento de parâmetros
router.param(['id', 'mediaId'], (req, res, next, value) => {
  if (isNaN(parseInt(value))) {
    return res.status(400).json({ error: 'ID deve ser um número válido' });
  }
  next();
});

router.param('userId', (req, res, next, userId) => {
  if (userId === 'me') {
    req.params.userId = req.user.id;
  } else if (isNaN(parseInt(userId))) {
    return res.status(400).json({ error: 'ID de usuário inválido' });
  }
  next();
});

// Middleware para verificar se o usuário é o dono do recurso
const checkUserOwnership = (req, res, next) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  next();
};

// Função para processar upload de avatar
async function handleAvatarUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado' });
    }

    const userId = req.params.id;
    const filename = `${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
    const relativePath = `/uploads/avatars/${filename}`;
    const fullPath = path.join(storageDir, filename);

    fs.renameSync(req.file.path, fullPath);

    await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [relativePath, userId]
    );

    res.json({ 
      success: true,
      avatar: `${req.protocol}://${req.get('host')}${relativePath}`
    });

  } catch (err) {
    console.error('Erro no upload do avatar:', err);
    
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar o upload do avatar',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Obter perfil do usuário
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query(
      `SELECT 
        id, name, email, avatar, bio, created_at
      FROM users
      WHERE id = ?`,
      [req.params.id]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const userData = {
      ...user[0],
      avatar: user[0].avatar 
        ? `${req.protocol}://${req.get('host')}${user[0].avatar}`
        : null
    };
    
    res.json(userData);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar informações do usuário',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Atualizar perfil do usuário
router.put('/:id/profile', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.params.id]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?',
      [name, email, bio || null, req.params.id]
    );
    
    const [updatedUser] = await db.query(
      `SELECT 
        id, name, email, avatar, bio, created_at
      FROM users
      WHERE id = ?`,
      [req.params.id]
    );
    
    res.json({ user: updatedUser[0] });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ 
      error: 'Erro ao atualizar perfil',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Atualizar senha do usuário
router.put('/:id/password', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const [user] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );
    
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar senha:', err);
    res.status(500).json({ 
      error: 'Erro ao atualizar senha',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Rotas de avatar
router.put('/:id/avatar', authMiddleware, checkUserOwnership, upload.single('avatar'), handleAvatarUpload);
router.post('/:id/avatar', authMiddleware, checkUserOwnership, upload.single('avatar'), handleAvatarUpload);

// Obter URL do avatar
router.get('/:id/avatar', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT avatar FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (!user.length || !user[0].avatar) {
      return res.status(404).json({ error: 'Avatar não encontrado' });
    }
    
    const avatarUrl = user[0].avatar.startsWith('http') 
      ? user[0].avatar 
      : `${req.protocol}://${req.get('host')}${user[0].avatar}`;
    
    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error('Erro ao buscar avatar:', err);
    res.status(500).json({ 
      error: 'Erro ao recuperar o avatar',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Rotas da Watchlist

// Lista os filmes e séries que estão na watchlist do usuário 
router.get('/users/me/watchlist/:mediaId/check', authMiddleware, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      'SELECT 1 FROM watchlists WHERE user_id = ? AND media_id = ? LIMIT 1',
      [userId, mediaId]
    );
    
    res.json({ 
      isInWatchlist: result.length > 0,
      success: true
    });
  } catch (error) {
    console.error('Erro ao verificar watchlist:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Remova o checkUserOwnership das rotas de watchlist e mantenha apenas authMiddleware
router.post('/users/me/watchlist', authMiddleware, async (req, res) => {
  try {
    const requiredFields = ['media_id', 'media_type', 'title', 'poster_path'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Dados incompletos',
        missing: missingFields
      });
    }

    const { media_id, media_type, title, poster_path } = req.body;

    // Verifica se já está na watchlist
    const [existing] = await db.query(
      'SELECT id FROM watchlists WHERE user_id = ? AND media_id = ? AND media_type = ?',
      [req.user.id, media_id, media_type]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Item já está na watchlist' });
    }
    
    // Adiciona à watchlist
    await db.query(
      `INSERT INTO watchlists 
        (user_id, media_id, media_type, title, poster_path) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, media_id, media_type, title, poster_path]
    );
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Erro ao adicionar à watchlist:', error);
    res.status(500).json({ 
      error: 'Erro ao adicionar à watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Remove um item da watchlist do usuário
router.delete('/users/:userId/watchlist/:mediaId', authMiddleware, async (req, res) => {
  try {
    const { userId, mediaId } = req.params;

    await db.query(
      'DELETE FROM watchlists WHERE user_id = ? AND media_id = ?',
      [userId, mediaId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover da watchlist:', error);
    res.status(500).json({ 
      error: 'Erro ao remover item da watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'WATCHLIST_REMOVE_ERROR'
    });
  }
});


// Lista os filmes e séries que estão na watchlist do usuário
router.get('/users/:userId/watchlist', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Filmes na watchlist
    const [movies] = await db.query(
      `SELECT 
        w.id as watchlist_id,
        w.media_id,
        'movie' as media_type,
        m.title,
        w.poster_path,
        m.release_date,
        m.vote_average,
        m.overview,
        GROUP_CONCAT(g.name) as genres
      FROM watchlists w
      LEFT JOIN movies m ON w.media_id = m.id
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE w.user_id = ? AND w.media_type = 'movie'
      GROUP BY w.id, w.media_id, m.title, w.poster_path, m.release_date, m.vote_average, m.overview
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Séries na watchlist (se aplicável)
    const [series] = await db.query(
      `SELECT 
        w.id as watchlist_id,
        w.media_id,
        'tv' as media_type,
        s.title,
        w.poster_path,
        s.first_air_date as release_date,
        s.vote_average,
        s.overview,
        GROUP_CONCAT(g.name) as genres
      FROM watchlists w
      LEFT JOIN series s ON w.media_id = s.id
      LEFT JOIN series_genres sg ON s.id = sg.series_id
      LEFT JOIN genres g ON sg.genre_id = g.id
      WHERE w.user_id = ? AND w.media_type = 'tv'
      GROUP BY w.id, w.media_id, s.title, w.poster_path, s.first_air_date, s.vote_average, s.overview
      LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const combinedResults = [...movies, ...series].map(item => ({
      ...item,
      genres: item.genres ? item.genres.split(',') : []
    }));

    res.json({
      success: true,
      data: combinedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: combinedResults.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar watchlist:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'WATCHLIST_FETCH_ERROR'
    });
  }
});

// Rotas de gêneros (públicas)
router.get('/genres/list', async (req, res) => {
  try {
    const [genres] = await db.query('SELECT * FROM genres ORDER BY name');
    res.json(genres);
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar gêneros',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rotas de preferências do usuário
router.get('/:id/preferences', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const [preferences] = await db.query(
      'SELECT preferred_genre_ids, language_preference FROM user_preferences WHERE user_id = ?',
      [req.params.id]
    );
    
    const result = preferences[0] || { 
      preferred_genre_ids: '', 
      language_preference: null 
    };
    
    const genreIds = result.preferred_genre_ids 
      ? result.preferred_genre_ids.split(',').map(id => parseInt(id))
      : [];
    
    res.json({
      genreIds,
      languagePreference: result.language_preference
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar preferências',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put('/:id/preferences', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const { genreIds, languagePreference } = req.body;
    
    if (genreIds && genreIds.length > 0) {
      const [validGenres] = await db.query(
        'SELECT COUNT(*) as count FROM genres WHERE id IN (?)',
        [genreIds]
      );
      
      if (validGenres[0].count !== genreIds.length) {
        return res.status(400).json({ error: 'Alguns gêneros são inválidos' });
      }
    }
    
    const genreIdsString = genreIds ? genreIds.join(',') : '';
    
    await db.query(
      `INSERT INTO user_preferences 
        (user_id, preferred_genre_ids, language_preference) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         preferred_genre_ids = VALUES(preferred_genre_ids),
         language_preference = VALUES(language_preference)`,
      [req.params.id, genreIdsString, languagePreference || null]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar preferências',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;