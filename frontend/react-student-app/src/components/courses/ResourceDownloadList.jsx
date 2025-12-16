// src/components/courses/ResourceDownloadList.jsx (Conceptual)
// This fetches: GET /api/resources/?course={courseId}
const ResourceDownloadList = ({ courseId, isEnrolled }) => {
    // ... logic to fetch resources ...
    
    return (
        <ul className="list-unstyled">
            {isEnrolled ? (
                // Render actual download links using resource.file_url
                <p>Download links here...</p> 
            ) : (
                <p className="text-warning">Enroll to unlock resources.</p>
            )}
        </ul>
    );
};