import { motion } from 'framer-motion';
import { Brain, User, Copy, Check, Edit2, X, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatHistory';

import { TelegramUser } from '@/hooks/useTelegramApp';

interface ChatMessageProps {
    message: ChatMessageType;
    onEdit?: (messageId: string, newContent: string) => void;
    user?: TelegramUser | null;
}

export function ChatMessage({ message, onEdit, user }: ChatMessageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(message.content);
    };

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim() && editContent !== message.content) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(message.content);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn('flex gap-3 mb-4 group', isUser && 'flex-row-reverse')}
        >
            {/* Avatar */}
            {isUser ? (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-neon overflow-hidden">
                    {user?.photo_url ? (
                        <img
                            src={user.photo_url}
                            alt={user.first_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-4 h-4 text-primary-foreground" />
                    )}
                </div>
            ) : (
                <div className="w-9 h-9 rounded-xl glass-card border border-primary/30 flex items-center justify-center flex-shrink-0 neon-border">
                    <Brain className="w-4 h-4 text-primary" />
                </div>
            )}

            {/* Message */}
            <div className={cn('flex-1 flex flex-col gap-1', isUser && 'items-end')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3 max-w-[85%]',
                        isUser ? 'message-user' : 'message-assistant'
                    )}
                >
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                rows={3}
                                autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                                >
                                    <CheckCircle className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {!isUser ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => (
                                                <p className="text-foreground/90 mb-2 last:mb-0 text-sm leading-relaxed">
                                                    {children}
                                                </p>
                                            ),
                                            strong: ({ children }) => (
                                                <strong className="text-primary font-semibold">{children}</strong>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="list-disc list-inside mb-2 space-y-1 text-foreground/80">{children}</ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground/80">{children}</ol>
                                            ),
                                            li: ({ children }) => (
                                                <li className="text-foreground/80 text-sm">{children}</li>
                                            ),
                                            code: ({ children }) => (
                                                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">
                                                    {children}
                                                </code>
                                            ),
                                            blockquote: ({ children }) => (
                                                <blockquote className="border-l-2 border-primary/50 pl-3 italic text-foreground/70 text-sm my-2">
                                                    {children}
                                                </blockquote>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="text-lg font-display font-bold text-primary mb-2">{children}</h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="text-base font-display font-semibold text-primary mb-2">{children}</h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="text-sm font-display font-semibold text-foreground mb-1">{children}</h3>
                                            ),
                                            hr: () => (
                                                <hr className="border-border/50 my-3" />
                                            ),
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}

                            {/* Attached Files */}
                            {message.files && message.files.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {message.files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-background/30 border border-border/30"
                                        >
                                            {file.thumbnail ? (
                                                <img
                                                    src={file.thumbnail}
                                                    alt={file.name}
                                                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs uppercase text-muted-foreground">
                                                        {file.type.split('/')[1]?.substring(0, 3) || 'FILE'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate text-foreground">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} КБ
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Time and Actions */}
                <div
                    className={cn(
                        'flex items-center gap-2 text-xs text-muted-foreground',
                        isUser && 'flex-row-reverse'
                    )}
                >
                    <span>{formatTime(message.timestamp)}</span>
                    {message.edited && <span className="text-[10px] opacity-70">(изменено)</span>}
                    {!isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUser && onEdit && (
                                <button
                                    onClick={handleEdit}
                                    className="p-1 hover:bg-muted rounded transition-colors touch-feedback"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </button>
                            )}
                            <button
                                onClick={handleCopy}
                                className="p-1 hover:bg-muted rounded transition-colors touch-feedback"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3 text-primary" />
                                ) : (
                                    <Copy className="w-3 h-3" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
