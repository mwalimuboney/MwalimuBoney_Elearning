// src/components/courses/CourseCatalogComponent.jsx (Conceptual)

import React from 'react';
import { Link } from 'react-router-dom';
import { useCourseCatalog } from '../../hooks/useCourseCatalog'; 
import { useAuth } from '../../context/AuthContext';

const CourseCatalogComponent = () => {
    const { courses, isLoading } = useCourseCatalog();
    const { isAuthenticated } = useAuth(); // Needed for conditional login/enrollment messaging

    if (isLoading) {
        return <div className="loading-spinner">Loading Course Catalog...</div>;
    }
    
    return (
        <div className="catalog-page container">
            <h1 className="my-4">Explore Our Courses</h1>
            
            {/* Search and Filter Bar (Placeholder) */}
            <div className="search-bar mb-4">
                <input type="text" placeholder="Search by title or category..." className="form-control" />
            </div>

            <div className="course-grid row">
                {courses.map(course => (
                    <div key={course.id} className="col-md-4 mb-4">
                        <div className="course-card card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{course.title}</h5>
                                <p className="card-text text-muted">Instructor: {course.instructor_username || 'Admin'}</p>
                                <p className="card-text description">{course.description.substring(0, 100)}...</p>
                                
                                <Link to={`/course/${course.id}`} className="btn btn-primary mt-2">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/*  */}
        </div>
    );
};
export default CourseCatalogComponent;