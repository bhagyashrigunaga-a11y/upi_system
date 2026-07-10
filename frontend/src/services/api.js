// API Service - Handles all API calls
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (name, email, password, phone) =>
    apiClient.post('/auth/register', { name, email, password, phone }),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
};

// Transaction API calls
export const transactionAPI = {
  createTransaction: (merchant, amount, paymentMethod, description) =>
    apiClient.post('/transactions', { merchant, amount, paymentMethod, description }),
  getTransactions: (page = 1, limit = 10, category, startDate, endDate) =>
    apiClient.get('/transactions', {
      params: { page, limit, category, startDate, endDate },
    }),
  getStats: () => apiClient.get('/transactions/stats/monthly'),
  updateTransaction: (id, data) => apiClient.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => apiClient.delete(`/transactions/${id}`),
};

// AI API calls
export const aiAPI = {
  predictExpense: () => apiClient.get('/ai/predict'),
  detectFraud: () => apiClient.post('/ai/detect-fraud'),
  getFraudAlerts: () => apiClient.get('/ai/fraud-alerts'),
  updateFraudAlertStatus: (id, status) =>
    apiClient.put(`/ai/fraud-alerts/${id}`, { status }),
  generateInsights: () => apiClient.get('/ai/insights'),
  getBudgetRecommendations: () => apiClient.get('/ai/budget-recommendations'),
};

export default apiClient;
