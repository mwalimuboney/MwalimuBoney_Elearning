// src/components/auth/VerificationPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Used for the non-protected verification endpoint
import { useAuth } from '../../context/AuthContext';

const BASE_AUTH_URL = 'http://localhost:8000/auth'; 

const VerificationPage = () => {
    const [emailCode, setEmailCode] = useState('');
    const [phoneCode, setPhoneCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Get login function to log the user in immediately after successful verification
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Get identifier (e.g., username or a verification token) from URL state/params
    // ASSUMPTION: The registration component passed the username (or a token) via state.
    const username = location.state?.username; 
    
    // Safety check: ensure we have an identifier to verify
    useEffect(() => {
        if (!username) {
            setError("Missing registration context. Please register again.");
            // Or navigate back to the registration page: navigate('/register');
        }
    }, [username, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!username) {
            setError("Cannot verify: User identifier is missing.");
            setIsSubmitting(false);
            return;
        }

        try {
            // 2. API Call to the Verification Endpoint
            const payload = {
                username: username, // Identify which user to activate
                email_code: emailCode,
                phone_code: phoneCode,
            };

            // Endpoint: POST /api/auth/verify/ 
            const verificationResponse = await axios.post(`${BASE_AUTH_URL}/verify/`, payload);
            
            // 3. Verification Successful: Log the user in immediately
            // The API should ideally return the JWT tokens OR we log in using stored credentials.
            
            // OPTION A: If the API returns tokens directly upon success
            const { access, refresh } = verificationResponse.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            // Then redirect to the profile loading/dashboard flow
            navigate('/dashboard', { replace: true });

            // OPTION B: If you need to re-login (less ideal, but works if tokens aren't returned)
            // Note: This requires storing the password hash temporarily, which is a bad security practice.
            // Rely on OPTION A: Backend returning the JWTs is the most secure approach.

        } catch (error) {
            setIsSubmitting(false);
            const errorMessage = error.response?.data?.detail || "Verification failed. Check codes and try again.";
            setError(errorMessage);
        }
    };

    return (
        <div className="verification-container">
            <div className="verification-card">
                <h2>Account Verification</h2>
                <p>Please enter the codes sent to your registered email and phone number.</p>
                
                {username && <p className="text-muted small">Verifying account for: <strong>{username}</strong></p>}
                
                <form onSubmit={handleSubmit}>
                    
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="emailCode">Email Verification Code</label>
                        <input
                            type="text"
                            id="emailCode"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            required
                            maxLength={6}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phoneCode">Phone/SMS Verification Code</label>
                        <input
                            type="text"
                            id="phoneCode"
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            required
                            maxLength={6}
                        />
                    </div>
                    
                    <button type="submit" disabled={isSubmitting || !username}>
                        {isSubmitting ? 'Verifying...' : 'Verify Account'}
                    </button>
                    
                    <p className="mt-3 text-center">
                        <a href="/resend-codes">Resend Codes</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default VerificationPage;