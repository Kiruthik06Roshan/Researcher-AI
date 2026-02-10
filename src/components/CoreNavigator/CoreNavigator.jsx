
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Trash2 } from 'lucide-react';
import './CoreNavigator.css';
import { useCoreNavigator } from '../../hooks/useCoreNavigator';

export const CoreNavigator = () => {
    const { isOpen, toggleOpen, clearChat, messages, sendMessage, isLoading, error } = useCoreNavigator();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput('');
    };

    const formatMessage = (content) => {
        // 1. Handle bold text (**text**)
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 2. Handle italic text (*text*)
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 3. Handle newlines
        formatted = formatted.replace(/\n/g, '<br />');

        // 4. Handle bullet points (simple implementation)
        // This is a basic parser. For full markdown, a library is better, 
        // but this keeps it lightweight as requested.

        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    className="core-navigator-toggle"
                    onClick={toggleOpen}
                    aria-label="Open AI Assistant"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chat Window */}
            <div className={`core-navigator-window ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="cn-header">
                    <div className="cn-header-title">
                        <Bot size={20} className="cn-icon-bot" />
                        <span>Core Navigator</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={clearChat} className="cn-close-btn" title="Clear Chat">
                            <Trash2 size={18} />
                        </button>
                        <button onClick={toggleOpen} className="cn-close-btn" title="Close">
                            <Minimize2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="cn-messages">
                    {messages.length === 0 && (
                        <div className="cn-welcome">
                            <Bot size={48} className="cn-welcome-icon" />
                            <p>Hello! I'm your Core Navigator.</p>
                            <p className="cn-subtitle">Ask me anything about this platform or general questions.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`cn-message ${msg.role}`}>
                            <div className="cn-avatar">
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className="cn-content">
                                {formatMessage(msg.content)}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="cn-message assistant">
                            <div className="cn-avatar"><Bot size={16} /></div>
                            <div className="cn-content typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="cn-error">
                            {error}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form className="cn-input-area" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={!input.trim() || isLoading}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </>
    );
};
