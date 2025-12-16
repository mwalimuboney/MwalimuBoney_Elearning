// src/hooks/useLessonChat.js (Conceptual Hook)

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const useLessonChat = (lessonId) => {
    const { isAuthenticated, userToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !lessonId || !userToken) return;

        // Ensure connection uses WSS (secure) in production and includes the JWT token
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host.split(':')[0]; // Get host without port if any
        const url = `${protocol}//${host}:8000/ws/chat/lesson/${lessonId}/?token=${userToken}`;

        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => setIsConnected(true);
        wsRef.current.onclose = () => setIsConnected(false);
        wsRef.current.onerror = (e) => {
            console.error("WS Error:", e);
            setIsConnected(false);
        };
        
        wsRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages(prev => [...prev, data]);
        };

        // Cleanup function
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [lessonId, isAuthenticated, userToken]);

    const sendMessage = (message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message }));
        }
    };

    return { messages, isConnected, sendMessage };
};
export default useLessonChat;