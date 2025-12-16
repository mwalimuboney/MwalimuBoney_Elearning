// src/hooks/useSmartSearch.js
const useSmartSearch = (scope, courseId) => {
    // ... state and API logic ...
    
    const search = async (query) => {
        let endpoint = '/search/public/';
        if (scope === 'course' && courseId) {
            endpoint = `/search/course/${courseId}/content/`;
        }
        // ... call axiosInstance.get(endpoint + q) ...
    };
    // ... return results, search function ...
};