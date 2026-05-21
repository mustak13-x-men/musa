import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  const response = await apiClient.post('/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/login', credentials);
  return response.data;
};

export const fetchExpenses = async (params = {}) => {
  const response = await apiClient.get('/expenses', { params });
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await apiClient.post('/add-expense', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await apiClient.put(`/update-expense/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await apiClient.delete(`/delete-expense/${id}`);
  return response.data;
};

export const fetchGoals = async () => {
  const response = await apiClient.get('/goals');
  return response.data;
};

export const createGoal = async (goalData) => {
  const response = await apiClient.post('/add-goal', goalData);
  return response.data;
};

export const updateGoal = async (id, goalData) => {
  const response = await apiClient.put(`/update-goal/${id}`, goalData);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await apiClient.delete(`/delete-goal/${id}`);
  return response.data;
};

export const getAISuggestions = async () => {
  const response = await apiClient.post('/ai/analyze');
  return response.data;
};

export const getAIPredictions = async () => {
  const response = await apiClient.post('/ai/predict');
  return response.data;
};

export default apiClient;
