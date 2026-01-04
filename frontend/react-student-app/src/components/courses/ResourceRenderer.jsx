// src/components/courses/ResourceRenderer.jsx (Utility Component)

const ResourceRenderer = ({ resource }) => {
    
    // Determine the type based on file extension or a dedicated API field
    const resourceType = resource.file_url.split('.').pop().toLowerCase(); 

    if (resourceType === 'mp4' || resourceType === 'webm') {
        return (
            <div className="video-player-container ratio ratio-16x9">
                <video controls src={resource.file_url} className="w-100" />
            </div>
        );
    } 
    
    if (resourceType === 'pdf') {
        return (
            <div className="pdf-viewer-container">
                <iframe 
                    src={resource.file_url} 
                    title={resource.title} 
                    width="100%" 
                    height="600px" 
                    frameBorder="0"
                />
            </div>
        );
    } 
    
    if (resourceType === 'link') {
        return (
            <div className="external-link-container alert alert-warning">
                <p>External Resource: <a href={resource.file_url} target="_blank" rel="noopener noreferrer">{resource.title}</a></p>
            </div>
        );
    }

    // Default for documents or unsupported formats
    return (
        <div className="alert alert-secondary">
            <p>Download Resource: <a href={resource.file_url} download>{resource.title}</a></p>
            <p className="small text-danger">Antivirus Status: {resource.antivirus_status}</p> 
        </div>
    );
};
export default ResourceRenderer;