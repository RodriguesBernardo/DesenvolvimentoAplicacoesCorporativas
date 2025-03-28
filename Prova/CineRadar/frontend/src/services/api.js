import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Configurações TMDB
const API_KEY = '03129dc562c7c51794b4fd34d2ca274b';
const BASE_URL = 'https://api.themoviedb.org/3';

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

// Funções de Autenticação
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao fazer login');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro no registro');
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao fazer logout');
  }
};

// Funções de Usuário
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter perfil');
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao atualizar perfil');
  }
};

export const changePassword = async (userId, data) => {
  try {
    const response = await api.put(`/users/${userId}/password`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao alterar senha');
  }
};

// Funções de Watchlist
export const getWatchlist = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/watchlist`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao obter watchlist');
  }
};

export const addToWatchlist = async (userId, movieData) => {
  try {
    const response = await api.post(`/users/${userId}/watchlist`, movieData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao adicionar à watchlist');
  }
};

export const removeFromWatchlist = async (userId, movieId) => {
  try {
    const response = await api.delete(`/users/${userId}/watchlist/${movieId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao remover da watchlist');
  }
};

// Funções de Upload
export const uploadAvatar = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.put(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao enviar avatar');
  }
};

// Funções de Estatísticas
export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      moviesWatched: 0,
      hoursWatched: 0,
      favoriteGenre: 'Nenhum ainda',
      reviewsWritten: 0,
      listsCreated: 0
    };
  }
};

export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
};