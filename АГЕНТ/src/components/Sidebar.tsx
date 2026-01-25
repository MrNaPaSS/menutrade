import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, MessageSquare, Send, Briefcase, GraduationCap } from 'lucide-react';
import { ChatSession } from '@/hooks/useChatHistory';
import { cn } from '@/lib/utils';

import { TelegramUser } from '@/hooks/useTelegramApp';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
    user: TelegramUser | null;
}

export function Sidebar({
    isOpen,
    onClose,
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    user,
}: SidebarProps) {
    const handleNewChat = () => {
        onNewChat();
        onClose();
    };

    const handleSelectSession = (id: string) => {
        onSelectSession(id);
        onClose();
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Сегодня';
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[80vw] bg-background border-r border-border/30 z-50 flex flex-col"
                        style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/30 flex items-center justify-center overflow-hidden relative font-bold text-primary text-xs">
                                    {user?.photo_url ? (
                                        <img
                                            src={user.photo_url}
                                            alt={user.first_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user?.first_name?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold truncate max-w-[150px]">
                                        {user?.first_name || 'Пользователь'} {user?.last_name || ''}
                                    </span>
                                    {user?.username && (
                                        <span className="text-[10px] text-muted-foreground">@{user.username}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* External Links */}
                        <div className="px-3 pt-3 grid grid-cols-2 gap-2">
                            <a
                                href="https://t.me/+avD8ncMHBp4zMzhi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#2AABEE]/10 text-[#2AABEE] hover:bg-[#2AABEE]/20 transition-colors text-xs font-medium border border-[#2AABEE]/20"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Канал
                            </a>
                            <a
                                href="https://u3.shortink.io/main?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=sait&code=VDN436"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs font-medium border border-accent/20"
                            >
                                <Briefcase className="w-3.5 h-3.5" />
                                Брокер
                            </a>
                        </div>

                        {/* Academy Button */}
                        <div className="px-3 pt-2">
                            <a
                                href="https://t.me/moneyhoney7_bot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium border border-primary/20 w-full"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                Академия Здравого Трейдера
                            </a>
                        </div>

                        {/* New Chat Button */}
                        <div className="p-3 pt-2">
                            <button
                                onClick={handleNewChat}
                                className="w-full py-2.5 px-4 rounded-xl btn-premium text-primary-foreground font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Новый чат
                            </button>
                        </div>

                        {/* Chat List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-3">
                            <div className="space-y-1">
                                {sessions.map((session) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            'group relative rounded-xl p-3 cursor-pointer transition-colors',
                                            session.id === activeSessionId
                                                ? 'bg-primary/10 border border-primary/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                        )}
                                        onClick={() => handleSelectSession(session.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                                session.id === activeSessionId
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-muted/30 text-muted-foreground'
                                            )}>
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate text-foreground">
                                                    {session.title}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    {session.messages.length} сообщ. · {formatDate(session.updatedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteSession(session.id);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            {sessions.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    Нет сохранённых чатов
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-border/30 text-center">
                            <p className="text-[10px] text-muted-foreground">
                                AI Ментор Академия Здравого Трейдера
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
