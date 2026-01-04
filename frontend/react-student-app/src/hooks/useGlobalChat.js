// src/hooks/useGlobalChat.js (Conceptual React Hook)

import { useState, useEffect, useRef, useCallback } from 'react';

// Define the WebSocket endpoint (must match your Django Channels routing)
const CHAT_URL = 'ws://localhost:8000/ws/chat/global/'; 

// Define Message Structure (must match Django's payload)
interface ChatMessage {
    user: string;
    timestamp: string;
    message: string;
}

export const useGlobalChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // useRef to hold the WebSocket object, allowing it to persist across renders
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // 1. Establish connection
        ws.current = new WebSocket(CHAT_URL);
        
        ws.current.onopen = () => {
            console.log('WebSocket connected.');
            setIsConnected(true);
            setError(null);
        };
        
        // 2. Handle incoming messages
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Assuming the message payload is { type: "chat_message", message: { user, timestamp, message } }
            if (data.type === 'chat_message' && data.message) {
                // Prepend new messages to the list for easier scrolling behavior
                setMessages(prev => [...prev, data.message]);
            }
        };

        // 3. Handle connection close or errors
        ws.current.onclose = (event) => {
            console.log('WebSocket disconnected:', event);
            setIsConnected(false);
            if (!event.wasClean) {
                 setError('Connection lost. Attempting to reconnect...');
                 // You might add simple reconnection logic here
            }
        };

        ws.current.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setError('Connection error occurred.');
            ws.current?.close();
        };

        // 4. Cleanup on unmount
        return () => {
            if (ws.current) {
                ws.current.close(1000, 'Component unmounted cleanly');
            }
        };
    }, []);

    // Function to send a message via the WebSocket
    const sendMessage = useCallback((text: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            // The format must match what your Django consumer expects (e.g., 'send_message' event)
            ws.current.send(JSON.stringify({
                type: 'send_message',
                message: text,
            }));
        } else {
            console.error('WebSocket is not open.');
            setError('Cannot send message: Connection not ready.');
        }
    }, []);

    return { messages, isConnected, error, sendMessage };
};