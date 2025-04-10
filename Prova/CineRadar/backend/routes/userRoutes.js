const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuração do upload de avatar
const storageDir = path.join(__dirname, '../public/uploads/avatars');

// Verifica e cria o diretório se não existir
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

    // Move o arquivo
    fs.renameSync(req.file.path, fullPath);

    // Atualiza o avatar no banco de dados
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
    
    // Limpeza em caso de erro
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar o upload do avatar',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

// Middleware para verificar se o usuário é o dono do recurso
const checkUserOwnership = (req, res, next) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  next();
};

// Rotas de usuário

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
    
    // Formata a URL do avatar se existir
    const userData = {
      ...user[0],
      avatar: user[0].avatar 
        ? `${req.protocol}://${req.get('host')}${user[0].avatar}`
        : null
    };
    
    res.json(userData);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
  }
});

// Atualizar perfil do usuário
router.put('/:id/profile', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    // Validação básica
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    // Verifica se o email já está em uso por outro usuário
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.params.id]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Atualiza as informações do usuário
    await db.query(
      'UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?',
      [name, email, bio || null, req.params.id]
    );
    
    // Obtém os dados atualizados
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

    // Busca a senha atual do usuário
    const [user] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verifica se a senha atual está correta
    const isMatch = await bcrypt.compare(currentPassword, user[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }
    
    // Cria o hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Atualiza a senha no banco de dados
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );
    
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar senha:', err);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
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
    res.status(500).json({ error: 'Erro ao recuperar o avatar' });
  }
});

// Rotas de watchlist
router.get('/:id/watchlist', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const [watchlist] = await db.query(
      `SELECT 
        w.movie_id,
        m.title,
        m.poster_path,
        m.release_date,
        m.vote_average,
        GROUP_CONCAT(g.name) as genres
      FROM watchlists w
      LEFT JOIN movies m ON w.movie_id = m.id
      LEFT JOIN movie_genres mg ON m.id = mg.movie_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      WHERE w.user_id = ?
      GROUP BY w.movie_id, m.title, m.poster_path, m.release_date, m.vote_average`,
      [req.params.id]
    );
    
    // Formata os gêneros como array
    const formattedWatchlist = watchlist.map(item => ({
      ...item,
      genres: item.genres ? item.genres.split(',') : []
    }));
    
    res.json(formattedWatchlist);
  } catch (err) {
    console.error('Erro ao buscar watchlist:', err);
    res.status(500).json({ error: 'Erro ao buscar watchlist' });
  }
});

// Rotas de gêneros (públicas)
router.get('/genres/list', async (req, res) => {
  try {
    const [genres] = await db.query('SELECT * FROM genres ORDER BY name');
    res.json(genres);
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    res.status(500).json({ error: 'Erro ao buscar gêneros' });
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
    
    // Converte os IDs de gêneros para array
    const genreIds = result.preferred_genre_ids 
      ? result.preferred_genre_ids.split(',').map(id => parseInt(id))
      : [];
    
    res.json({
      genreIds,
      languagePreference: result.language_preference
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({ error: 'Erro ao carregar preferências' });
  }
});

router.put('/:id/preferences', authMiddleware, checkUserOwnership, async (req, res) => {
  try {
    const { genreIds, languagePreference } = req.body;
    
    // Validação dos gêneros
    if (genreIds && genreIds.length > 0) {
      const [validGenres] = await db.query(
        'SELECT COUNT(*) as count FROM genres WHERE id IN (?)',
        [genreIds]
      );
      
      if (validGenres[0].count !== genreIds.length) {
        return res.status(400).json({ error: 'Alguns gêneros são inválidos' });
      }
    }
    
    // Converte array de IDs para string
    const genreIdsString = genreIds ? genreIds.join(',') : '';
    
    // Insere ou atualiza as preferências
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
    res.status(500).json({ error: 'Erro ao salvar preferências' });
  }
});

module.exports = router;