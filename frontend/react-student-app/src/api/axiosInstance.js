// src/api/axiosInstance.js (Conceptual React File)

import axios from 'axios';

// 1. Create a base instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Add Request Interceptor: Inject Access Token
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Add Response Interceptor: Handle Token Refresh (401 Error)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Check if the error is 401 (Unauthorized) and we haven't tried to refresh yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // Call Django Djoser Refresh Endpoint
                    const response = await axios.post('http://localhost:8000/auth/jwt/refresh/', {
                        refresh: refreshToken,
                    });
                    
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    
                    // Update the header of the original request and re-send it
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return axiosInstance(originalRequest);

                } catch (refreshError) {
                    // Refresh failed (refresh token is also expired/invalid)
                    console.error("Token refresh failed. Logging out.");
                    localStorage.clear();
                    window.location.href = '/login'; // Redirect to React login page
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;