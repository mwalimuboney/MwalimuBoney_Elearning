// src/components/auth/RegistrationPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useDebouncedUniquenessCheck from '../../hooks/useDebouncedUniquenessCheck';

const BASE_AUTH_URL = 'http://localhost:8000/auth'; 

const RegistrationPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT'); // Default to Student
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Integrate the custom hook for all unique fields
    const usernameState = useDebouncedUniquenessCheck('username', '');
    const emailState = useDebouncedUniquenessCheck('email', '');
    const phoneState = useDebouncedUniquenessCheck('phoneNumber', '');

    // Check overall client-side validity
    const isFormValid = 
        usernameState.value && usernameState.isUnique && !usernameState.isChecking &&
        emailState.value && emailState.isUnique && !emailState.isChecking &&
        phoneState.value && phoneState.isUnique && !phoneState.isChecking &&
        password.length >= 8; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!isFormValid) return;

        setIsSubmitting(true);

        try {
            // 1. Prepare Payload (Note: We use the final state values from the hooks)
            const payload = {
                username: usernameState.value,
                email: emailState.value,
                password: password,
                role: role,
                // ContactInfo payload for phone number
                contact_info: {
                    phone_number: phoneState.value,
                }
            };
            
            // 2. API Call to Djoser's User Creation Endpoint
            // Note: Your backend serializer must handle the nested contact_info creation
            await axios.post(`${BASE_AUTH_URL}/users/`, payload);
            
            // 3. Success: Redirect to Verification Page (Stage 2)
            // Pass the username via state for the verification page to use
            navigate('/verify-account', { state: { username: usernameState.value } });

        } catch (error) {
            setIsSubmitting(false);
            // Handle specific Django REST Framework errors (e.g., password too short)
            const errorData = error.response?.data;
            if (errorData?.username || errorData?.email) {
                // If a non-debounced uniqueness error slips through (race condition)
                setServerError("One or more fields are already in use or invalid.");
            } else if (errorData?.detail) {
                setServerError(errorData.detail);
            } else {
                setServerError("Registration failed. Please check your data.");
            }
        }
    };

    const renderValidationMessage = (state, fieldName) => {
        if (state.isChecking) {
            return <div className="text-warning">Checking availability...</div>;
        }
        if (!state.isUnique && state.error) {
            return <div className="text-danger">{state.error}</div>;
        }
        if (state.value && state.isUnique && !state.isChecking) {
            return <div className="text-success">Available!</div>;
        }
        return null;
    };
    
    // 

    return (
        <div className="registration-container">
            <form onSubmit={handleSubmit}>
                <h2>New User Registration</h2>
                {serverError && <div className="alert alert-danger">{serverError}</div>}

                {/* 1. Username Field */}
                <input
                    type="text"
                    placeholder="Username"
                    value={usernameState.value}
                    onChange={(e) => usernameState.setValue(e.target.value)}
                    required
                />
                {renderValidationMessage(usernameState, 'Username')}

                {/* 2. Email Field */}
                <input
                    type="email"
                    placeholder="Email Address"
                    value={emailState.value}
                    onChange={(e) => emailState.setValue(e.target.value)}
                    required
                />
                {renderValidationMessage(emailState, 'Email')}

                {/* 3. Phone Number Field */}
                <input
                    type="tel"
                    placeholder="Phone Number (+1234567890)"
                    value={phoneState.value}
                    onChange={(e) => phoneState.setValue(e.target.value)}
                    required
                />
                {renderValidationMessage(phoneState, 'Phone Number')}

                {/* 4. Password */}
                <input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                {/* 5. Role Selection */}
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="STUDENT">Register as Student</option>
                    <option value="TEACHER">Register as Teacher</option>
                </select>

                <button type="submit" disabled={isSubmitting || !isFormValid}>
                    {isSubmitting ? 'Registering...' : 'Register & Get Codes'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationPage;