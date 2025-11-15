import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Banana Math API - Using Backend Proxy (No CORS Issues!)
export const bananaAPI = {
  getQuestion: async () => {
    try {
      console.log('🍌 Requesting banana question from backend...');
      
      // Use backend proxy to avoid CORS issues
      const response = await api.get('/banana/question');
      
      console.log('✅ Banana question received:', response.data);
      
      // Validate response
      if (!response.data || !response.data.question || typeof response.data.solution !== 'number') {
        throw new Error('Invalid response format from banana API');
      }
      
      return {
        question: response.data.question,
        solution: response.data.solution
      };
    } catch (error) {
      console.error('❌ Error fetching banana question:', error);
      
      // If backend proxy fails, try direct call as fallback (may have CORS issues)
      console.log('⚠️ Trying direct API call as fallback...');
      try {
        const directResponse = await axios.get('https://marcconrad.com/uob/banana/api.php', {
          params: {
            task: 'math',
            _t: new Date().getTime()
          }
        });
        
        console.log('✅ Direct API response:', directResponse.data);
        
        return {
          question: directResponse.data.question,
          solution: directResponse.data.solution
        };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw error;
      }
    }
  },
};

export default api;