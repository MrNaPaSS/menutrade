import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatHistory, type ChatMessage } from '@/hooks/useChatHistory';
import { useTradingContext } from '@/hooks/useTradingContext';
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
        className={cn(
          "max-w-full h-full md:max-w-3xl md:h-[80vh] p-0 gap-0",
          "bg-background/80 backdrop-blur-lg",
          "border border-white/20 shadow-2xl",
          "flex flex-col",
          "md:rounded-lg"
        )}
      >
        {/* Заголовок */}
        <DialogHeader className="px-3 sm:px-4 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 sm:pb-4 border-b border-border/30 relative pr-12 sm:pr-14 md:pr-16">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm sm:text-base md:text-lg font-display truncate">AI Трейдинг Помощник</DialogTitle>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Эксперт по бинарным опционам и Forex</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="text-muted-foreground hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 flex-shrink-0"
              title="Очистить историю"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Область сообщений */}
        <ScrollArea className="flex-1 px-2 sm:px-3 md:px-4" ref={scrollAreaRef}>
          <div className="py-3 sm:py-4">
            {history.length === 0 && showTemplates && (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-3 sm:mb-4 opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Добро пожаловать!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-2">
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
        <div className="px-2 sm:px-3 md:px-4 pb-3 sm:pb-4 pt-2 border-t border-border/30">
          {/* Загрузка файлов */}
          <div className="mb-2">
            <FileUpload
              files={files}
              onFilesChange={setFiles}
            />
          </div>

          <div className="flex gap-1.5 sm:gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите ваш вопрос..."
                className="min-h-[50px] sm:min-h-[60px] max-h-[150px] sm:max-h-[200px] resize-none glass-card border-border/30 focus:border-primary/50 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && files.length === 0) || isLoading}
              className="h-[50px] sm:h-[60px] px-3 sm:px-4 md:px-6 flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 text-center">
            Enter - отправить, Shift+Enter - новая строка
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

