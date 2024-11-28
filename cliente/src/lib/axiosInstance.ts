import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Cambia esta URL por la de tu API
  withCredentials: true,  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a cada solicitud
// axiosInstance.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token'); // O donde guardes el token
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//         return config;
//     }, (error) => {
//         return Promise.reject(error);
// });

export default axiosInstance;
