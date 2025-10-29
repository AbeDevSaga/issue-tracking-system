import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor → attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);


api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
   
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials: { user_name: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (userData: any) =>
    api.put('/auth/profile', userData),
  changePassword: (passwordData: any) =>
    api.put('/auth/change-password', passwordData),
};

export default api;