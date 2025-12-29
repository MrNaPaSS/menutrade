import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { strategyModules } from '@/data/strategies';
import { Module } from '@/types/lesson';
import { CheckCircle2, AlertCircle, AlertTriangle, Lightbulb, Info, Calculator, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useSwipeBack } from '@/hooks/useSwipeBack';

// Функция для правильного извлечения текста из children ReactMarkdown
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(child => extractTextFromChildren(child)).join('');
  }
  if (children && typeof children === 'object' && 'props' in children && children.props) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
}

// Функция для преобразования строк с эмодзи в список
function convertEmojiLinesToLists(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inEmojiBlock = false;
  let emojiBlock: string[] = [];
  let emojiType = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Проверяем, начинается ли строка с эмодзи
    const emojiMatch = trimmed.match(/^([✅❌⚠️💡])\s+(.+)$/);
    
    if (emojiMatch) {
      const emoji = emojiMatch[1];
      const text = emojiMatch[2];
      
      // Если это новый блок эмодзи или тот же тип
      if (!inEmojiBlock || emojiType !== emoji) {
        // Сохраняем предыдущий блок, если есть
        if (inEmojiBlock && emojiBlock.length > 0) {
          result.push(emojiBlock.join('\n'));
          emojiBlock = [];
        }
        inEmojiBlock = true;
        emojiType = emoji;
      }
      
      // Добавляем как элемент списка
      emojiBlock.push(`- ${text}`);
    } else {
      // Если была группа эмодзи, закрываем её
      if (inEmojiBlock && emojiBlock.length > 0) {
        result.push(emojiBlock.join('\n'));
        emojiBlock = [];
        inEmojiBlock = false;
        emojiType = '';
      }
      result.push(line);
    }
  }
  
  // Закрываем последний блок, если есть
  if (inEmojiBlock && emojiBlock.length > 0) {
    result.push(emojiBlock.join('\n'));
  }
  
  return result.join('\n');
}

// Функция для удаления эмодзи из React элементов
function removeEmojiFromChildren(children: ReactNode): ReactNode {
  if (typeof children === 'string') {
    return children.replace(/^[✅❌⚠️💡]\s*/, '').trim();
  }
  if (typeof children === 'number') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      const processed = removeEmojiFromChildren(child);
      // Если первый элемент - строка с эмодзи, удаляем эмодзи
      if (index === 0 && typeof child === 'string' && /^[✅❌⚠️💡]/.test(child)) {
        return child.replace(/^[✅❌⚠️💡]\s*/, '').trim();
      }
      return processed;
    });
  }
  if (children && typeof children === 'object' && 'props' in children && children.props) {
    return {
      ...children,
      props: {
        ...children.props,
        children: removeEmojiFromChildren(children.props.children)
      }
    };
  }
  return children;
}

type View = 'modules' | 'content';

const Strategies = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('modules');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [api, setApi] = useState<CarouselApi>(null);
  const [current, setCurrent] = useState(0);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  // Логика скрытия заголовка при прокрутке
  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    
    // Показываем при прокрутке вверх или если прокрутка меньше 50px
    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setIsHeaderVisible(true);
    } 
    // Скрываем при прокрутке вниз больше 50px
    else if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsHeaderVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  });

  // Скроллим вверх при изменении view
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
    
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [view]);

  const handleModuleClick = (module: Module) => {
    setSelectedModule(module);
    setView('content');
    setCurrent(0);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setView('modules');
    setCurrent(0);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  // Хук для свайпа назад - должен быть на верхнем уровне
  useSwipeBack({ 
    onSwipeBack: handleBackToModules,
    enabled: view === 'content' && selectedModule !== null
  });

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const newSlide = api.selectedScrollSnap();
      setCurrent(newSlide);
      
      // Сбрасываем прокрутку всех карточек
      cardRefs.current.forEach((el, index) => {
        if (el && index !== newSlide) {
          el.scrollTop = 0;
        }
      });
      
      // Сбрасываем прокрутку текущей карточки в начало
      const currentCard = cardRefs.current.get(newSlide);
      if (currentCard) {
        currentCard.scrollTop = 0;
      }
    };

    setCurrent(api.selectedScrollSnap());
    api.on("select", handleSelect);
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);
  
  // Дополнительно сбрасываем прокрутку при изменении current
  useEffect(() => {
    const currentCard = cardRefs.current.get(current);
    if (currentCard) {
      currentCard.scrollTop = 0;
    }
  }, [current]);

  // Render module content
  if (view === 'content' && selectedModule) {
    const currentModule = strategyModules.find(m => m.id === selectedModule.id);
    
    if (!currentModule) return null;

    return (
      <div className="min-h-[100dvh] scanline pb-8 sm:pb-10">
        <MatrixRain />
        <div className="relative z-10">
          {/* Sticky header с кнопкой назад */}
          <motion.div 
            className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
            animate={{
              y: isHeaderVisible ? 0 : -100,
              opacity: isHeaderVisible ? 1 : 0,
            }}
            transition={{ 
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
            style={{ pointerEvents: isHeaderVisible ? 'auto' : 'none', overflow: 'hidden' }}
          >
            <div className="relative flex items-center justify-center py-2 sm:py-3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToModules}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Назад</span>
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <h2 className="font-display font-bold text-lg sm:text-xl">{currentModule.title}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentModule.description}
                </p>
              </div>
              <div className="absolute right-4 -top-3">
                <SimpleMenu />
              </div>
            </div>
          </motion.div>

          <main className="p-2.5 sm:p-3 md:p-4 pb-8 sm:pb-10 flex justify-center">
            <div className="max-w-full sm:max-w-lg w-full mx-auto">
              {/* Carousel with cards */}
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: false,
                  axis: "x",
                  slidesToScroll: 1,
                }}
                className="w-full"
                style={{ touchAction: 'pan-x' }}
              >
                <CarouselContent className="-ml-0">
                  {currentModule.lessons.map((lesson, index) => (
                    <CarouselItem key={lesson.id} className="pl-0 basis-full">
                      <div
                        ref={(el) => {
                          if (el) {
                            cardRefs.current.set(index, el);
                          }
                        }}
                        className="glass-card rounded-xl p-4 neon-border h-[calc(100dvh-180px)] flex flex-col overflow-hidden relative mx-auto w-full"
                        style={{ touchAction: 'pan-y pinch-zoom' }}
                      >
                        <h3 className="font-display font-bold text-sm mb-3 text-primary break-words overflow-wrap-anywhere flex-shrink-0">
                          {lesson.title}
                        </h3>
                        <div 
                          className="flex-1 prose prose-invert max-w-none w-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                          style={{ willChange: 'scroll-position', transform: 'translateZ(0)' }}
                        >
                          <div className="markdown-content text-sm leading-relaxed w-full pb-4 px-0">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="font-display text-base font-bold text-foreground mt-0 mb-4 neon-text flex items-center gap-2 pt-2 break-words overflow-wrap-anywhere">
                                  <span className="w-1 h-4 bg-primary rounded-full shadow-[0_0_12px_rgba(34,197,94,0.7)] flex-shrink-0"></span>
                                  <span className="break-words overflow-wrap-anywhere">{children}</span>
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="font-display text-sm font-semibold text-foreground mt-3 mb-2 flex items-center gap-2 border-b-2 border-primary/30 pb-2 break-words overflow-wrap-anywhere">
                                  <span className="w-0.5 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] flex-shrink-0"></span>
                                  <span className="break-words overflow-wrap-anywhere">{children}</span>
                                </h2>
                              ),
                              h3: ({ children }) => {
                                const text = extractTextFromChildren(children);
                                let icon = <Info className="w-4 h-4 text-primary" />;
                                let bgColor = 'bg-primary/10';
                                let textColor = 'text-primary';

                                if (text.includes('❌')) {
                                  icon = <AlertCircle className="w-4 h-4 text-destructive" />;
                                  bgColor = 'bg-destructive/10';
                                  textColor = 'text-destructive';
                                } else if (text.includes('✅')) {
                                  icon = <CheckCircle2 className="w-4 h-4 text-primary" />;
                                  bgColor = 'bg-primary/10';
                                  textColor = 'text-primary';
                                } else if (text.includes('⚠️')) {
                                  icon = <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                                  bgColor = 'bg-yellow-500/10';
                                  textColor = 'text-yellow-500';
                                } else if (text.includes('💡')) {
                                  icon = <Lightbulb className="w-4 h-4 text-primary" />;
                                  bgColor = 'bg-primary/10';
                                  textColor = 'text-primary';
                                }

                                return (
                                  <h3 className={`font-display text-sm font-semibold ${textColor} mt-3 mb-2 flex items-center gap-2 break-words overflow-wrap-anywhere`}>
                                    <div className={`w-6 h-6 rounded-lg ${bgColor} flex items-center justify-center border border-${textColor}/20 flex-shrink-0`}>
                                      {icon}
                                    </div>
                                    <span className="break-words overflow-wrap-anywhere">{children}</span>
                                  </h3>
                                );
                              },
                              p: ({ children, ...props }) => {
                                // Проверяем, находится ли параграф внутри blockquote
                                const isInBlockquote = (props as any).parent?.tagName === 'blockquote';
                                
                                const text = extractTextFromChildren(children);
                                const trimmedText = text.trim();
                                
                                // Проверяем, начинается ли параграф с эмодзи
                                const startsWithEmoji = trimmedText.startsWith('✅') || 
                                                         trimmedText.startsWith('❌') || 
                                                         trimmedText.startsWith('⚠️') || 
                                                         trimmedText.startsWith('💡');
                                
                                if (startsWithEmoji) {
                                  let icon = null;
                                  let bgColor = '';
                                  let borderColor = '';
                                  const displayChildren = removeEmojiFromChildren(children);
                                  
                                  if (trimmedText.startsWith('❌')) {
                                    icon = <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
                                    bgColor = 'bg-destructive/10';
                                    borderColor = 'border-destructive/30';
                                  } else if (trimmedText.startsWith('✅')) {
                                    icon = <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  } else if (trimmedText.startsWith('⚠️')) {
                                    icon = <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
                                    bgColor = 'bg-yellow-500/10';
                                    borderColor = 'border-yellow-500/30';
                                  } else if (trimmedText.startsWith('💡')) {
                                    icon = <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  }
                                  
                                  return (
                                    <div className={`flex items-start gap-2 p-3 rounded-lg border-2 ${bgColor} ${borderColor} mb-3 shadow-lg text-left w-full block`}>
                                      <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                      <div className="text-foreground text-sm flex-1 text-left break-words overflow-wrap-anywhere hyphens-auto [&_strong]:text-primary [&_strong]:font-bold">{displayChildren}</div>
                                    </div>
                                  );
                                }
                                
                                // Проверка на специальные блоки в середине текста
                                if (text.includes('✅') || text.includes('❌')) {
                                  const Component = isInBlockquote ? 'div' : 'p';
                                  return (
                                    <Component className="text-sm leading-relaxed mb-4 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 break-words overflow-wrap-anywhere">
                                      <span className="mt-0.5 flex-shrink-0">
                                        {text.includes('✅') ? (
                                          <CheckCircle2 className="w-4 h-4 text-primary" />
                                        ) : (
                                          <AlertCircle className="w-4 h-4 text-destructive" />
                                        )}
                                      </span>
                                      <span className="text-foreground flex-1 break-words overflow-wrap-anywhere">{children}</span>
                                    </Component>
                                  );
                                }
                                
                                // Если внутри blockquote, возвращаем div вместо p
                                if (isInBlockquote) {
                                  return <div className="text-sm text-foreground/90 leading-relaxed mb-4 break-words overflow-wrap-anywhere hyphens-auto">{children}</div>;
                                }
                                
                                return <p className="text-sm text-foreground/90 leading-relaxed mb-4 break-words overflow-wrap-anywhere hyphens-auto">{children}</p>;
                              },
                              ul: ({ children }) => (
                                <ul className="list-none space-y-2 mb-4 break-words overflow-wrap-anywhere">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-2 text-foreground/90 mb-4 break-words overflow-wrap-anywhere text-sm">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => {
                                const text = extractTextFromChildren(children);
                                const trimmedText = text.trim();
                                const hasEmojiAtStart = trimmedText.startsWith('✅') || 
                                                        trimmedText.startsWith('❌') || 
                                                        trimmedText.startsWith('⚠️') || 
                                                        trimmedText.startsWith('💡') ||
                                                        trimmedText.match(/^-\s*(✅|❌|⚠️|💡)/);
                                
                                const hasEmoji = hasEmojiAtStart || text.includes('❌') || text.includes('✅') || text.includes('⚠️') || text.includes('💡');
                                
                                if (hasEmoji) {
                                  let icon = null;
                                  let bgColor = '';
                                  let borderColor = '';
                                  
                                  // Удаляем эмодзи из children
                                  const displayChildren = removeEmojiFromChildren(children);
                                  
                                  if (text.includes('✅')) {
                                    icon = <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  } else if (text.includes('❌')) {
                                    icon = <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
                                    bgColor = 'bg-destructive/10';
                                    borderColor = 'border-destructive/30';
                                  } else if (text.includes('⚠️')) {
                                    icon = <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
                                    bgColor = 'bg-yellow-500/10';
                                    borderColor = 'border-yellow-500/30';
                                  } else if (text.includes('💡')) {
                                    icon = <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  }
                                  return (
                                    <li className={`flex items-start gap-2 p-3 rounded-lg border-2 ${bgColor} ${borderColor} mb-3 shadow-lg text-left w-full block`}>
                                      <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                      <div className="text-foreground text-sm flex-1 text-left break-words overflow-wrap-anywhere hyphens-auto [&_strong]:text-primary [&_strong]:font-bold">{displayChildren}</div>
                                    </li>
                                  );
                                }
                                return (
                                  <li className="text-foreground/90 text-sm flex items-start gap-2 mb-3 p-2 hover:bg-primary/5 rounded-lg transition-colors text-left break-words overflow-wrap-anywhere">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    <span className="flex-1 text-left break-words overflow-wrap-anywhere">{children}</span>
                                  </li>
                                );
                              },
                              strong: ({ children }) => (
                                <strong className="text-primary font-bold bg-primary/15 px-1.5 sm:px-2 py-0.5 rounded-md border border-primary/20 neon-text break-words overflow-wrap-anywhere inline-block text-xs sm:text-sm">{children}</strong>
                              ),
                              blockquote: ({ children }) => {
                                const text = extractTextFromChildren(children);
                                let icon = <Info className="w-6 h-6" />;
                                let bgColor = 'bg-primary/10 border-primary/40';
                                let iconColor = 'text-primary';
                                let title = '';

                                if (text.includes('⚠️') || text.toLowerCase().includes('важно') || text.toLowerCase().includes('критически')) {
                                  icon = <AlertTriangle className="w-6 h-6" />;
                                  bgColor = 'bg-yellow-500/15 border-yellow-500/40';
                                  iconColor = 'text-yellow-400';
                                  title = 'Важно';
                                } else if (text.includes('💡') || text.toLowerCase().includes('совет')) {
                                  icon = <Lightbulb className="w-6 h-6" />;
                                  bgColor = 'bg-blue-500/15 border-blue-500/40';
                                  iconColor = 'text-blue-400';
                                  title = 'Совет';
                                } else if (text.includes('✅') || text.toLowerCase().includes('правило')) {
                                  icon = <CheckCircle2 className="w-6 h-6" />;
                                  bgColor = 'bg-green-500/15 border-green-500/40';
                                  iconColor = 'text-green-400';
                                  title = 'Правило';
                                } else if (text.includes('❌') || text.toLowerCase().includes('ошибка')) {
                                  icon = <AlertCircle className="w-6 h-6" />;
                                  bgColor = 'bg-destructive/15 border-destructive/40';
                                  iconColor = 'text-destructive';
                                  title = 'Ошибка';
                                }

                                return (
                                  <blockquote className={`glass-card rounded-lg p-3 neon-border mb-6 flex items-start gap-2 ${bgColor} break-words overflow-wrap-anywhere`}>
                                    <div className={`w-6 h-6 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                      {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {title && (
                                        <div className={`font-display font-bold text-xs mb-1 ${iconColor}`}>{title}</div>
                                      )}
                                      <div className="text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere [&_p]:contents [&_p_*]:block">{children}</div>
                                    </div>
                                  </blockquote>
                                );
                              },
                              code: ({ inline, children }) => {
                                if (inline) {
                                  return <code className="relative rounded bg-muted px-[0.2rem] sm:px-[0.3rem] py-[0.15rem] sm:py-[0.2rem] font-mono text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">{children}</code>;
                                }
                                return (
                                  <pre className="mb-3 sm:mb-4 mt-4 sm:mt-6 overflow-x-auto rounded-lg border bg-black/30 p-2 sm:p-3 md:p-4 font-mono text-[10px] sm:text-xs md:text-sm text-foreground">
                                    <code>{children}</code>
                                  </pre>
                                );
                              },
                              table: ({ children }) => (
                                <div className="my-6 w-full overflow-y-auto rounded-lg border neon-border">
                                  <table className="w-full text-foreground">{children}</table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right bg-primary/10 text-primary">{children}</th>
                              ),
                              td: ({ children }) => (
                                <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right text-muted-foreground">{children}</td>
                              ),
                            }}
                          >
                            {convertEmojiLinesToLists(lesson.content)}
                          </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 sm:left-3 md:left-4 h-11 w-11 min-h-[44px] min-w-[44px] bg-background/95 backdrop-blur-lg border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 z-50" />
                <CarouselNext className="right-2 sm:right-3 md:right-4 h-11 w-11 min-h-[44px] min-w-[44px] bg-background/95 backdrop-blur-lg border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 z-50" />
              </Carousel>
            </div>
          </main>
        </div>
        <BottomNav onHomeClick={handleHomeClick} />
      </div>
    );
  }

  // Render modules list
  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        {/* Sticky header с кнопкой назад */}
        <motion.div 
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4"
          animate={{
            y: isHeaderVisible ? 0 : -100,
            opacity: isHeaderVisible ? 1 : 0,
          }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{ pointerEvents: isHeaderVisible ? 'auto' : 'none', overflow: 'hidden' }}
        >
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Стратегии торговли</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Рекомендации, правила и практические стратегии
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </motion.div>

        <main className="p-2.5 sm:p-3 md:p-4 pb-12 sm:pb-14 flex justify-center">
          <div className="max-w-lg w-full mx-auto">

            {/* Modules */}
            <div className="space-y-3">
              {strategyModules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="w-full glass-card rounded-xl p-4 neon-border text-left transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] hover:bg-primary/5 touch-manipulation min-h-[60px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl flex-shrink-0">{module.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-base mb-1 break-words overflow-wrap-anywhere">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 break-words overflow-wrap-anywhere">{module.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {module.lessons.length} {module.lessons.length === 1 ? 'материал' : 'материалов'}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Strategies;

