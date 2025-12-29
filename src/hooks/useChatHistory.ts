import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: Array<{
    name: string;
    type: string;
    size: number;
    thumbnail?: string;
  }>;
  timestamp: number;
  edited?: boolean;
}

const STORAGE_KEY = 'pepe-trader-ai-chat-history';
const MAX_HISTORY_LENGTH = 100; // Максимум сообщений в истории

export function useChatHistory() {
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории чата:', error);
    }
    return [];
  });

  // Сохранение истории в localStorage
  useEffect(() => {
    try {
      // Ограничиваем размер истории
      const limitedHistory = history.slice(-MAX_HISTORY_LENGTH);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Ошибка сохранения истории чата:', error);
    }
  }, [history]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setHistory(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setHistory(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, ...updates, edited: true }
          : msg
      )
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  return {
    history,
    addMessage,
    updateMessage,
    clearHistory,
    getHistory
  };
}

