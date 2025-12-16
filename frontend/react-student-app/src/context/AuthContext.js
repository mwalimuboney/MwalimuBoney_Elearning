// src/context/AuthContext.js (Conceptual React Context)

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Use standard axios for initial login/refresh
import axiosInstance from '../api/axiosInstance'; // Use the custom instance for protected calls

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores { username, role, ... }
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Profile Fetch (Requires token, uses protected instance) ---
    const fetchUserProfile = async () => {
        try {
            // Endpoint: /auth/users/me/ (Uses the interceptor for the token)
            const response = await axiosInstance.get('/auth/users/me/'); 
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Profile load failed, tokens likely invalid.");
            // If fetching profile fails, clear storage
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Component Lifecycle: Load on Mount ---
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUserProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    // --- Auth Actions ---
    const login = async (credentials) => {
        setIsLoading(true);
        // Endpoint: /auth/jwt/create/ (Does NOT need the interceptor)
        const response = await axios.post('http://localhost:8000/auth/jwt/create/', credentials);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        await fetchUserProfile();
        // Redirect logic handled by the component using useAuth()
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    // --- Role Check ---
    const isStudent = user?.role === 'STUDENT';
    const isInstructorOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMINISTRATOR';

    const contextValue = {
        user,
        isAuthenticated,
        isLoading,
        isStudent,
        isInstructorOrAdmin,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};