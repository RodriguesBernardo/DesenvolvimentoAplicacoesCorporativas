const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer (upload de avatar)
const upload = multer({ dest: 'public/uploads/avatars/' });

// Obter usuário
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [user] = await db.query(
      'SELECT id, name, email, avatar FROM users WHERE id = ?', 
      [req.params.id]
    );
    
    if (!user.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload de avatar
router.put('/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const avatarPath = '/uploads/avatars/' + req.file.filename;
    
    // Obter avatar antigo
    const [user] = await db.query(
      'SELECT avatar FROM users WHERE id = ?',
      [req.params.id]
    );
    
    // Deletar avatar antigo se existir
    if (user[0]?.avatar && !user[0].avatar.includes('placeholder.com')) {
      const oldPath = path.join(__dirname, '../../public', user[0].avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Atualizar no banco
    await db.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarPath, req.params.id]
    );
    
    res.json({ avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;