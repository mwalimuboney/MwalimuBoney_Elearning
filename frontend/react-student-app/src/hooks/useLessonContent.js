// // src/hooks/useLessonContent.js (Conceptual React Hook)

// import { useState, useEffect } from 'react';
// import axiosInstance from '../api/axiosInstance';

// const useLessonContent = (courseId, lessonOrder) => {
//     const [lessons, setLessons] = useState([]);
//     const [currentLesson, setCurrentLesson] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         setIsLoading(true);
//         // Endpoint: GET /api/lessons/?course={courseId}
//         axiosInstance.get(`/lessons/?course=${courseId}&ordering=order`) // Assume Django orders by 'order'
//             .then(response => {
//                 const fetchedLessons = response.data;
//                 setLessons(fetchedLessons);
                
//                 // Find the specific lesson the student requested
//                 const lesson = fetchedLessons.find(l => l.order === parseInt(lessonOrder));
//                 setCurrentLesson(lesson || null); 
//             })
//             .catch(error => {
//                 console.error("Failed to load lesson content", error);
//             })
//             .finally(() => setIsLoading(false));
//     }, [courseId, lessonOrder]); 
    
//     // Logic to find the next/previous lesson IDs for navigation
//     const currentIndex = lessons.findIndex(l => l.order === parseInt(lessonOrder));
//     const nextLesson = lessons[currentIndex + 1] || null;
//     const prevLesson = lessons[currentIndex - 1] || null;

//     return { currentLesson, isLoading, nextLesson, prevLesson };
// };



// src/hooks/useLessonContent.js

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const useLessonContent = (courseId, initialLessonId) => {
    const { user } = useAuth();
    const [courseData, setCourseData] = useState(null); // Full course structure
    const [currentLesson, setCurrentLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);

    // Fetch the detailed course data including all lessons and resources
    const fetchCourseStructure = async () => {
        if (!user || !courseId) return;

        setIsLoading(true);
        try {
            // Backend endpoint should return nested Lessons and Resources,
            // and check if the user is enrolled.
            const response = await axiosInstance.get(`/courses/${courseId}/detail/`);
            const data = response.data;
            setCourseData(data);
            
            // Set the current lesson based on initial ID or the first one
            const firstLesson = data.lessons.find(l => l.id === initialLessonId) || data.lessons[0];
            setCurrentLesson(firstLesson);

        } catch (err) {
            console.error("Failed to load course structure:", err);
            setError("Cannot load course content. Are you enrolled?");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Progress Tracking ---
    const markLessonComplete = async (lessonId) => {
        setIsMarkingComplete(true);
        try {
            // POST to progress endpoint
            await axiosInstance.post(`/progress/lesson-complete/`, {
                lesson_id: lessonId,
                course_id: courseId
            });

            // Optimistically update the local state to show the lesson is done
            if (currentLesson && currentLesson.id === lessonId) {
                setCurrentLesson(prev => ({ ...prev, is_completed: true }));
            }
            
            // Trigger gamification/XP update success notification here
            
        } catch (err) {
            console.error("Failed to mark lesson complete:", err);
            setError("Failed to save progress.");
        } finally {
            setIsMarkingComplete(false);
        }
    };

    useEffect(() => {
        fetchCourseStructure();
    }, [courseId, user]);

    return {
        courseData,
        currentLesson,
        setCurrentLesson,
        isLoading,
        error,
        markLessonComplete,
        isMarkingComplete
    };
};
export default useLessonContent;