import { useState, useEffect, useCallback } from 'react';
import { AIMode } from '@/config/prompts';

export interface FileAttachment {
    name: string;
    type: string;
    size: number;
    thumbnail?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    files?: FileAttachment[];
    timestamp: number;
    edited?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    mode: AIMode; // Добавляем поле для режима AI
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'ai-mentor-chat-sessions';
const MAX_MESSAGES_PER_CHAT = 100;

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getStoredSessions(): ChatSession[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const sessions = JSON.parse(saved);
            // Миграция старых данных: добавляем mode если нет
            return sessions.map((s: any) => ({
                ...s,
                mode: s.mode || 'teacher'
            }));
        }
    } catch (error) {
        console.error('Ошибка загрузки сессий:', error);
    }
    return [];
}

function saveSessions(sessions: ChatSession[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error('Ошибка сохранения сессий:', error);
    }
}

export function useChatHistory() {
    const [sessions, setSessions] = useState<ChatSession[]>(() => getStoredSessions());
    const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
        const stored = getStoredSessions();
        return stored.length > 0 ? stored[0].id : null;
    });

    // Текущая сессия
    const activeSession = sessions.find(s => s.id === activeSessionId) || null;
    const history = activeSession?.messages || [];
    const currentMode: AIMode = activeSession?.mode || 'teacher';

    // Сохранение при изменении
    useEffect(() => {
        saveSessions(sessions);
    }, [sessions]);

    // Создание новой сессии
    const createSession = useCallback((title?: string) => {
        const newSession: ChatSession = {
            id: generateId(),
            title: title || `Чат ${sessions.length + 1}`,
            messages: [],
            mode: 'teacher', // По умолчанию всегда Ментор
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        return newSession.id;
    }, [sessions.length]);

    // Удаление сессии
    const deleteSession = useCallback((sessionId: string) => {
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== sessionId);
            // Если удаляем активную сессию, переключаемся на первую
            if (sessionId === activeSessionId) {
                setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
            }
            return filtered;
        });
    }, [activeSessionId]);

    // Переключение сессии
    const switchSession = useCallback((sessionId: string) => {
        setActiveSessionId(sessionId);
    }, []);

    // Установка режима для текущей сессии
    const setSessionMode = useCallback((mode: AIMode) => {
        setSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    mode,
                    updatedAt: Date.now(),
                };
            }
            return session;
        }));
    }, [activeSessionId]);

    // Добавление сообщения
    const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            ...message,
            id: `msg-${generateId()}`,
            timestamp: Date.now(),
        };

        setSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                const messages = [...session.messages, newMessage].slice(-MAX_MESSAGES_PER_CHAT);
                // Обновляем название на основе первого сообщения пользователя
                let title = session.title;
                if (session.messages.length === 0 && message.role === 'user') {
                    title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
                }
                return {
                    ...session,
                    title,
                    messages,
                    updatedAt: Date.now(),
                };
            }
            return session;
        }));

        return newMessage.id;
    }, [activeSessionId]);

    // Обновление сообщения
    const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
        setSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    messages: session.messages.map(msg =>
                        msg.id === messageId ? { ...msg, ...updates, edited: true } : msg
                    ),
                    updatedAt: Date.now(),
                };
            }
            return session;
        }));
    }, [activeSessionId]);

    // Очистка текущего чата
    const clearHistory = useCallback(() => {
        setSessions(prev => prev.map(session => {
            if (session.id === activeSessionId) {
                return {
                    ...session,
                    messages: [],
                    updatedAt: Date.now(),
                };
            }
            return session;
        }));
    }, [activeSessionId]);

    // Получение последних сообщений
    const getLastMessages = useCallback((count: number) => {
        return history.slice(-count);
    }, [history]);

    // Если нет сессий, создаём первую
    useEffect(() => {
        if (sessions.length === 0) {
            createSession('Новый чат');
        }
    }, [sessions.length, createSession]);

    return {
        // Данные
        sessions,
        activeSessionId,
        activeSession,
        history,
        currentMode, // Экспортируем текущий режим
        // Действия с сессиями
        createSession,
        deleteSession,
        switchSession,
        setSessionMode, // Экспортируем функцию смены режима
        // Действия с сообщениями
        addMessage,
        updateMessage,
        clearHistory,
        getLastMessages,
    };
}
