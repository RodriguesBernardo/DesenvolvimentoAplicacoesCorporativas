const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Rota para recomendações de filmes
router.get('/recommendations', movieController.getRecommendations);

module.exports = router;