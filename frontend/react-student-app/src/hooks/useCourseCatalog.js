// src/hooks/useCourseCatalog.js (Conceptual React Hook)

import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance'; 

const useCourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Endpoint: GET /api/courses/ (Django should filter this to ONLY show published courses)
        axios.get('/courses/')
            .then(response => {
                setCourses(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Failed to load course catalog", error);
                setIsLoading(false);
            });
    }, []);

    return { courses, isLoading };
};