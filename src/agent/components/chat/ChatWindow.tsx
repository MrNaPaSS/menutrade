import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, MoreVertical, Paperclip, ChevronDown, GraduationCap, BarChart3, ArrowLeft } from 'lucide-react';
import { useChatHistory } from '@/agent/hooks/useChatHistory';
import { sendMessage, type FileData } from '@/agent/services/aiService';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { QuickTemplates } from './QuickTemplates';
import { Sidebar } from '@/agent/components/Sidebar';
import { ModeSelector } from '@/agent/components/ModeSelector';
import { MARKET_META } from '@/agent/config/markets';
import { GraffitiTornPanel } from '@/components/graffiti/Graffiti';
import { cn } from '@/lib/utils';
import type { TelegramUser } from '@/hooks/useTelegram';

interface ChatWindowProps {
    user: TelegramUser | null;
    /** Возврат в академию: кнопка встроена в шапку, чтобы не перекрывать меню агента */
    onBack?: () => void;
}

export function ChatWindow({ user, onBack }: ChatWindowProps) {
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
        currentMarket, // и рынок: от него зависит вердикт и расчёт риска
        createSession,
        deleteSession,
        switchSession,
        setSessionMode, // Получаем функцию смены режима
        setSessionMarket,
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
            const el = textareaRef.current;
            el.style.height = 'auto';
            // 32px - высота пустой строки: столько же, сколько у кнопок
            // по краям, чтобы пилюля не разъезжалась
            el.style.height = `${Math.min(Math.max(el.scrollHeight, 32), 132)}px`;
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

            // Передаем текущий режим и рынок явно
            const response = await sendMessage(
                apiMessages,
                userFiles.length > 0 ? userFiles : undefined,
                currentMode,
                currentMarket
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
    }, [input, files, history, isLoading, addMessage, currentMode, currentMarket]);

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

            // Передаем текущий режим и рынок явно
            const response = await sendMessage(
                apiMessages,
                undefined,
                currentMode,
                currentMarket
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

            <div className="relative flex flex-col h-full max-h-screen overflow-hidden bg-background">
                {/* Шапка без разделительной черты: переписка и так
                    отделена от неё воздухом, а линия под названием резала
                    экран пополам */}
                <header className="relative px-3 sm:px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,0.5rem))] pb-2 flex-shrink-0 z-20">
                    {/* Та же рваная кромка, что за полем ввода, только не
                        перевёрнутая: шапка стоит на оторванной полосе, и
                        экран получается зажат между двумя краями */}
                    <GraffitiTornPanel side="top" className="-bottom-[18px]" />
                    {/* Название стоит в самой полосе кнопок Telegram - между
                        «Закрыть» слева и «...» справа. Середина полосы всегда
                        пустует, и подпись занимает её, не отнимая высоты у
                        переписки. Поэтому здесь, в отличие от строки ниже,
                        отступ --tg-content-top намеренно не применяется.

                        Нажатие открывает выбор режима и рынка: отдельная
                        кнопка с мозгами делала то же самое, но по ней было
                        непонятно, что она меняет */}
                    <div
                        className="absolute inset-x-0 px-3 flex justify-center z-30"
                        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 9px)' }}
                    >
                        {/* Сдвиг вправо: «Закрыть» слева шире, чем «...»
                            справа, поэтому пустая середина полосы лежит
                            правее середины экрана */}
                        <button
                            onClick={() => setShowModeSelector(!showModeSelector)}
                            className="ml-[34px] flex items-center gap-1.5 px-3 py-0.5 rounded-lg
                                       font-display font-bold text-[22px] tracking-tight
                                       neon-text-subtle transition-colors hover:bg-white/[0.05]
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            AI {currentMode === 'teacher' ? 'Ментор' : 'Аналитик'}
                            <ChevronDown className={cn(
                                'w-5 h-5 transition-transform',
                                showModeSelector && 'rotate-180'
                            )} />
                        </button>

                        <ModeSelector
                            isOpen={showModeSelector}
                            onClose={() => setShowModeSelector(false)}
                            currentMode={currentMode}
                            onSelectMode={setSessionMode}
                            currentMarket={currentMarket}
                            onSelectMarket={setSessionMarket}
                        />
                    </div>

                    <div className="relative flex items-center justify-center min-h-8">
                        {/* Слева: назад в академию и фото - оно же вход в
                            историю чатов. Края стоят absolute, чтобы подпись
                            между ними была по центру экрана, а не по центру
                            остатка ширины */}
                        <div className="absolute left-0 flex items-center gap-1.5">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    title="Вернуться в академию"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            {/* Шторку с историей чатов открывает фото: две
                                кнопки подряд с одним и тем же действием
                                читались как разные */}
                            <button
                                onClick={() => setShowSidebar(true)}
                                aria-label="История чатов"
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30
                                           border border-primary/30 flex items-center justify-center
                                           overflow-hidden relative transition-colors
                                           hover:border-primary/60
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                {user?.photo_url ? (
                                    <img
                                        src={user.photo_url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-primary">
                                        {user?.first_name?.[0] || 'U'}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Режим и рынок - под названием и вровень с фото:
                            в полосе кнопок Telegram помещается только само
                            название, а строкой ниже есть место */}
                        <span className="ml-[56px] flex items-center gap-1.5 min-w-0 max-w-[62%]
                                         text-[19px] text-muted-foreground">
                            {currentMode === 'teacher' ? (
                                <><GraduationCap className="w-[21px] h-[21px] flex-shrink-0" /> Обучение</>
                            ) : (
                                <><BarChart3 className="w-[21px] h-[21px] flex-shrink-0" /> Анализ рынка</>
                            )}
                            {/* Рынок видно сразу: иначе непонятно, по чьим
                                правилам агент посчитает сделку */}
                            <span className="opacity-60 truncate">
                                · {currentMarket === 'auto'
                                    ? 'любой рынок'
                                    : MARKET_META[currentMarket].label.toLowerCase()}
                            </span>
                        </span>

                        {/* Справа: действия над чатом */}
                        <div className="absolute right-0 flex items-center gap-1">
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
                    className="flex-1 overflow-y-auto px-4"
                >
                    {/* Ширина строки ограничена: читать длинный разбор во
                        всю ширину экрана тяжело. Между репликами воздух,
                        как в мобильных чатах, а не плотный список */}
                    <div className="max-w-2xl mx-auto py-4 space-y-6">
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
                                        market={currentMarket}
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
                {/* Поле ввода одной пилюлей, как в мобильных Claude и
                    ChatGPT: вложение внутри слева, отправка кружком справа.
                    Рамка во всю ширину и три отдельные кнопки в ряд
                    выглядели как форма, а не как строка переписки */}
                <div className="relative px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 flex-shrink-0">
                    {/* Та же рваная кромка, что у нижней панели приложения:
                        поле ввода стоит на оторванной полосе стены, а не
                        висит в пустоте */}
                    <GraffitiTornPanel className="-top-[18px]" />

                    {/* File thumbnails */}
                    {files.length > 0 && (
                        <div className="relative mb-1.5">
                            <FileUpload files={files} onFilesChange={setFiles} compact />
                        </div>
                    )}

                    <div className="relative flex items-end gap-1.5 rounded-[22px] border border-white/[0.09]
                                    bg-white/[0.04] px-1.5 py-1.5 max-w-2xl mx-auto
                                    focus-within:border-primary/40 transition-colors">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Прикрепить файл"
                            className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                                       text-muted-foreground hover:text-foreground hover:bg-white/[0.06]
                                       transition-colors"
                        >
                            <Paperclip className="w-[17px] h-[17px]" />
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

                        <div className="flex-1 min-w-0">
                            <textarea
                                ref={textareaRef}
                                /* rows={1} обязателен: без него у textarea по
                                   умолчанию две строки, и пустое поле ввода
                                   встаёт вдвое выше, чем нужно */
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={currentMode === 'teacher' ? "Задайте вопрос ментору..." : "Опишите ситуацию на рынке..."}
                                className={cn(
                                    'w-full h-8 max-h-[132px] resize-none bg-transparent overflow-y-auto',
                                    'py-[5px] px-1 text-[15px] leading-[1.4] outline-none',
                                    'placeholder:text-muted-foreground/60'
                                )}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Send */}
                        <motion.button
                            onClick={handleSend}
                            disabled={(!input.trim() && files.length === 0) || isLoading}
                            className={cn(
                                'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                                'transition-colors',
                                (!input.trim() && files.length === 0) || isLoading
                                    ? 'bg-white/[0.06] text-muted-foreground'
                                    : 'bg-primary text-primary-foreground'
                            )}
                            whileTap={{ scale: 0.94 }}
                        >
                            <Send className="w-[17px] h-[17px]" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
    );
}
