// src/components/courses/LessonPlayerComponent.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import useLessonContent from '../../hooks/useLessonContent';
import LessonSidebar from './LessonSidebar'; // Component for navigation
import ResourceRenderer from './ResourceRenderer'; // Component for displaying content

const LessonPlayerComponent = () => {
    // Get courseId and optional lessonId from URL parameters
    const { courseId, lessonId } = useParams();
    
    const {
        courseData,
        currentLesson,
        setCurrentLesson,
        isLoading,
        error,
        markLessonComplete,
        isMarkingComplete
    } = useLessonContent(courseId, lessonId);

    if (isLoading) return <div className="loading-state">Loading Course...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!courseData) return <div className="alert alert-warning">Course not found or access denied.</div>;

    // Determine the main resource to display (e.g., the first video or document)
    const mainResource = currentLesson?.resources.find(r => r.resource_type !== 'QUIZ');
    
    return (
        <div className="lesson-player-page container-fluid p-0">
            <div className="row g-0">
                
                {/* --- 1. Sidebar Navigation --- */}
                <div className="col-md-3 lesson-sidebar bg-light border-end vh-100 overflow-auto">
                    <h3>{courseData.title}</h3>
                    <LessonSidebar 
                        lessons={courseData.lessons}
                        currentLessonId={currentLesson?.id}
                        onSelectLesson={setCurrentLesson}
                    />
                </div>
                
                {/* --- 2. Main Player Area --- */}
                <div className="col-md-9 main-player vh-100 overflow-auto p-4">
                    
                    {currentLesson ? (
                        <>
                            <h2>{currentLesson.title}</h2>
                            <hr />

                            {/* Resource Renderer: Handles video player, PDF viewer, etc. */}
                            {mainResource ? (
                                <ResourceRenderer resource={mainResource} />
                            ) : (
                                <div className="alert alert-info">No main content found for this lesson.</div>
                            )}

                            {/* Lesson Completion Button */}
                            <div className="d-flex justify-content-end mt-4">
                                <button
                                    className={`btn btn-${currentLesson.is_completed ? 'success' : 'primary'}`}
                                    onClick={() => markLessonComplete(currentLesson.id)}
                                    disabled={currentLesson.is_completed || isMarkingComplete}
                                >
                                    {isMarkingComplete ? 'Saving Progress...' : 
                                     currentLesson.is_completed ? 'Completed!' : 'Mark as Complete'}
                                </button>
                            </div>
                            
                            {/* --- 3. Communication Integration --- */}
                            <div className="mt-5">
                                <hr />
                                <h5>Lesson Discussion</h5>
                                {/* Integrate the Lesson-Specific Discussion Forum/Chat Component here */}
                                {/* This component connects to the WebSocket room: ws/chat/lesson/{currentLesson.id} */}
                                <p className="text-muted small">Live Q&A and discussion about this lesson content.</p>
                                {/* <LessonDiscussionComponent lessonId={currentLesson.id} /> */}
                            </div>
                        </>
                    ) : (
                        <div className="alert alert-info">Please select a lesson from the sidebar.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default LessonPlayerComponent;