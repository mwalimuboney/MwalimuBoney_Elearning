// src/hooks/useChatSocket.js (Conceptual Code for React)

import { useState, useEffect, useRef, useCallback } from 'react';

// NOTE: Uses the Access Token from your AuthContext for authentication if needed
// You must send the JWT token during the initial WebSocket handshake/query string for Channels to authenticate.

const useChatSocket = (chatUrl) => {
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);

    // Function to handle connection and events
    useEffect(() => {
        // 1. Initial Connection: (Need to pass JWT token securely in the WebSocket connection)
        socket.current = new WebSocket(chatUrl); 

        // 2. Receive Messages from Consumer
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'chat_history') {
                // Load historical messages on connect
                setMessages(data.messages);
            } else if (data.type === 'new_message') {
                // Prepend new messages to the list
                setMessages(prevMessages => [...prevMessages, data]);
            }
        };

        // 3. Clean up the connection on unmount
        return () => {
            socket.current.close();
        };
    }, [chatUrl]);

    // Function to send a message
    const sendMessage = useCallback((messageContent) => {
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({
                'message': messageContent
            }));
        }
    }, []);

    return { messages, sendMessage };
};