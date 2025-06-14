import axios from 'axios';
import store from '@/store';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add loading state
    store.commit('setLoading', true);
    return config;
  },
  error => {
    // Handle request error
    store.commit('setLoading', false);
    store.commit('setError', 'Failed to send request');
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Remove loading state
    store.commit('setLoading', false);
    return response;
  },
  error => {
    // Remove loading state
    store.commit('setLoading', false);

    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const message = error.response.data.message || 'An error occurred';
      store.commit('setError', message);
    } else if (error.request) {
      // The request was made but no response was received
      store.commit('setError', 'No response from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      store.commit('setError', 'Failed to send request');
    }

    return Promise.reject(error);
  }
);

export default api;
