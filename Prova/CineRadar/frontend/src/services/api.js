import axios from 'axios';

const API_KEY = '03129dc562c7c51794b4fd34d2ca274b';
const BASE_URL = 'https://api.themoviedb.org/3';
const BACKEND_URL = 'http://localhost:5000/api';

// Funções TMDB
export const getTrendingMovies = async () => {
  const response = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=pt-BR`);
  return response.data.results;
};

export const getMoviesByGenre = async (genreId) => {
  const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=pt-BR`);
  return response.data.results;
};

export const getGenres = async () => {
  const response = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pt-BR`);
  return response.data.genres;
};

export const getMovieDetails = async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos`);
  return response.data;
};

export const getMovieCredits = async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=pt-BR`);
  return response.data;
};

export const getMovieVideos = async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=pt-BR`);
  return response.data.results;
};

export const getSimilarMovies = async (movieId) => {
  const response = await axios.get(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=pt-BR`);
  return response.data.results.slice(0, 8);
};

export const searchMovies = async (query, page = 1) => {
  const response = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: API_KEY,
      query,
      page,
      language: 'pt-BR'
    }
  });
  return response.data;
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro no registro');
  }
};

export const updateUserProfile = async (userId, data) => {
  const response = await axios.put(`${BACKEND_URL}/users/${userId}`, data);
  return response.data;
};

export const changePassword = async (userId, data) => {
  const response = await axios.put(`${BACKEND_URL}/users/${userId}/password`, data);
  return response.data;
};

export const getWatchlist = async (userId) => {
  const response = await axios.get(`${BACKEND_URL}/users/${userId}/watchlist`);
  return response.data;
};

export const removeFromWatchlist = async (userId, movieId) => {
  const response = await axios.delete(`${BACKEND_URL}/users/${userId}/watchlist/${movieId}`);
  return response.data;
};