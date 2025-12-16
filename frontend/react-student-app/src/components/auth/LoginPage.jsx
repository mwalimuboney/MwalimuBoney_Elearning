// src/components/auth/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get the login function and user state from the context
    const { login, isAuthenticated, user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Prevent direct access if already authenticated
    if (isAuthenticated && !isLoading) {
        // Redirection logic should be simple here, as the StudentGate in App.jsx
        // handles the complex redirect for Instructors.
        if (user?.role === 'STUDENT') {
             return navigate('/dashboard', { replace: true });
        }
    }
    
    // Handle loading state while context attempts initial profile fetch
    if (isLoading) {
        return <div className="loading-state">Checking session...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login({ username, password });

        if (result.success) {
            // Context has updated isAuthenticated and user state. 
            // We now wait for the component to re-render, where the logic at the top 
            // (or the PrivateRoute/StudentGate guard in App.jsx) will handle redirection.
            // For a smooth user experience, we can force a small delay or rely on the gate.
            
            // Re-check the state immediately after successful login
            const loggedInUser = result.user || user; // Use the updated user object if available
            
            if (loggedInUser?.role === 'STUDENT') {
                navigate('/dashboard', { replace: true });
            } else if (loggedInUser?.role === 'TEACHER' || loggedInUser?.role === 'ADMINISTRATOR') {
                 // For Instructors, redirect to the Angular domain base path.
                 // This must match the actual URL of your Angular app.
                 window.location.href = 'http://instructor.yourdomain.com/instructor/dashboard';
            }
            
        } else {
            setError(result.error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Student & Instructor Login</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                    
                    <p className="mt-3 text-center">
                        Don't have an account? <a href="/register">Register Here</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;