const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Caminho correto do diretório de uploads
const storageDir = path.join(__dirname, '../public/uploads/avatars');

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

// Rota de upload
router.put('/:id/avatar', authMiddleware, upload.single('avatar'), handleAvatarUpload);
router.post('/:id/avatar', authMiddleware, upload.single('avatar'), handleAvatarUpload);

async function handleAvatarUpload(req, res) {
  try {
    if (!req.file) {
      console.log('Nenhum arquivo recebido no upload');
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado' });
    }

    console.log('Arquivo recebido:', {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    const userId = req.params.id;
    const uploadDir = path.join(__dirname, '../public/uploads/avatars'); // ✅ Corrigido
    const filename = `${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
    const relativePath = `/uploads/avatars/${filename}`;
    const fullPath = path.join(uploadDir, filename);

    console.log('Destino do arquivo:', fullPath);

    if (!fs.existsSync(uploadDir)) {
      console.log(`Criando diretório: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!fs.existsSync(req.file.path)) {
      console.log('Arquivo temporário não encontrado:', req.file.path);
      return res.status(500).json({ error: 'Erro no processamento do arquivo' });
    }

    fs.renameSync(req.file.path, fullPath);
    console.log(`Arquivo movido para: ${fullPath}`);

    if (!fs.existsSync(fullPath)) {
      console.log('Falha ao mover arquivo - arquivo não encontrado no destino');
      return res.status(500).json({ error: 'Erro ao salvar o arquivo' });
    }

    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user.length) {
      fs.unlinkSync(fullPath);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Aqui você pode atualizar o caminho do avatar no banco, se quiser
    // await db.query('UPDATE users SET avatar = ? WHERE id = ?', [relativePath, userId]);

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

module.exports = router;

// Obter usuário
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Busca dados básicos do usuário
    const [user] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?', 
      [req.params.id]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Busca dados do perfil
    const [profile] = await db.query(
      'SELECT avatar, bio FROM user_profiles WHERE user_id = ?',
      [req.params.id]
    );
    
    // Combina os resultados
    const userData = {
      ...user[0],
      avatar: profile.length && profile[0].avatar 
        ? `${req.protocol}://${req.get('host')}${profile[0].avatar}`
        : null,
      bio: profile.length ? profile[0].bio : null
    };
    
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar perfil do usuário
router.put('/:id/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?',
      [name, email, bio || null, req.params.id] // bio pode ser null
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retorna os dados atualizados
    const [updatedUser] = await db.query(
      'SELECT id, name, email, avatar, bio FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ user: updatedUser[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ 
      error: 'Erro ao atualizar perfil',
      details: err.message
    });
  }
});

// Atualizar senha do usuário
router.put('/:id/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Primeiro verifica a senha atual
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
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Atualiza a senha
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );
    
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload de avatar (PUT e POST para compatibilidade)
router.put('/:id/avatar', authMiddleware, upload.single('avatar'), handleAvatarUpload);
router.post('/:id/avatar', authMiddleware, upload.single('avatar'), handleAvatarUpload);

async function handleAvatarUpload(req, res) {
  try {
    if (!req.file) {
      console.log('Nenhum arquivo recebido no upload');
      return res.status(400).json({ error: 'Nenhum arquivo de imagem foi enviado' });
    }

    console.log('Arquivo recebido:', {
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size
    });

    const userId = req.params.id;
    const uploadDir = path.join(__dirname, '../public/uploads/avatars');
    const filename = `${userId}-${Date.now()}${path.extname(req.file.originalname)}`;
    const relativePath = `/uploads/avatars/${filename}`;
    const fullPath = path.join(uploadDir, filename);

    console.log('Destino do arquivo:', fullPath);

    // Verifica e cria diretório se necessário
    if (!fs.existsSync(uploadDir)) {
      console.log(`Criando diretório: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Verifica se o arquivo temporário existe
    if (!fs.existsSync(req.file.path)) {
      console.log('Arquivo temporário não encontrado:', req.file.path);
      return res.status(500).json({ error: 'Erro no processamento do arquivo' });
    }

    // Move o arquivo
    fs.renameSync(req.file.path, fullPath);
    console.log(`Arquivo movido para: ${fullPath}`);

    // Verifica se o arquivo foi movido com sucesso
    if (!fs.existsSync(fullPath)) {
      console.log('Falha ao mover arquivo - arquivo não encontrado no destino');
      return res.status(500).json({ error: 'Erro ao salvar o arquivo' });
    }

    // Restante da lógica do banco de dados...
    const [user] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user.length) {
      fs.unlinkSync(fullPath);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // ... (continua com o resto do seu código original)

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

// Watchlist do usuário
router.get('/:id/watchlist', authMiddleware, async (req, res) => {
  try {
    // Verifique se a tabela watchlists existe
    const [tableExists] = await db.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'watchlists'
      ) as table_exists`
    );
    
    if (!tableExists[0].table_exists) {
      return res.status(200).json([]); // Retorna array vazio se tabela não existe
    }

    const [watchlist] = await db.query(
      `SELECT 
  w.movie_id,
  m.title,
  m.poster_path,
  GROUP_CONCAT(g.name) as genres
  FROM watchlists w
  LEFT JOIN movies m ON w.movie_id = m.id
  LEFT JOIN movie_genres mg ON m.id = mg.movie_id
  LEFT JOIN genres g ON mg.genre_id = g.id
  WHERE w.user_id = ?
  GROUP BY w.movie_id, m.title, m.poster_path
  LIMIT 5
  `,
      [req.params.id]
    );
    
    // Formata os gêneros como array
    const formattedWatchlist = watchlist.map(item => ({
      ...item,
      genres: item.genres ? item.genres.split(',') : []
    }));
    
    res.json(formattedWatchlist);
  } catch (err) {
    console.error('Error in /watchlist:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: err.message
    });
  }
});

// Estatísticas do usuário
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    // Verifica quais tabelas existem
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    const tableNames = tables.map(t => t.table_name);
    const tableChecks = {
      user_movies: tableNames.includes('user_movies'),
      reviews: tableNames.includes('reviews'),
      user_lists: tableNames.includes('user_lists'),
      movie_genres: tableNames.includes('movie_genres'),
      movies: tableNames.includes('movies'),
      genres: tableNames.includes('genres')
    };

    // Consultas condicionais baseadas nas tabelas existentes
    const statsQuery = `
      SELECT
        ${tableChecks.user_movies ? `
          COALESCE((
            SELECT COUNT(*) 
            FROM user_movies 
            WHERE user_id = ?
          ), 0) as moviesWatched,
          
          COALESCE((
            SELECT SUM(m.duration)/60 
            FROM user_movies um
            JOIN movies m ON um.movie_id = m.id
            WHERE um.user_id = ?
          ), 0) as hoursWatched,
        ` : `
          0 as moviesWatched,
          0 as hoursWatched,
        `}
        
        ${tableChecks.user_movies && tableChecks.movie_genres && tableChecks.genres ? `
          (
            SELECT g.name 
            FROM genres g
            JOIN movie_genres mg ON g.id = mg.genre_id
            JOIN user_movies um ON mg.movie_id = um.movie_id
            WHERE um.user_id = ?
            GROUP BY g.name
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ) as favoriteGenre,
        ` : `
          NULL as favoriteGenre,
        `}
        
        ${tableChecks.reviews ? `
          COALESCE((
            SELECT COUNT(*) 
            FROM reviews 
            WHERE user_id = ?
          ), 0) as reviewsWritten,
        ` : `
          0 as reviewsWritten,
        `}
        
        ${tableChecks.user_lists ? `
          COALESCE((
            SELECT COUNT(*) 
            FROM user_lists 
            WHERE user_id = ?
          ), 0) as listsCreated
        ` : `
          0 as listsCreated
        `}
    `;

    const queryParams = [];
    if (tableChecks.user_movies) queryParams.push(req.params.id, req.params.id);
    if (tableChecks.user_movies && tableChecks.movie_genres && tableChecks.genres) queryParams.push(req.params.id);
    if (tableChecks.reviews) queryParams.push(req.params.id);
    if (tableChecks.user_lists) queryParams.push(req.params.id);

    const [stats] = await db.query(statsQuery, queryParams);
    
    res.json(stats[0] || { 
      moviesWatched: 0,
      hoursWatched: 0,
      favoriteGenre: null,
      reviewsWritten: 0,
      listsCreated: 0
    });

  } catch (err) {
    console.error('Error in /stats:', err);
    res.status(500).json({ 
      error: 'Error fetching stats',
      details: err.message,
      suggestion: 'Verify if all required tables exist in the database'
    });
  }
});

// Atividades do usuário
router.get('/:id/activity', authMiddleware, async (req, res) => {
  try {
    // Verifica tabelas existentes
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_name IN ('user_movies', 'reviews')
    `);
    
    const hasUserMovies = tables.some(t => t.table_name === 'user_movies');
    const hasReviews = tables.some(t => t.table_name === 'reviews');

    if (!hasUserMovies && !hasReviews) {
      return res.json([]);
    }

    const activityQuery = `
      ${hasUserMovies ? `
        (SELECT 
          'WATCHED' as type,
          m.title,
          um.watched_at as date,
          CONCAT('Assistiu ', m.title) as description
        FROM user_movies um
        JOIN movies m ON um.movie_id = m.id
        WHERE um.user_id = ?
        ORDER BY um.watched_at DESC
        LIMIT 5)
      ` : ''}
      
      ${hasUserMovies && hasReviews ? 'UNION ALL' : ''}
      
      ${hasReviews ? `
        (SELECT 
          'REVIEW' as type,
          m.title,
          r.created_at as date,
          CONCAT('Review: ', LEFT(r.content, 30)) as description
        FROM reviews r
        JOIN movies m ON r.movie_id = m.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5)
      ` : ''}
      
      ORDER BY date DESC
      LIMIT 10
    `;

    const queryParams = [];
    if (hasUserMovies) queryParams.push(req.params.id);
    if (hasReviews) queryParams.push(req.params.id);

    const [activities] = await db.query(activityQuery, queryParams);
    res.json(activities || []);

  } catch (err) {
    console.error('Error in /activity:', err);
    res.status(500).json({ 
      error: 'Error fetching activity',
      details: err.message
    });
  }
});

// Obter avatar (rota GET separada)
router.get('/:id/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [profile] = await db.query(
      'SELECT avatar FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (!profile.length || !profile[0].avatar) {
      return res.status(404).json({ 
        error: 'Avatar não encontrado',
        suggestion: 'O usuário ainda não configurou um avatar'
      });
    }
    
    const avatarUrl = profile[0].avatar.startsWith('http') 
      ? profile[0].avatar 
      : `${req.protocol}://${req.get('host')}${profile[0].avatar}`;
    
    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error('Erro ao buscar avatar:', err);
    res.status(500).json({ 
      error: 'Erro ao recuperar o avatar',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;