import axios from 'axios';

// Configurações base
const TMDB_BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuração do Axios para sua API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configuração do Axios para TMDB API
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  params: {
    api_key: process.env.REACT_APP_TMDB_API_KEY,
    language: 'pt-BR',
    region: 'BR'
  }
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para tratamento de erros padrão
const setupResponseInterceptors = (instance) => {
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error('Erro na resposta:', {
          status: error.response.status,
          data: error.response.data,
          url: error.config.url
        });
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
      } else {
        console.error('Erro na requisição:', error.message);
      }
      return Promise.reject(error);
    }
  );
};

setupResponseInterceptors(api);
setupResponseInterceptors(tmdbApi);

// Funções auxiliares
const handleTmdbResponse = (response) => {
  if (!response.data) {
    throw new Error('Resposta da API vazia');
  }
  return response.data;
};

const handleEmptyResults = (data, defaultValue = []) => {
  if (!data || !data.results || data.results.length === 0) {
    return defaultValue;
  }
  return data;
};

// TMDB API Requests
const tmdbRequests = {
  // Filmes
  getTrendingMovies: async (timeWindow = 'week') => {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return handleTmdbResponse(response).results || [];
  },

  getMoviesByGenre: async (genreId, page = 1) => {
    const response = await tmdbApi.get('/discover/movie', {
      params: { 
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return handleTmdbResponse(response).results || [];
  },

  getGenres: async () => {
    const response = await tmdbApi.get('/genre/movie/list');
    return handleTmdbResponse(response).genres || [];
  },

  getMovieDetails: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: { 
          append_to_response: 'credits,videos,watch/providers,similar',
          include_image_language: 'pt,null',
          include_video_language: 'pt,en'
        }
      });
      return handleTmdbResponse(response);
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      throw error;
    }
  },

  getMovieCredits: async (movieId) => {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    return handleTmdbResponse(response);
  },

  getMovieVideos: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/videos`, {
        params: {
          include_video_language: 'pt,en',
          language: 'pt-BR'
        }
      });
      return handleTmdbResponse(response).results || [];
    } catch (error) {
      console.error(`Error fetching videos for movie ${movieId}:`, error);
      return [];
    }
  },

  getWatchProviders: async (movieId) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
      return handleTmdbResponse(response).results || {};
    } catch (error) {
      console.error('Error fetching watch providers:', error);
      return { BR: {} };
    }
  },

  getSimilarMovies: async (movieId, limit = 8) => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}/similar`);
      const results = handleTmdbResponse(response).results || [];
      return results.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching similar movies for ID ${movieId}:`, error);
      return [];
    }
  },

  searchMovies: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: { 
          query, 
          page,
          include_adult: false
        }
      });
      return handleTmdbResponse(response);
    } catch (error) {
      console.error('Error searching movies:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  },

  // Séries
  getTVGenres: async () => {
    const response = await tmdbApi.get('/genre/tv/list');
    return handleTmdbResponse(response).genres || [];
  },

  getTVSeriesDetails: async (seriesId) => {
    try {
      const response = await tmdbApi.get(`/tv/${seriesId}`, {
        params: { 
          append_to_response: 'credits,videos,watch/providers,similar,seasons',
          include_image_language: 'pt,null',
          include_video_language: 'pt,en'
        }
      });
      return handleTmdbResponse(response);
    } catch (error) {
      console.error(`Error fetching TV series details for ID ${seriesId}:`, error);
      throw error;
    }
  },

  getTVSeriesCredits: async (seriesId) => {
    const response = await tmdbApi.get(`/tv/${seriesId}/credits`);
    return handleTmdbResponse(response);
  },

  getTVSeriesVideos: async (seriesId) => {
    try {
      const response = await tmdbApi.get(`/tv/${seriesId}/videos`, {
        params: {
          include_video_language: 'pt,en'
        }
      });
      return handleTmdbResponse(response).results || [];
    } catch (error) {
      console.error(`Error fetching videos for TV series ${seriesId}:`, error);
      return [];
    }
  },

  getTVSeriesWatchProviders: async (seriesId) => {
    try {
      const response = await tmdbApi.get(`/tv/${seriesId}/watch/providers`);
      return handleTmdbResponse(response).results || {};
    } catch (error) {
      console.error('Error fetching TV watch providers:', error);
      return { BR: {} };
    }
  },

  getSimilarTVSeries: async (seriesId, limit = 8) => {
    try {
      const response = await tmdbApi.get(`/tv/${seriesId}/similar`);
      const results = handleTmdbResponse(response).results || [];
      return results.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching similar TV series for ID ${seriesId}:`, error);
      return [];
    }
  },

  getTVSeriesByGenre: async (genreId, page = 1) => {
    const response = await tmdbApi.get('/discover/tv', {
      params: { 
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc'
      }
    });
    return handleTmdbResponse(response).results || [];
  },

  searchSeries: async (query, page = 1) => {
    try {
      const response = await tmdbApi.get('/search/tv', {
        params: { 
          query, 
          page,
          include_adult: false
        }
      });
      return handleTmdbResponse(response);
    } catch (error) {
      console.error('Error searching TV series:', error);
      return { results: [], total_pages: 0, total_results: 0 };
    }
  }
};

// Sua API Requests
const authRequests = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

const userRequests = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  changePassword: async (userId, data) => {
    const response = await api.put(`/users/${userId}/password`, data);
    return response.data;
  },

  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

const watchlistRequests = {
  getWatchlist: async (userId) => {
    const response = await api.get(`/users/${userId}/watchlist`);
    return response.data;
  },

  addToWatchlist: async (userId, mediaData) => {
    const response = await api.post(`/users/${userId}/watchlist`, mediaData);
    return response.data;
  },

  removeFromWatchlist: async (userId, mediaId, mediaType) => {
    const response = await api.delete(`/users/${userId}/watchlist`, {
      data: { mediaId, mediaType }
    });
    return response.data;
  },

  checkInWatchlist: async (userId, mediaId, mediaType) => {
    const response = await api.get(`/users/${userId}/watchlist/check`, {
      params: { mediaId, mediaType }
    });
    return response.data;
  }
};

const statsRequests = {
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  getUserActivity: async (userId, limit = 10) => {
    const response = await api.get(`/users/${userId}/activity`, {
      params: { limit }
    });
    return response.data;
  }
};

// Exportação unificada
export const API = {
  ...tmdbRequests,
  auth: authRequests,
  user: userRequests,
  watchlist: watchlistRequests,
  stats: statsRequests
};