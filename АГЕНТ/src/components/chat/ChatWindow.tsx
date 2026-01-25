import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Trash2, MoreVertical, Paperclip, Zap, Menu, GraduationCap, BarChart3 } from 'lucide-react';
import { useChatHistory } from '@/hooks/useChatHistory';
import { sendMessage, type FileData } from '@/services/aiService';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { QuickTemplates } from './QuickTemplates';
import { Sidebar } from '@/components/Sidebar';
import { ModeSelector } from '@/components/ModeSelector';
import { cn } from '@/lib/utils';
import { TelegramUser } from '@/hooks/useTelegramApp';

interface ChatWindowProps {
    user: TelegramUser | null;
}

export function ChatWindow({ user }: ChatWindowProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<FileData[]>([]);
    const [showTemplates, setShowTemplates] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showModeSelector, setShowModeSelector] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        sessions,
        activeSessionId,
        history,
        currentMode, // Получаем текущий режим из хука
        createSession,
        deleteSession,
        switchSession,
        setSessionMode, // Получаем функцию смены режима
        addMessage,
        updateMessage,
        clearHistory,
    } = useChatHistory();

    // Автопрокрутка
    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [history.length, scrollToBottom]);

    useEffect(() => {
        if (!isLoading && history.length > 0) {
            scrollToBottom();
        }
    }, [isLoading, history.length, scrollToBottom]);

    // Авторесайз textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    // Показать шаблоны при смене чата
    useEffect(() => {
        if (history.length === 0) {
            setShowTemplates(true);
        }
    }, [activeSessionId, history.length]);

    const handleSend = useCallback(async () => {
        if (!input.trim() && files.length === 0) return;
        if (isLoading) return;

        const userMessage = input.trim();
        const userFiles = [...files];

        addMessage({
            role: 'user',
            content: userMessage || 'Отправлено изображение',
            files: userFiles.map((f) => ({
                name: f.name,
                type: f.type,
                size: f.size,
                thumbnail: f.thumbnail,
            })),
        });

        setInput('');
        setFiles([]);
        setShowTemplates(false);
        setIsLoading(true);

        try {
            const apiMessages = history.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            }));

            apiMessages.push({
                role: 'user',
                content: userMessage,
            });

            // Передаем текущий режим явно
            const response = await sendMessage(
                apiMessages,
                userFiles.length > 0 ? userFiles : undefined,
                currentMode
            );

            addMessage({
                role: 'assistant',
                content: response,
            });
        } catch (error) {
            console.error('Ошибка отправки:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Произошла ошибка при отправке сообщения';

            addMessage({
                role: 'assistant',
                content: `❌ **Ошибка:** ${errorMessage}\n\nПопробуйте ещё раз.`,
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, files, history, isLoading, addMessage, currentMode]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTemplateSelect = async (text: string) => {
        setShowTemplates(false);

        addMessage({
            role: 'user',
            content: text,
        });

        setIsLoading(true);

        try {
            const apiMessages = history.map((msg) => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            }));

            apiMessages.push({
                role: 'user',
                content: text,
            });

            // Передаем текущий режим явно
            const response = await sendMessage(
                apiMessages,
                undefined,
                currentMode
            );

            addMessage({
                role: 'assistant',
                content: response,
            });
        } catch (error) {
            console.error('Ошибка отправки:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'Произошла ошибка при отправке сообщения';

            addMessage({
                role: 'assistant',
                content: `❌ **Ошибка:** ${errorMessage}\n\nПопробуйте ещё раз.`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditMessage = (messageId: string, newContent: string) => {
        updateMessage(messageId, { content: newContent });
    };

    const handleClearHistory = () => {
        clearHistory();
        setShowTemplates(true);
        setShowMenu(false);
    };

    const handleNewChat = () => {
        createSession();
        setShowTemplates(true);
        setShowSidebar(false);
    };

    return (
        <>
            {/* Sidebar */}
            <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={switchSession}
                onNewChat={handleNewChat}
                onDeleteSession={deleteSession}
                user={user}
            />

            <div className="flex flex-col h-full max-h-screen overflow-hidden bg-background">
                {/* Header */}
                <header className="px-3 sm:px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 border-b border-border/30 flex-shrink-0 glass-card z-20">
                    <div className="flex items-center justify-between">
                        {/* Левая сторона - Меню бургер + Ник */}
                        <div className="flex items-center gap-2 min-w-[80px]">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/30 flex items-center justify-center overflow-hidden relative">
                                {user?.photo_url ? (
                                    <img
                                        src={user.photo_url}
                                        alt={user.first_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-primary">
                                        {user?.first_name?.[0] || 'U'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Центр - Название и Текущий режим */}
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-sm sm:text-base font-display neon-text-subtle flex items-center gap-1.5">
                                AI {currentMode === 'teacher' ? 'Ментор' : 'Аналитик'}
                                <Zap className="w-3 h-3 text-accent animate-pulse" />
                            </h1>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1">
                                {currentMode === 'teacher' ? (
                                    <><GraduationCap className="w-3 h-3" /> Обучение</>
                                ) : (
                                    <><BarChart3 className="w-3 h-3" /> Анализ рынка</>
                                )}
                            </p>
                        </div>

                        {/* Правая сторона - Выбор режима (Brain) + Меню */}
                        <div className="flex items-center gap-1 min-w-[80px] justify-end">
                            <div className="relative">
                                <button
                                    onClick={() => setShowModeSelector(!showModeSelector)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg transition-all relative overflow-hidden",
                                        "hover:bg-white/5 border border-transparent hover:border-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute inset-0 opacity-20",
                                        currentMode === 'teacher' ? "bg-primary" : "bg-accent"
                                    )} />
                                    <Brain className={cn(
                                        "w-4 h-4",
                                        currentMode === 'teacher' ? "text-primary" : "text-accent"
                                    )} />
                                </button>

                                <ModeSelector
                                    isOpen={showModeSelector}
                                    onClose={() => setShowModeSelector(false)}
                                    currentMode={currentMode}
                                    onSelectMode={setSessionMode} // Используем функцию из хука
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="text-muted-foreground hover:text-foreground h-8 w-8 flex items-center justify-center hover:bg-white/5 rounded-lg transition-all"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-1 glass-card neon-border rounded-xl overflow-hidden z-50 min-w-[150px]"
                                            >
                                                <button
                                                    onClick={handleClearHistory}
                                                    className="flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors w-full touch-feedback"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Очистить чат
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div
                    ref={scrollAreaRef}
                    className="flex-1 overflow-y-auto px-2 sm:px-3"
                >
                    <div className="py-3 sm:py-4">
                        {history.length === 0 && showTemplates && (
                            <div className="space-y-2 sm:space-y-3">
                                {/* Welcome */}
                                <div className="text-center py-2 sm:py-3">
                                    <div className="relative inline-block mb-2">
                                        <div className={cn(
                                            "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-2",
                                            "border glass-card",
                                            currentMode === 'teacher' ? "border-primary/30 bg-primary/10" : "border-accent/30 bg-accent/10"
                                        )}>
                                            {currentMode === 'teacher' ? (
                                                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                                            ) : (
                                                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold mb-1">
                                        {currentMode === 'teacher' ? 'Режим Обучения' : 'Режим Анализа'}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground px-2 max-w-[250px] mx-auto">
                                        {currentMode === 'teacher'
                                            ? 'Я научу тебя торговать с Black Mirror Ultra шаг за шагом'
                                            : 'Прикрепи скриншот графика для получения детального разбора'
                                        }
                                    </p>
                                </div>

                                {/* Templates */}
                                <div className="text-left">
                                    <QuickTemplates
                                        onSelect={handleTemplateSelect}
                                        mode={currentMode}
                                    />
                                </div>
                            </div>
                        )}

                        {history.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onEdit={message.role === 'user' ? handleEditMessage : undefined}
                                user={user}
                            />
                        ))}

                        {isLoading && <TypingIndicator />}
                    </div>
                </div>

                {/* Input Area */}
                <div className="px-2 sm:px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1.5 border-t border-border/30 bg-background/80 backdrop-blur-sm flex-shrink-0">
                    {/* File thumbnails */}
                    {files.length > 0 && (
                        <div className="mb-1.5">
                            <FileUpload files={files} onFilesChange={setFiles} compact />
                        </div>
                    )}

                    <div className="flex gap-1.5 items-center">
                        {/* Paperclip */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="h-[34px] sm:h-[38px] w-[34px] sm:w-[38px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors border border-white/10 flex-shrink-0"
                        >
                            <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) {
                                    Array.from(e.target.files).forEach((file) => {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const base64 = reader.result as string;
                                            setFiles((prev) => [
                                                ...prev,
                                                {
                                                    name: file.name,
                                                    type: file.type,
                                                    size: file.size,
                                                    data: base64,
                                                    thumbnail: file.type.startsWith('image/') ? base64 : undefined,
                                                },
                                            ]);
                                        };
                                        reader.readAsDataURL(file);
                                    });
                                }
                                e.target.value = '';
                            }}
                        />

                        {/* Input */}
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-0.5 bg-primary/10 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-lg" />
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={currentMode === 'teacher' ? "Задайте вопрос ментору..." : "Опишите ситуацию на рынке..."}
                                className={cn(
                                    'relative w-full min-h-[34px] sm:min-h-[38px] max-h-[120px] resize-none',
                                    'input-glass rounded-lg py-1.5 px-3 text-xs sm:text-sm',
                                    'placeholder:text-muted-foreground/50'
                                )}
                                style={{ lineHeight: '1.2' }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Send */}
                        <motion.button
                            onClick={handleSend}
                            disabled={(!input.trim() && files.length === 0) || isLoading}
                            className={cn(
                                'h-[34px] sm:h-[38px] w-[34px] sm:w-[38px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all touch-feedback',
                                (!input.trim() && files.length === 0) || isLoading
                                    ? 'bg-white/5 text-muted-foreground border border-white/10'
                                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
                            )}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
    );
}
