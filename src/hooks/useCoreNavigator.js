
import { useState } from 'react';
import { CoreNavigatorService } from '../services/coreNavigatorService';

export const useCoreNavigator = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const coreNavigatorService = new CoreNavigatorService();

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    const toggleOpen = () => {
        if (isOpen) {
            // Auto-clear when closing
            setMessages([]);
            setError(null);
        }
        setIsOpen(!isOpen);
    };

    const sendMessage = async (content) => {
        if (!content.trim()) return;

        // Add user message immediately
        const userMessage = { role: 'user', content };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await coreNavigatorService.fetchCoreNavigatorResponse(content, messages);

            const assistantMessage = { role: 'assistant', content: response };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error("Core Navigator Error:", err);
            setError("Connection failed. Please ensure the backend is running (restart 'npm run dev').");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen,
        toggleOpen,
        clearChat,
        messages,
        sendMessage,
        isLoading,
        error
    };
};
