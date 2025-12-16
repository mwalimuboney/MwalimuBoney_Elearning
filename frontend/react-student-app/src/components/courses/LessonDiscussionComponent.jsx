// src/components/courses/LessonDiscussionComponent.jsx

import React, { useState } from 'react';
import useLessonChat from '../../hooks/useLessonChat';
import { useAuth } from '../../context/AuthContext';

const LessonDiscussionComponent = ({ lessonId }) => {
    const { messages, isConnected, sendMessage } = useLessonChat(lessonId);
    const { user } = useAuth();
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && isConnected) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="discussion-box card">
            <div className="card-header bg-primary text-white">
                Live Lesson Q&A 
                <span className={`badge bg-${isConnected ? 'success' : 'danger'} float-end`}>
                    {isConnected ? 'Live' : 'Offline'}
                </span>
            </div>
            
            <div className="card-body chat-messages-area" style={{ height: '300px', overflowY: 'auto' }}>
                {messages.length === 0 && <p className="text-muted text-center">No messages yet. Ask a question!</p>}
                {messages.map((msg, index) => (
                    <div key={index} className={`message-bubble mb-2 d-flex ${msg.user_id === user.id ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`p-2 rounded shadow-sm ${msg.user_id === user.id ? 'bg-info text-white' : 'bg-light'}`}>
                            <small className="fw-bold">{msg.username}:</small>
                            <p className="m-0">{msg.message}</p>
                            <small className="text-opacity-50 text-end d-block" style={{fontSize: '0.65rem'}}>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card-footer">
                <form onSubmit={handleSubmit} className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isConnected ? "Type your question..." : "Connecting..."}
                        disabled={!isConnected}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!isConnected || !input.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};
export default LessonDiscussionComponent;