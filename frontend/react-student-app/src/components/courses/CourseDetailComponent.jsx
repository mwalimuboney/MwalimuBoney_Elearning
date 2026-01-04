// src/components/courses/CourseDetailComponent.jsx (Conceptual)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ResourceDownloadList from './ResourceDownloadList'; // Nested component

const CourseDetailComponent = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Endpoint: GET /api/courses/{id}/ (Should include nested lessons and enrollment status)
        axiosInstance.get(`/courses/${id}/`)
            .then(response => {
                setCourse(response.data);
                // Assume the API returns an 'is_enrolled' field
                setIsEnrolled(response.data.is_enrolled || false); 
            })
            .catch(error => console.error("Failed to load course details", error))
            .finally(() => setLoading(false));
    }, [id]);
    
    // --- Handlers ---
    const handleEnrollment = async () => {
        try {
            // Assume a custom endpoint for enrollment
            await axiosInstance.post(`/courses/${id}/enroll/`); 
            setIsEnrolled(true);
            alert("Enrollment successful!");
        } catch (error) {
            alert("Enrollment failed. Please try again.");
        }
    };
    
    if (loading) return <div>Loading Course...</div>;
    if (!course) return <div>Course Not Found.</div>;

    return (
        <div className="course-detail container mt-5">
            <h1>{course.title}</h1>
            <p className="lead">{course.description}</p>
            <hr />

            {/* Access Gate */}
            <div className="access-gate mb-4">
                {!isEnrolled ? (
                    <button onClick={handleEnrollment} className="btn btn-success btn-lg">
                        Enroll Now
                    </button>
                ) : (
                    <Link 
                        to={`/learn/${course.id}/${course.lessons[0]?.order || 1}`} 
                        className="btn btn-primary btn-lg"
                    >
                        Start Course (Lesson 1)
                    </Link>
                )}
            </div>

            {/* Course Structure (Visible to everyone for browsing) */}
            <div className="row mt-5">
                <div className="col-md-8">
                    <h4>Course Curriculum</h4>
                    <ul className="list-group">
                        {course.lessons.map(lesson => (
                            <li key={lesson.order} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>Lesson {{lesson.order}}: {lesson.title}</span>
                                {isEnrolled && (
                                    <Link to={`/learn/${course.id}/${lesson.order}`} className="btn btn-sm btn-outline-primary">
                                        View
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Nested Resource List */}
                <div className="col-md-4">
                    <h4>Supplementary Resources</h4>
                    <ResourceDownloadList courseId={course.id} isEnrolled={isEnrolled} />
                </div>
            </div>
        </div>
    );
};
export default CourseDetailComponent;