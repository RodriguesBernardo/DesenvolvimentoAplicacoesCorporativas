const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar usuário no banco de dados
    const [user] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 2. Verificar senha
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // 3. Gerar token JWT
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 4. Retornar dados do usuário (sem senha) e token
    const userData = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      avatar: user[0].avatar,
      token
    };
    
    console.log(userData)
    res.json(userData);

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Rota de Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se usuário já existe
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ 
      id: result.insertId,
      name,
      email
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;