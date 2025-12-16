// src/components/dashboard/ReportCardView.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useReportCard } from '../../hooks/useReportCard';
import moment from 'moment'; // Recommended library for handling dates

// Assuming the student ID is the logged-in user's ID
// For Parents, you would loop through the children's IDs

const ReportCardView = ({ targetUserId, targetUserName }) => {
    const { user, isStudent, isInstructorOrAdmin, isAuthenticated } = useAuth();
    const { downloadReport, isDownloading, downloadError } = useReportCard();

    // Default dates for the current school year
    const [startDate, setStartDate] = useState(moment().startOf('year').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().endOf('year').format('YYYY-MM-DD'));
    
    // Determine the user whose report card is being viewed
    const userId = targetUserId || user?.id; 
    const userName = targetUserName || user?.username;

    const handleDownload = () => {
        if (userId) {
            downloadReport(userId, userName, startDate, endDate);
        }
    };

    if (!isAuthenticated) return <p>Please log in to view reports.</p>;

    // Visibility and Gating: This view is accessible to the Student themselves, 
    // their Parent, or a School Administrator.
    const isParent = user?.role === 'PARENT';
    
    return (
        <div className="report-card-view card p-4 my-4 shadow-sm">
            <h4 className="card-title">{isParent ? `${userName}'s Report Card` : 'Your Report Card'}</h4>
            
            <p className="text-muted">Select the grading period to download the official report.</p>

            {downloadError && <div className="alert alert-danger">{downloadError}</div>}
            
            <div className="row g-3 align-items-end">
                <div className="col-md-4">
                    <label className="form-label">Start Date</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        disabled={isDownloading}
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">End Date</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        disabled={isDownloading}
                    />
                </div>
                <div className="col-md-4">
                    <button 
                        className="btn btn-primary w-100" 
                        onClick={handleDownload} 
                        disabled={isDownloading || !startDate || !endDate}>
                        {isDownloading ? 'Preparing PDF...' : 'Download Report Card'}
                    </button>
                </div>
            </div>

            <hr className="mt-4"/>
            <p className="small text-info">
                Note: Rankings and final grades are based on data available on the selected end date.
            </p>
        </div>
    );
};
export default ReportCardView;