// src/hooks/useDebouncedUniquenessCheck.js

import { useState, useEffect } from 'react';
import axios from 'axios'; 

const BASE_AUTH_URL = 'http://localhost:8000/auth'; 

const useDebouncedUniquenessCheck = (field, initialValue, debounceDelay = 500) => {
    const [value, setValue] = useState(initialValue);
    const [isChecking, setIsChecking] = useState(false);
    const [isUnique, setIsUnique] = useState(true);
    const [error, setError] = useState(null);

    // Effect to handle the debouncing and API call
    useEffect(() => {
        // Skip check if value is empty or hasn't changed
        if (!value) {
            setIsUnique(true);
            setIsChecking(false);
            return;
        }

        setIsChecking(true);
        setError(null);

        const handler = setTimeout(async () => {
            try {
                // Endpoint: GET /api/auth/check_unique/?field=email&value=...
                const response = await axios.get(`${BASE_AUTH_URL}/check_unique/`, {
                    params: { field, value }
                });
                
                // Set the result based on the API response
                if (response.data.exists) {
                    setIsUnique(false);
                    setError(`${field} is already in use.`);
                } else {
                    setIsUnique(true);
                }
            } catch (err) {
                // API error: Log but don't prevent registration
                console.error(`Error checking ${field} uniqueness:`, err);
                setError(`Could not verify ${field}.`);
                setIsUnique(true); 
            } finally {
                setIsChecking(false);
            }
        }, debounceDelay);

        // Cleanup function to clear the timeout if value changes before the delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, field, debounceDelay]);

    return { 
        value, 
        setValue, 
        isChecking, 
        isUnique, 
        error 
    };
};
export default useDebouncedUniquenessCheck;