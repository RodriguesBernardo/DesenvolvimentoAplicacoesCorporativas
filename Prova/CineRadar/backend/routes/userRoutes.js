// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota pública
router.post('/register', userController.register);

// Rotas protegidas (requerem autenticação)
router.get('/:id', authMiddleware, userController.getUser);
router.put('/:id/preferences', authMiddleware, userController.updatePreferences);

module.exports = router;