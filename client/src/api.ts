import axios, { type AxiosError } from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response, // Success
    (error: AxiosError) => {
        // If user is no longer with us...
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
