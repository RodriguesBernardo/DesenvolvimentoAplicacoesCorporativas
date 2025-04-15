const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Não autenticado',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificação mais robusta do usuário
    const [user] = await db.query(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user || user.length === 0) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Adiciona mais informações do usuário ao request
    req.user = {
      id: user[0].id,
      email: user[0].email,
      // Adicione outros campos necessários
    };

    next();
  } catch (err) {
    console.error('Erro no authMiddleware:', err);
    
    let errorMessage = 'Não autenticado';
    let errorCode = 'INVALID_TOKEN';
    
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Token inválido';
      errorCode = 'MALFORMED_TOKEN';
    }
    
    res.status(401).json({ 
      error: errorMessage,
      code: errorCode
    });
  }
};