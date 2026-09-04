// API base configuration
const API_BASE = '/api/v1';

// Auth token management
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// API client with auth headers
const apiClient = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data) => apiClient('/user/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: async (data) => {
    const response = await apiClient('/user/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },
  
  getProfile: () => apiClient('/user/me'),
  
  updateProfile: (data) => apiClient('/user/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  logout: () => {
    removeToken();
    return Promise.resolve();
  },
};

// Farm API
export const farmAPI = {
  list: async () => {
    const response = await apiClient('/farm');
    return response.farms || [];
  },
  
  get: (id) => apiClient(`/farm/${id}`),
  
  create: (data) => apiClient('/farm', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiClient(`/farm/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiClient(`/farm/${id}`, {
    method: 'DELETE',
  }),
};

// Recommendation API
export const recommendationAPI = {
  get: (farmId, priority = 'profit') => 
    apiClient(`/recommendation/farms/${farmId}?priority=${priority}`),
  
  getHistory: (farmId) => apiClient(`/recommendation/farms/${farmId}/history`),
};

// Market API
export const marketAPI = {
  getPrice: (commodity) => apiClient(`/market/${commodity}`),
  
  getPrices: (state, crop) => {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (crop) params.append('crop', crop);
    return apiClient(`/market/prices?${params.toString()}`);
  },
  
  getForecast: (commodity, days = 30) => 
    apiClient(`/ml/forecast/${commodity}?days=${days}`),
};

// ML API
export const mlAPI = {
  getRecommendations: (farmId, priority = 'profit') => 
    apiClient(`/recommendation/farms/${farmId}?priority=${priority}`),
  
  getForecast: (commodity, days = 30) => 
    apiClient(`/ml/forecast/${commodity}?days=${days}`),
  
  getWeatherForecast: (latitude, longitude) => 
    apiClient(`/ml/weather?lat=${latitude}&lon=${longitude}`),
};

// Voice API
export const voiceAPI = {
  processCommand: (query, context = {}) => 
    apiClient('/voice/process', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    }),
  
  processFarmQuery: (query, farmId = null) => 
    apiClient('/voice/farm-query', {
      method: 'POST',
      body: JSON.stringify({ query, farmId }),
    }),
  
  processMarketQuery: (query, crop = null, state = null) => 
    apiClient('/voice/market-query', {
      method: 'POST',
      body: JSON.stringify({ query, crop, state }),
    }),
};

export default apiClient;