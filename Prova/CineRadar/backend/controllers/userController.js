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
    const { movie_id, title } = req.body;

    // Check if already in watchlist
    const [existing] = await db.query(
      'SELECT id FROM watchlist WHERE user_id = ? AND movie_id = ?',
      [userId, movie_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Filme já está na watchlist'
      });
    }

    await db.query(
      'INSERT INTO watchlist (user_id, movie_id, title) VALUES (?, ?, ?)',
      [userId, movie_id, title]
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
      'SELECT movie_id, title FROM watchlist WHERE user_id = ?',
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
      'DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
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
    // Verificar se o ID do token corresponde ao ID da rota
    if (req.userId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado - Você só pode atualizar seu próprio perfil'
      });
    }

    // Verificar se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    // Obter usuário atual para deletar a imagem antiga se existir
    const user = await User.findByPk(req.params.id);
    if (user.avatar && user.avatar !== 'https://via.placeholder.com/150') {
      const oldAvatarPath = path.join(__dirname, '../public', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Atualizar avatar no banco de dados
    const avatarPath = '/uploads/avatars/' + req.file.filename;
    const [updated] = await User.update(
      { avatar: avatarPath },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Retornar o usuário atualizado
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar avatar'
    });
  }
};