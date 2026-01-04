// src/App.jsx (Conceptual React Router Setup)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import VerificationPage from './components/auth/VerificationPage';

// Import all major components
import CourseCatalogComponent from './components/courses/CourseCatalogComponent';
import StudentDashboardComponent from './components/dashboard/StudentDashboardComponent';
import LessonPlayerComponent from './components/learn/LessonPlayerComponent';
import AssessmentWrapper from './components/assessments/AssessmentWrapper'; 
import GlobalChatComponent from './components/chat/GlobalChatComponent';

// --- Reusable Route Guards ---

// Checks if logged in
const PrivateRoute = ({ element: Element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="loading-app">Loading Application...</div>;
    return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

// Checks if user is NOT an Instructor (Handles cross-platform navigation)
const StudentGate = ({ element: Element }) => {
    const { isInstructorOrAdmin, isLoading } = useAuth();
    if (isLoading) return <div className="loading-gate">Loading User Role...</div>;
    
    // Redirect instructors to the Angular domain
    if (isInstructorOrAdmin) {
        // NOTE: This relies on the live setup redirecting to the Angular domain
        window.location.href = 'http://instructor.yourdomain.com/instructor/dashboard'; 
        return null; 
    }
    return <Element />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public/Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegistrationPage />} />
                    <Route path="/verify-account" element={<VerificationPage />} />
                    
                    {/* Core Student Routes (Protected by Login AND Role Check) */}
                    <Route path="/" element={<PrivateRoute element={StudentGate} />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<StudentDashboardComponent />} />
                        <Route path="catalog" element={<CourseCatalogComponent />} />
                        <Route path="course/:id" element={<CourseDetailComponent />} />
                        <Route path="learn/:courseId/:lessonOrder" element={<LessonPlayerComponent />} />
                        <Route path="assessment/:id/start" element={<AssessmentWrapper />} />
                        <Route path="chat/global" element={<GlobalChatComponent />} />
                        {/* More routes for profile, grades, etc. */}
                    </Route>
                    
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
export default App;