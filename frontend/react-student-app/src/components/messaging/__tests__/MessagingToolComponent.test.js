// src/components/messaging/__tests__/MessagingToolComponent.test.js

import { render, screen, fireEvent } from '@testing-library/react';
import MessagingToolComponent from '../MessagingToolComponent';
// Mock the AuthContext to control user role
import { useAuth } from '../../../context/AuthContext'; 

// Mock the API service to prevent actual network calls
jest.mock('../../../hooks/useMessagingService', () => ({
    useMessagingService: () => ({
        // Mock necessary service functions/data
        teacherClasses: [{ id: 1, name: 'Math 101' }],
        sendScopedMessage: jest.fn(),
        isLoading: false
    })
}));

// Mock the Auth hook
jest.mock('../../../context/AuthContext');

describe('MessagingToolComponent Role-Based Rendering', () => {

    test('ADMINISTRATOR sees the Global Public scope option', async () => {
        // Set up the mock user context as an ADMINISTRATOR
        useAuth.mockReturnValue({ userRole: 'ADMINISTRATOR', isAuthenticated: true });

        render(<MessagingToolComponent />);

        // Check if the 'Global Public' radio button is present
        const globalOption = await screen.findByLabelText(/Global: Public Announcement/i);
        expect(globalOption).toBeInTheDocument();
    });

    test('TEACHER does NOT see the Global Public scope option', () => {
        // Set up the mock user context as a TEACHER
        useAuth.mockReturnValue({ userRole: 'TEACHER', isAuthenticated: true });

        render(<MessagingToolComponent />);
        
        // Check that the 'Global Public' radio button is absent
        const globalOption = screen.queryByLabelText(/Global: Public Announcement/i);
        expect(globalOption).not.toBeInTheDocument();
        
        // Check that the standard 'My School' option is present
        expect(screen.getByLabelText(/My School: Internal Announcement/i)).toBeInTheDocument();
    });
});