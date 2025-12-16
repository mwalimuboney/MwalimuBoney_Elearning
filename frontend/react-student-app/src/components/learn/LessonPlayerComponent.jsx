// src/components/learn/LessonPlayerComponent.jsx (Conceptual)

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonContent } from '../../hooks/useLessonContent';
// Assumes a component to safely render lesson content (e.g., using DOMPurify)
import LessonContentRenderer from './LessonContentRenderer'; 

const LessonPlayerComponent = () => {
    const { courseId, lessonOrder } = useParams();
    const navigate = useNavigate();
    
    // Get all necessary data and navigation controls from the hook
    const { currentLesson, isLoading, nextLesson, prevLesson } = useLessonContent(courseId, lessonOrder);

    // --- Navigation Logic ---
    const goToNext = () => {
        if (nextLesson) {
            // Check if the next item is an exam or the next lesson
            // ASSUMPTION: Exams are treated as part of the lesson sequence but lead to a different route
            if (nextLesson.is_exam) {
                // Assuming nextLesson contains the exam ID if it's an exam placeholder
                navigate(`/assessment/${nextLesson.exam_id}/start`);
            } else {
                navigate(`/learn/${courseId}/${nextLesson.order}`);
            }
        }
    };

    const goToPrevious = () => {
        if (prevLesson) {
            navigate(`/learn/${courseId}/${prevLesson.order}`);
        }
    };

    // --- Completion/Mark As Done Handler (Future feature) ---
    const markAsCompleted = () => {
        // API call: POST /api/lessons/{id}/complete/
        console.log(`Marking lesson ${currentLesson.id} as complete...`);
        // On success, you might automatically trigger goToNext()
    };
    
    if (isLoading) return <div>Loading Lesson...</div>;
    if (!currentLesson) return <div>Lesson not found or access denied.</div>;

    return (
        <div className="lesson-player container my-5">
            <h2 className="lesson-title">{currentLesson.title}</h2>
            <hr />

            {/* Content Display */}
            <div className="lesson-content mb-5 card p-4">
                {/* Renders the HTML/Markdown content safely */}
                <LessonContentRenderer content={currentLesson.content} />
            </div>

            {/* Action Bar (Completion and Navigation) */}
            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <button 
                    onClick={goToPrevious} 
                    disabled={!prevLesson}
                    className="btn btn-outline-secondary"
                >
                    &larr; Previous Lesson
                </button>
                
                {/* Completion Button */}
                <button 
                    onClick={markAsCompleted} 
                    className="btn btn-warning"
                >
                    Mark as Done
                </button>

                <button 
                    onClick={goToNext} 
                    disabled={!nextLesson}
                    className="btn btn-primary"
                >
                    {nextLesson?.is_exam ? 'Go to Exam' : 'Next Lesson &rarr;'}
                </button>
            </div>
            {/*  */}
        </div>
    );
};
export default LessonPlayerComponent;