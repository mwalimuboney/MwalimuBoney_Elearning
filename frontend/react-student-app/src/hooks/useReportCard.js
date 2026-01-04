// src/hooks/useReportCard.js

import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { saveAs } from 'file-saver'; // Library for client-side file saving

const useReportCard = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    const downloadReport = async (studentId, studentName, startDate, endDate) => {
        setIsDownloading(true);
        setDownloadError(null);

        try {
            // 1. API Call: Must specify responseType: 'blob'
            const response = await axiosInstance.get(
                `/reports/student/${studentId}/report_card/`,
                {
                    params: { start: startDate, end: endDate },
                    responseType: 'blob', // IMPORTANT: Tells Axios to handle binary data
                }
            );

            // 2. Client-side file saving
            // The file name should match the Django Content-Disposition header, 
            // but we use a client-side name as a fallback.
            saveAs(response.data, `ReportCard_${studentName}_${endDate}.pdf`);

        } catch (error) {
            console.error("Report Download Failed:", error);
            // Attempt to read the error message from the blob if available
            const errorText = error.response?.data ? await error.response.data.text() : 'Download failed.';
            
            setDownloadError(errorText || 'You are not authorized to view this report.');
        } finally {
            setIsDownloading(false);
        }
    };

    return { downloadReport, isDownloading, downloadError };
};