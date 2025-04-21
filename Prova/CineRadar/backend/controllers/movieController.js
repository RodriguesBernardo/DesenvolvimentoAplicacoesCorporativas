// backend/controllers/movieController.js
const axios = require('axios');
require('dotenv').config();


// Função para buscar buscar filmes direto do TMDB 
exports.getRecommendations = async (req, res) => {
  try {
    const { genres } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_genres=${genres}`
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar filmes' });
  }
};