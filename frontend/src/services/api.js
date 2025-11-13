import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BANANA_API = process.env.REACT_APP_BANANA_API || 'https://marcconrad.com/uob/banana/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Scores API
export const scoresAPI = {
  submitScore: async (scoreData) => {
    const response = await api.post('/scores', scoreData);
    return response.data;
  },
  
  getLeaderboard: async (limit = 50, page = 1) => {
    const response = await api.get(`/scores/leaderboard?limit=${limit}&page=${page}`);
    return response.data;
  },
  
  getUserScores: async (userId) => {
    const response = await api.get(`/scores/user/${userId}`);
    return response.data;
  },
  
  getTopPlayers: async (limit = 10) => {
    const response = await api.get(`/scores/top-players?limit=${limit}`);
    return response.data;
  },
};

// Banana Math API
export const bananaAPI = {
  getQuestion: async () => {
    try {
      const response = await axios.get(`${BANANA_API}?task=math`, {
        params: {
          // Add timestamp to prevent caching
          _t: new Date().getTime()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching banana question:', error);
      throw error;
    }
  },
};

export default api;