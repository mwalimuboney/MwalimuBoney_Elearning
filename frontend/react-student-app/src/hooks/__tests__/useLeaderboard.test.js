// src/hooks/__tests__/useLeaderboard.test.js

import { renderHook, waitFor } from '@testing-library/react-hooks';
import useLeaderboard from '../useLeaderboard';
import axiosInstance from '../../api/axiosInstance';

jest.mock('../../api/axiosInstance');

describe('useLeaderboard', () => {
    
    const mockRankings = [
        { user_id: 1, username: 'Alice', xp: 500, level: 5 },
        { user_id: 2, username: 'Bob', xp: 400, level: 4 }
    ];

    test('fetches leaderboard data and sets loading state correctly', async () => {
        // Mock the successful API response
        axiosInstance.get.mockResolvedValue({ data: mockRankings });
        
        const { result, waitForNextUpdate } = renderHook(() => useLeaderboard());

        // 1. Initial state check
        expect(result.current.isLoading).toBe(true);
        expect(result.current.rankings).toEqual([]);
        
        // Wait for the data fetch to complete
        await waitForNextUpdate(); 
        
        // 2. Final state check
        expect(result.current.isLoading).toBe(false);
        expect(result.current.rankings).toEqual(mockRankings);
        expect(axiosInstance.get).toHaveBeenCalledWith('/gamification/leaderboard/');
    });
    
    test('handles API error gracefully', async () => {
        // Mock the API response to be a rejection (failure)
        axiosInstance.get.mockRejectedValue(new Error('Network Error'));
        
        const { result, waitForNextUpdate } = renderHook(() => useLeaderboard());
        
        await waitForNextUpdate();
        
        // Check state after error
        expect(result.current.isLoading).toBe(false);
        expect(result.current.rankings).toEqual([]); // Still returns empty array
        // In a real app, you might also check an 'error' state, but this verifies stability
    });
});