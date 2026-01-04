// src/hooks/useStudentProgress.js (Conceptual React Hook)

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// Define the shape of the progress data returned by the API
interface StudentProgressSummary {
  total_courses: number;
  completed_courses: number;
  overall_progress_percent: number; // e.g., 65
  in_progress_courses: {
    id: number;
    title: string;
    last_lesson_order: number;
    last_lesson_title: string;
    course_progress_percent: number;
  }[];
}

const useStudentProgress = () => {
    const [summary, setSummary] = useState<StudentProgressSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Endpoint: GET /api/progress/ (The custom Django endpoint you designed)
        axiosInstance.get('/progress/') 
            .then(response => {
                setSummary(response.data);
            })
            .catch(error => {
                console.error("Failed to load student progress:", error);
                setSummary(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { summary, isLoading };
};