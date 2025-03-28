const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se usuário existe
    const [user] = await db.query(
      'SELECT id FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (!user.length) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};