import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/agent/hooks/useChatHistory';
import type { TelegramUser } from '@/hooks/useTelegram';

interface ChatMessageProps {
    message: ChatMessageType;
    onEdit?: (messageId: string, newContent: string) => void;
    user?: TelegramUser | null;
}

/**
 * Сообщение переписки.
 *
 * Устроено как в Claude и ChatGPT на телефоне: ответ модели идёт
 * обычным текстом во всю ширину, без пузыря и без аватара - читать
 * длинный разбор внутри пузыря неудобно, а аватар у каждой реплики
 * съедает ширину и внимание. Вопрос человека, наоборот, компактным
 * пузырём справа: его видно как реплику, а не как часть ответа.
 *
 * Действия появляются под ответом, а не поверх текста.
 */
export function ChatMessage({ message, onEdit }: ChatMessageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* буфер недоступен - молча, ради копирования падать не стоит */
        }
    };

    const saveEdit = () => {
        if (onEdit && editContent.trim() && editContent !== message.content) {
            onEdit(message.id, editContent);
        }
        setIsEditing(false);
    };

    const attachments = message.files && message.files.length > 0 && (
        <div className={cn('space-y-2', isUser ? 'mt-2' : 'mt-3')}>
            {message.files.map((file, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/[0.07]"
                >
                    {file.thumbnail ? (
                        <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-11 h-11 object-cover rounded-lg flex-shrink-0"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] uppercase text-muted-foreground">
                                {file.type.split('/')[1]?.substring(0, 3) || 'файл'}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate text-foreground">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                            {(file.size / 1024).toFixed(1)} КБ
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );

    // Вопрос человека
    if (isUser) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="group flex flex-col items-end"
            >
                {isEditing ? (
                    <div className="w-full max-w-[92%]">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl p-3 text-[15px]
                                       resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                                className="text-[13px] px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-white/[0.05]"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={saveEdit}
                                className="text-[13px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="max-w-[85%] rounded-[20px] rounded-br-lg px-4 py-2.5
                                        bg-white/[0.07] border border-white/[0.06]">
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                            {attachments}
                        </div>

                        {onEdit && (
                            <button
                                onClick={() => { setIsEditing(true); setEditContent(message.content); }}
                                aria-label="Изменить"
                                className="mt-1.5 p-1.5 rounded-lg text-muted-foreground opacity-0
                                           group-hover:opacity-100 focus-visible:opacity-100
                                           hover:bg-white/[0.05] transition-opacity"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </>
                )}
            </motion.div>
        );
    }

    // Ответ модели
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="group"
        >
            <div className="text-[15px] leading-[1.65] text-foreground
                            [&_p]:mb-3 [&_p:last-child]:mb-0
                            [&_ul]:mb-3 [&_ul]:space-y-1.5 [&_ol]:mb-3 [&_ol]:space-y-1.5
                            [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal
                            [&_strong]:font-semibold [&_strong]:text-foreground
                            [&_h1]:text-[17px] [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2
                            [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
                            [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5
                            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
                <ReactMarkdown
                    components={{
                        code: ({ className, children, ...props }) => {
                            const isBlock = /language-/.test(className || '');
                            if (!isBlock) {
                                return (
                                    <code className="bg-white/[0.07] text-primary px-1.5 py-0.5 rounded
                                                     text-[13px] font-mono break-words">
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <code
                                    className="block bg-black/40 border border-white/[0.07] rounded-xl p-3 my-3
                                               text-[13px] font-mono overflow-x-auto whitespace-pre"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        },
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-primary/40 pl-3 my-3 text-muted-foreground">
                                {children}
                            </blockquote>
                        ),
                    }}
                >
                    {message.content}
                </ReactMarkdown>

                {attachments}
            </div>

            {/* Действия под ответом, а не поверх текста */}
            <button
                onClick={handleCopy}
                aria-label="Скопировать"
                className="mt-2 flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg
                           text-[12px] text-muted-foreground
                           hover:bg-white/[0.05] transition-colors"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано' : 'Копировать'}
            </button>
        </motion.div>
    );
}
