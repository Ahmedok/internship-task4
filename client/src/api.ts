import axios, { type AxiosError } from 'axios';

const api = axios.create({
    baseURL: '/api',
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
        const requestUrl = error.config?.url;
        // Stopping the refresh if on the front
        if (requestUrl && (requestUrl.includes('/login') || requestUrl.includes('/register'))) {
            return Promise.reject(error);
        }
        // If user is no longer with us...
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.clear();
            sessionStorage.setItem('userBlocked', 'true');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default api;
