const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper functions
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
};

const handleUserPreferences = async (userId, preferences) => {
  const [existing] = await db.query('SELECT id FROM preferences WHERE user_id = ?', [userId]);
  
  if (existing.length > 0) {
    await db.query(
      'UPDATE preferences SET genres = ?, platforms = ? WHERE user_id = ?',
      [preferences.genres, preferences.platforms, userId]
    );
  } else {
    await db.query(
      'INSERT INTO preferences (user_id, genres, platforms) VALUES (?, ?, ?)',
      [userId, preferences.genres, preferences.platforms]
    );
  }
};

// Controller methods
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Todos os campos são obrigatórios' 
      });
    }

    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Create default preferences
    await db.query(
      'INSERT INTO preferences (user_id, genres, platforms) VALUES (?, ?, ?)',
      [result.insertId, '', '']
    );

    // Response
    res.status(201).json({
      success: true,
      message: 'Registro realizado com sucesso',
      token: generateToken(result.insertId),
      user: {
        id: result.insertId,
        name,
        email
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Get user preferences
    const [preferences] = await db.query(
      'SELECT genres, platforms FROM preferences WHERE user_id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        preferences: preferences[0] || null
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Get preferences
    const [preferences] = await db.query(
      'SELECT genres, platforms FROM preferences WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: {
        ...user,
        preferences: preferences[0] || null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }

    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId]
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.params.id;
    const [preferences] = await db.query(
      'SELECT genres, platforms FROM preferences WHERE user_id = ?',
      [userId]
    );

    if (!preferences || preferences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Preferências não encontradas'
      });
    }

    res.json({
      success: true,
      preferences: preferences[0]
    });

  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.params.id;
    const { genres, platforms } = req.body;

    await handleUserPreferences(userId, { genres, platforms });

    res.json({
      success: true,
      message: 'Preferências atualizadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.params.id;
    const { movie_id, title, poster_path } = req.body; // Adicionado poster_path

    // Check if already in watchlist
    const [existing] = await db.query(
      'SELECT id FROM watchlists WHERE user_id = ? AND movie_id = ?',
      [userId, movie_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Filme já está na watchlist'
      });
    }

    await db.query(
      'INSERT INTO watchlists (user_id, movie_id, title, poster_path) VALUES (?, ?, ?, ?)',
      [userId, movie_id, title, poster_path]
    );

    res.status(201).json({
      success: true,
      message: 'Filme adicionado à watchlist'
    });

  } catch (error) {
    console.error('Erro ao adicionar à watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.params.id;
    const [watchlist] = await db.query(
      'SELECT movie_id, title, poster_path FROM watchlists WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      watchlist
    });

  } catch (error) {
    console.error('Erro ao buscar watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { id, movieId } = req.params;

    await db.query(
      'DELETE FROM watchlists WHERE user_id = ? AND movie_id = ?',
      [id, movieId]
    );

    res.json({
      success: true,
      message: 'Filme removido da watchlist'
    });

  } catch (error) {
    console.error('Erro ao remover da watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Iniciar transação
    await db.query('START TRANSACTION');

    // Deletar preferências
    await db.query('DELETE FROM preferences WHERE user_id = ?', [userId]);
    
    // Deletar watchlist
    await db.query('DELETE FROM watchlist WHERE user_id = ?', [userId]);
    
    // Deletar usuário
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    // Confirmar transação
    await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    // Reverter em caso de erro
    await db.query('ROLLBACK');
    
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Caminho relativo e completo para o avatar
    const relativePath = '/uploads/avatars/' + req.file.filename;
    const fullPath = path.join(__dirname, '../../public', relativePath);

    // Renomear o arquivo temporário para o destino final
    fs.renameSync(req.file.path, fullPath);

    // Obter avatar antigo do user_profiles
    const [profile] = await db.query(
      'SELECT avatar FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    // Remover arquivo antigo se existir
    if (profile.length && profile[0].avatar) {
      const oldPath = path.join(__dirname, '../../public', profile[0].avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Atualizar ou inserir no user_profiles
    if (profile.length) {
      await db.query(
        'UPDATE user_profiles SET avatar = ? WHERE user_id = ?',
        [relativePath, userId]
      );
    } else {
      await db.query(
        'INSERT INTO user_profiles (user_id, avatar) VALUES (?, ?)',
        [userId, relativePath]
      );
    }

    // URL completa para o frontend
    const avatarUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      avatar: avatarUrl
    });

  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    
    // Remover arquivo temporário em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};