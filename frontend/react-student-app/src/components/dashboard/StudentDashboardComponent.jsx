// src/components/dashboard/StudentDashboardComponent.jsx (Conceptual)

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentProgress } from '../../hooks/useStudentProgress';
import { Link } from 'react-router-dom';
import AnnouncementFeedComponent from '../announcements/AnnouncementFeedComponent';
// Assuming the AnnouncementFeedComponent is implemented

const StudentDashboardComponent = () => {
    const { user, isParent } = useAuth();
    const children = user?.children || [];
    const { summary, isLoading } = useStudentProgress();

    if (isLoading) return <div className="loading-spinner">Loading Dashboard...</div>;
    
    if (isParent) {
        return (
            <div className="parent-dashboard container my-5">
                <h1>Welcome, Parent of {children.length} student(s)!</h1>
                <p className="lead">Manage reports and communication for your child(ren).</p>
                
                {children.map(child => (
                    <div key={child.id} className="mt-4">
                        <h3>Child: {child.username}</h3>
                        {/* Render the ReportCardView for this specific child */}
                        <ReportCardView targetUserId={child.id} targetUserName={child.username} />
                        {/* Optionally include a link to message the child's teacher */}
                    </div>
                ))}
            </div>
        );
    }
    // Default summary for new users or if the API fails
    const safeSummary = summary || { 
        overall_progress_percent: 0, 
        in_progress_courses: [] 
    };

    return (
        <div className="student-dashboard container my-5">
            <h1 className="mb-4">Welcome back, {user?.username || 'Learner'}!</h1>

            <div className="row">
                {/* ---------------------------------------------------- */}
                {/* COLUMN 1: Progress & Active Courses */}
                {/* ---------------------------------------------------- */}
                <div className="col-md-8">
                    <div className="card mb-4 p-4 shadow-sm">
                        <h4>Your Learning Progress</h4>
                        <div className="progress-bar-area mb-3">
                            <div className="progress" style={{ height: '30px' }}>
                                <div 
                                    className="progress-bar bg-success" 
                                    role="progressbar" 
                                    style={{ width: `${safeSummary.overall_progress_percent}%` }}
                                    aria-valuenow={safeSummary.overall_progress_percent} 
                                    aria-valuemin="0" 
                                    aria-valuemax="100"
                                >
                                    {safeSummary.overall_progress_percent}% Complete
                                </div>
                            </div>
                        </div>

                        <h5 className="mt-4">Currently Studying ({safeSummary.in_progress_courses.length})</h5>
                        {safeSummary.in_progress_courses.length === 0 ? (
                            <p>You are not actively taking any courses. <Link to="/catalog">Browse courses</Link> to get started!</p>
                        ) : (
                            safeSummary.in_progress_courses.slice(0, 5).map(course => (
                                <div key={course.id} className="active-course-card p-3 my-2 border rounded">
                                    <strong>{course.title}</strong>
                                    <p className="text-muted mb-1" style={{fontSize: '0.9em'}}>
                                        Last seen: {course.last_lesson_title}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="progress flex-grow-1 me-3" style={{ height: '10px' }}>
                                            <div className="progress-bar" style={{ width: `${course.course_progress_percent}%` }}></div>
                                        </div>
                                        <Link 
                                            to={`/learn/${course.id}/${course.last_lesson_order}`} 
                                            className="btn btn-sm btn-primary"
                                        >
                                            Continue ({course.course_progress_percent}%)
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* COLUMN 2: Announcements & Quick Links */}
                {/* ---------------------------------------------------- */}
                <div className="col-md-4">
                    
                    {/* Integrated Component: Announcement Feed */}
                    <div className="card mb-4 p-3 shadow-sm">
                        <h5 className="card-title">Recent Announcements</h5>
                        <AnnouncementFeedComponent />
                    </div>

                    {/* Quick Links */}
                    <div className="card p-3 shadow-sm">
                        <h5 className="card-title">Quick Actions</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/catalog">Browse Full Catalog</Link></li>
                            <li className="mb-2"><Link to="/chat/global">Join Global Chat</Link></li>
                            <li className="mb-2"><Link to="/profile">View Profile & Grades</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <ReportCardView /> {/* Renders for the logged-in student */}
        </div>
    );
};
export default StudentDashboardComponent;
