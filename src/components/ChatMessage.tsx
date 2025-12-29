import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, User, Copy, Check, Edit2, X, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatHistory';

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function ChatMessage({ message, onEdit }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

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

  // Аватар пользователя (градиентный круг)
  const UserAvatar = () => (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
    </div>
  );

  // Аватар AI (иконка Brain)
  const AIAvatar = () => (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
      <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-2 sm:gap-3 mb-3 sm:mb-4 group",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Аватар */}
      {isUser ? <UserAvatar /> : <AIAvatar />}

      {/* Сообщение */}
      <div className={cn(
        "flex-1 flex flex-col gap-1",
        isUser && "items-end"
      )}>
        {/* Пузырь сообщения */}
        <div className={cn(
          "rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] md:max-w-[70%]",
          isUser
            ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
            : "glass-card border border-primary/20 bg-background/60 backdrop-blur-sm"
        )}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {isAssistant ? (
                <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-foreground mb-1.5 sm:mb-2 last:mb-0 text-xs sm:text-sm">{children}</p>,
                      strong: ({ children }) => <strong className="text-primary font-bold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 sm:mb-2 space-y-0.5 sm:space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 sm:mb-2 space-y-0.5 sm:space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground/90 text-xs sm:text-sm">{children}</li>,
                      code: ({ children }) => (
                        <code className="bg-muted/50 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono">
                          {children}
                        </code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary/30 pl-2 sm:pl-3 italic text-foreground/80 text-xs sm:text-sm">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
              )}

              {/* Файлы */}
              {message.files && message.files.length > 0 && (
                <div className="mt-1.5 sm:mt-2 space-y-1.5 sm:space-y-2">
                  {message.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-background/30 border border-border/30"
                    >
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] sm:text-xs">{file.type.split('/')[1]?.substring(0, 3).toUpperCase() || 'FILE'}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-medium truncate">{file.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
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

        {/* Действия и время */}
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground",
          isUser && "flex-row-reverse"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {message.edited && (
            <span className="text-[10px] sm:text-xs opacity-70">(изменено)</span>
          )}
          {!isEditing && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              {isUser && onEdit && (
                <button
                  onClick={handleEdit}
                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 hover:bg-muted rounded touch-manipulation"
                >
                  <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
              <button
                onClick={handleCopy}
                className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5 sm:p-1 hover:bg-muted rounded touch-manipulation"
              >
                {copied ? (
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                ) : (
                  <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

