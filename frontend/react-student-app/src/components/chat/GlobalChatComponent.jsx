// src/components/chat/GlobalChatComponent.jsx (Conceptual)

import React, { useState, useRef, useEffect } from 'react';
import { useGlobalChat } from '../../hooks/useGlobalChat';
import { useAuth } from '../../context/AuthContext';

const GlobalChatComponent = () => {
    const { messages, isConnected, error, sendMessage } = useGlobalChat();
    const { user } = useAuth(); // To identify the current user
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null); // Ref for auto-scrolling

    // Auto-scroll to the latest message whenever the messages array changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && isConnected) {
            sendMessage(inputMessage.trim());
            setInputMessage('');
        }
    };

    return (
        <div className="chat-container card shadow-lg m-4">
            <h5 className="card-header bg-primary text-white">
                Global Student Chat 
                <span className={`float-end badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                    {isConnected ? 'LIVE' : 'Offline'}
                </span>
            </h5>
            
            <div className="chat-messages card-body" style={{ height: '500px', overflowY: 'scroll' }}>
                {/* Error/Status Messages */}
                {error && <div className="alert alert-warning">{error}</div>}
                
                {/* Message List */}
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`d-flex ${msg.user === user?.username ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                    >
                        <div className={`message-bubble p-2 rounded ${msg.user === user?.username ? 'bg-info text-white' : 'bg-light'}`}>
                            <strong>{msg.user}:</strong>
                            <p className="mb-0">{msg.message}</p>
                            <small className="text-muted" style={{fontSize: '0.7em'}}>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>

            {/* Input Form */}
            <div className="card-footer">
                <form onSubmit={handleSubmit} className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={isConnected ? "Type a message..." : "Connecting..."}
                        disabled={!isConnected}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!isConnected || !inputMessage.trim()}>
                        Send
                    </button>
                </form>
            </div>
            {/*  */}
        </div>
    );
};
export default GlobalChatComponent;