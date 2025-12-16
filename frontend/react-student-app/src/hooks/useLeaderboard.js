// src/hooks/useLeaderboard.js (Conceptual Hook)

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';


const useLeaderboard = () => {
    const [rankings, setRankings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        axiosInstance.get('/gamification/leaderboard/')
            .then(response => {
                // The response is already scoped to the user's school by the backend
                setRankings(response.data);
            })
            .catch(err => console.error("Failed to load leaderboard:", err))
            .finally(() => setIsLoading(false));
    }, []);

    return { rankings, isLoading };
};
export default useLeaderboard;