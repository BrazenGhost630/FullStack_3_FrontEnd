import axios from 'axios';

// URL del BFF (Backend For Frontend) - puerto 8085
const API_URL = 'http://localhost:8085/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email: string, password: string) => {
  try {
    // The endpoint is /auth/login based on your AuthController
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
