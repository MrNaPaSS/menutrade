import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { ChatSession } from '@/agent/hooks/useChatHistory';
import { GraffitiSpray, GraffitiTornPanel } from '@/components/graffiti/Graffiti';
import { cn } from '@/lib/utils';

import type { TelegramUser } from '@/hooks/useTelegram';

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

// Чаты разложены по роли собеседника: у каждой свой стиль ответа
const GROUPS: Array<[string, string]> = [
    ['teacher', 'Ментор'],
    ['analyst', 'Аналитик'],
];

const PANEL_BG = 'hsl(140 26% 8%)';

/**
 * История чатов.
 *
 * Оформлена как остальные разделы: сплошные панели вместо стекла,
 * строки терминала вместо плиток, рваная кромка сверху и снизу - те же,
 * что у шапки и поля ввода.
 *
 * Осталась шторкой, а не окном: это навигация по чатам сбоку от
 * переписки, и открывается она жестом от края. Окно посреди экрана
 * оборвало бы этот жест.
 */
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
    const reduced = useReducedMotion();

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

        if (diffDays === 0) return 'сегодня';
        if (diffDays === 1) return 'вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Трейдер';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/72 z-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={reduced
                            ? { duration: 0.15 }
                            : { type: 'spring', damping: 26, stiffness: 320 }}
                        className="absolute left-0 top-0 bottom-0 w-[290px] max-w-[82%] z-50
                                   flex flex-col border-r border-[hsl(142_26%_15%)]"
                        style={{
                            background: 'linear-gradient(180deg, hsl(142 22% 10%) 0%, hsl(140 28% 6%) 100%)',
                            // Полоса кнопок Telegram: без неё шапка шторки
                            // уезжает под «Закрыть»
                            paddingTop: 'calc(env(safe-area-inset-top, 0px) + var(--tg-content-top, 0px))',
                            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                        }}
                    >
                        {/* Кромки считаются от самого края шторки, а не от
                            содержимого: иначе чёрное начинается ниже
                            системной строки и полоса выглядит разорванной
                            на куски */}
                        <GraffitiTornPanel
                            side="top"
                            style={{
                                height: 'calc(env(safe-area-inset-top, 0px) + var(--tg-content-top, 0px) + 86px)',
                            }}
                        />
                        <GraffitiTornPanel
                            side="bottom"
                            style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 66px)' }}
                        />

                        {/* Кто вы */}
                        <div className="relative flex items-center gap-3 px-4 pt-1.5 pb-3 flex-shrink-0">
                            <span className="relative w-10 h-10 rounded-full flex-shrink-0 p-[3px]
                                             flex items-center justify-center overflow-hidden
                                             bg-background/60 border border-border/30">
                                {user?.photo_url ? (
                                    <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="font-display font-bold text-primary text-sm">
                                        {name[0]?.toUpperCase() ?? 'Т'}
                                    </span>
                                )}
                            </span>

                            <div className="relative min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-foreground truncate">{name}</p>
                                {user?.username && (
                                    <p className="text-[11px] text-muted-foreground truncate">@{user.username}</p>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Закрыть"
                                className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                           border border-white/[0.08] bg-white/[0.04] text-muted-foreground
                                           transition-colors hover:bg-white/[0.09] hover:text-foreground
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="relative px-3 pt-3 pb-2 flex-shrink-0">
                            <button
                                onClick={handleNewChat}
                                className="w-full min-h-[42px] rounded-xl flex items-center justify-center gap-2
                                           bg-primary text-primary-foreground font-semibold text-[13.5px]
                                           transition-transform duration-100 active:scale-[0.98]
                                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                <Plus className="w-4 h-4" />
                                Новый чат
                            </button>
                        </div>

                        <div className="relative flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                            {GROUPS.map(([mode, groupTitle]) => {
                                const groupSessions = sessions.filter(s => (s.mode || 'teacher') === mode);
                                if (groupSessions.length === 0) return null;

                                return (
                                    <div key={mode}>
                                        <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase
                                                      tracking-[0.09em] text-muted-foreground">
                                            {groupTitle} · {groupSessions.length}
                                        </p>

                                        <div className="rounded-[16px] border border-[hsl(142_26%_15%)] overflow-hidden
                                                        divide-y divide-[hsl(142_22%_13%)]"
                                            style={{ background: PANEL_BG }}
                                        >
                                            {groupSessions.map(session => {
                                                const active = session.id === activeSessionId;

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={cn(
                                                            'group relative flex items-center gap-2.5 px-3 py-2.5',
                                                            'transition-colors',
                                                            active ? 'bg-primary/[0.09]' : 'hover:bg-white/[0.035]'
                                                        )}
                                                    >
                                                        <button
                                                            onClick={() => handleSelectSession(session.id)}
                                                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left
                                                                       focus:outline-none focus-visible:ring-2
                                                                       focus-visible:ring-primary/40 rounded-lg"
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'w-8 h-8 rounded-[10px] flex items-center justify-center',
                                                                    'flex-shrink-0 border border-white/[0.07]'
                                                                )}
                                                                style={{
                                                                    background: active
                                                                        ? 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 13%))'
                                                                        : 'hsl(142 20% 12%)',
                                                                    color: active ? 'hsl(142 76% 62%)' : 'hsl(142 15% 42%)',
                                                                }}
                                                            >
                                                                <MessageSquare className="w-4 h-4" />
                                                            </span>

                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-[13.5px] font-medium truncate text-foreground">
                                                                    {session.title}
                                                                </span>
                                                                <span className="block text-[11px] text-muted-foreground tabular-nums">
                                                                    {session.messages.length} сообщ. · {formatDate(session.updatedAt)}
                                                                </span>
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() => onDeleteSession(session.id)}
                                                            aria-label="Удалить чат"
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                                                       text-muted-foreground transition-colors
                                                                       hover:bg-destructive/10 hover:text-destructive
                                                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* За пустотой мазок: перекрывать тут нечего,
                                а голая строка по центру выглядит как сбой */}
                            {sessions.length === 0 && (
                                <div className="relative text-center py-12 text-[13px] text-muted-foreground">
                                    <GraffitiSpray className="inset-0" opacity={0.12} />
                                    <span className="relative">Пока ни одного чата</span>
                                </div>
                            )}
                        </div>

                        <div className="relative px-3 py-3 flex-shrink-0 text-center">
                            <p className="text-[10.5px] text-muted-foreground">
                                AI Ментор Академии здравого трейдера
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
