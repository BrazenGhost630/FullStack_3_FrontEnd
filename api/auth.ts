import axios from 'axios';

// URL del BFF (Backend For Frontend) - puerto 8085
const API_URL = 'http://bc-ms-clima-476486976.us-east-1.elb.amazonaws.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email: string, password: string) => {
  try {
    console.log('Intentando login con:', { email, password: '***' });
    console.log('URL completa:', `${API_URL}/auth/login`);
    // The endpoint is /auth/login based on your AuthController
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Login failed - Status:', error.response?.status);
      console.error('Login failed - Data:', error.response?.data);
      console.error('Login failed - Message:', error.message);
    } else {
      console.error('Login failed:', error);
    }
    throw error;
  }
};
