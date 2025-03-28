// routes/watchlistRoutes.js
const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');

router.get('/', watchlistController.getWatchlist);
router.delete('/:id', watchlistController.removeFromWatchlist);

module.exports = router;