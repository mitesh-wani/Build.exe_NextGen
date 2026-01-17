// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For development - replace with your computer's local IP
// To find your IP: Windows (ipconfig) | Mac/Linux (ifconfig)
const API_BASE_URL = 'http://192.168.137.217:3000/api'; // UPDATE THIS!

console.log('📡 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to request');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from server:', error.message);
    } else {
      console.error('❌ Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => {
    console.log('📤 Register request:', data);
    return api.post('/auth/register', data);
  },
  login: (data) => {
    console.log('📤 Login request:', data);
    return api.post('/auth/login', data);
  },
  logout: () => api.post('/auth/logout'),
};

// Issue APIs
export const issueAPI = {
  create: (data) => {
    console.log('📤 Create issue request');
    return api.post('/issues/create', data);
  },
  getUserIssues: (userId) => {
    console.log('📤 Get user issues:', userId);
    return api.get(`/issues/user/${userId}`);
  },
  getIssueById: (issueId) => {
    console.log('📤 Get issue by ID:', issueId);
    return api.get(`/issues/${issueId}`);
  },
  getNearbyIssues: (lat, lng, radius) => {
    console.log('📤 Get nearby issues:', lat, lng, radius);
    return api.get(`/issues/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },
};

// Notification APIs
export const notificationAPI = {
  registerToken: (token) => {
    console.log('📤 Register notification token');
    return api.post('/notifications/register', { token });
  },
};

export default api;