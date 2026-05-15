import axios from 'axios';

// TODO: Replace with your actual API URL from AWS
const API_URL = 'http://localhost:8080'; 

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
