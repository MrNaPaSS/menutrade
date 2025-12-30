import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Trash2, X, MoreVertical, Paperclip } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatHistory, type ChatMessage } from '@/hooks/useChatHistory';
import { useTradingContext } from '@/hooks/useTradingContext';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { sendMessage, type FileData } from '@/services/openRouterService';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { FileUpload } from './FileUpload';
import { QuickTemplates } from './QuickTemplates';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { incrementPhotoCount, isAdmin } from '@/utils/uploadLimits';

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { history, addMessage, updateMessage, clearHistory } = useChatHistory();
  const context = useTradingContext();

  useSwipeBack({
    onSwipeBack: () => onOpenChange(false),
    enabled: open
  });

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    if (open && history.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
    // Фокус на поле ввода при открытии диалога
    if (open && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [open, history.length, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && history.length > 0) {
      scrollToBottom();
    }
  }, [isLoading, history.length, scrollToBottom]);

  // Автоматическое изменение размера textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && files.length === 0) return;
    if (isLoading) return;

    const userMessage = input.trim();
    const userFiles = [...files];

    // Добавляем сообщение пользователя
    addMessage({
      role: 'user',
      content: userMessage || 'Отправлены файлы',
      files: userFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        thumbnail: f.thumbnail
      }))
    });

    setInput('');
    setFiles([]);
    setShowTemplates(false);
    setIsLoading(true);

    try {
      // Подготавливаем сообщения для API
      const apiMessages = history
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Добавляем текущее сообщение
      apiMessages.push({
        role: 'user',
        content: userMessage
      });

      // Отправляем запрос
      const response = await sendMessage(
        apiMessages,
        userFiles.length > 0 ? userFiles : undefined,
        context
      );

      // Увеличиваем счетчик загруженных фото (только для обычных пользователей)
      // Счетчик увеличивается только при успешной отправке
      if (userFiles.length > 0 && !isAdmin()) {
        const imageFiles = userFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          // Увеличиваем счетчик на количество отправленных фото
          imageFiles.forEach(() => incrementPhotoCount());
        }
      }

      // Добавляем ответ AI
      addMessage({
        role: 'assistant',
        content: response
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при отправке сообщения';

      toast({
        title: 'Ошибка',
        description: errorMessage
      });

      // Добавляем сообщение об ошибке
      addMessage({
        role: 'assistant',
        content: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, files, history, isLoading, addMessage, context, toast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (text: string) => {
    setInput(text);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    updateMessage(messageId, { content: newContent });
  };

  const handleClearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить историю чата?')) {
      clearHistory();
      setShowTemplates(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className={cn(
          "max-w-full h-full md:max-w-3xl md:h-[80vh] p-0 gap-0",
          "bg-background/80 backdrop-blur-lg",
          "border border-white/20 shadow-2xl",
          "flex flex-col",
          "md:rounded-lg"
        )}
      >
        {/* Заголовок */}
        <DialogHeader className="px-3 sm:px-4 md:px-6 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 border-b border-border/30 relative flex-shrink-0">
          <div className="flex flex-col w-full relative">
            {/* Название и Подзаголовок (в центре) */}
            <div className="flex flex-col items-center justify-center min-h-[56px] sm:min-h-[64px] text-center">
              <DialogTitle className="text-sm sm:text-base md:text-lg font-display neon-text-subtle">
                AI Помощник
              </DialogTitle>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Эксперт по форекс рынку
              </p>
            </div>

            {/* Кнопки управления (смещены чуть ниже) */}
            <div className="absolute -bottom-1.5 right-0 flex items-center gap-1 bg-white/5 rounded-full px-1 border border-white/10 z-10 transition-transform">
              {/* Иконка Brain */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              {/* Меню с тремя точками */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-muted-foreground hover:text-foreground h-7 w-7 sm:h-8 sm:h-8 opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none p-0 cursor-pointer flex items-center justify-center"
                    type="button"
                  >
                    <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card neon-border">
                  <DropdownMenuItem
                    onClick={handleClearHistory}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Очистить историю
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        {/* Область сообщений */}
        <ScrollArea className="flex-1 px-2 sm:px-3 md:px-4" ref={scrollAreaRef}>
          <div className="py-3 sm:py-4">
            {history.length === 0 && showTemplates && (
              <div className="space-y-2 sm:space-y-3">
                <div className="text-center py-2 sm:py-3">
                  <div className="relative inline-block mb-2">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary opacity-50" />
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-xl rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold mb-1">Добро пожаловать!</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground px-2">
                    Я помогу вам разобраться в торговле бинарными опционами
                  </p>
                </div>
                <div className="text-left">
                  <QuickTemplates onSelect={handleTemplateSelect} />
                </div>
              </div>
            )}

            {history.map((message) => (
              <div key={message.id} className="group">
                <ChatMessageComponent
                  message={message}
                  onEdit={message.role === 'user' ? handleEditMessage : undefined}
                />
              </div>
            ))}

            {isLoading && <TypingIndicator />}
          </div>
        </ScrollArea>

        {/* Поле ввода */}
        <div className="px-2 sm:px-3 md:px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:pb-3 pt-1.5 border-t border-border/30 bg-background/50 backdrop-blur-sm">
          {/* Миниатюры загруженных файлов (если есть) */}
          <div className="mb-1.5">
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              hideDropzone={true}
            />
          </div>

          <div className="flex gap-1.5 items-center">
            {/* Скрепка для прикрепления файла */}
            <button
              onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
              className="h-[34px] sm:h-[38px] w-[34px] sm:w-[38px] rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors border border-white/10 flex-shrink-0"
              title="Прикрепить файл"
            >
              <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-primary/10 blur opacity-0 group-focus-within:opacity-100 transition duration-500 rounded-lg" />
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Напишите ваш вопрос..."
                className="relative min-h-[34px] sm:min-h-[38px] max-h-[120px] sm:max-h-[150px] resize-none glass-card border-border/40 focus:border-primary/50 text-xs sm:text-sm rounded-lg py-1.5 px-3 shadow-inner flex items-center"
                style={{ lineHeight: '1.2' }}
                disabled={isLoading}
                tabIndex={0}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && files.length === 0) || isLoading}
              className="h-[34px] sm:h-[38px] w-[34px] sm:w-[38px] rounded-lg flex-shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-lg transition-all active:scale-95"
              size="icon"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}

