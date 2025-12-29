import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { strategyModules } from '@/data/strategies';
import { Module } from '@/types/lesson';
import { ArrowLeft, BarChart3, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb, Info, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Render module content
  if (view === 'content' && selectedModule) {
    const currentModule = strategyModules.find(m => m.id === selectedModule.id);
    
    if (!currentModule) return null;

    return (
      <div className="min-h-screen scanline pb-24">
        <MatrixRain />
        <div className="relative z-10">
          <Header progress={0} />
          
          <main className="p-4 pb-24">
            <div className="max-w-lg mx-auto">
              <button
                onClick={handleBackToModules}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Назад к стратегиям</span>
              </button>

              {/* Module header */}
              <div className="glass-card rounded-xl p-6 neon-border mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{currentModule.icon}</div>
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-2xl mb-1">{currentModule.title}</h2>
                    <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                  <div className="flex-1 flex gap-1">
                    {currentModule.lessons.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          index === current ? 'bg-primary' : 'bg-muted/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {current + 1} / {currentModule.lessons.length}
                  </span>
                </div>
              </div>

              {/* Carousel with cards */}
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: false,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {currentModule.lessons.map((lesson, index) => (
                    <CarouselItem key={lesson.id} className="pl-2 md:pl-4 basis-full">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card rounded-xl p-6 neon-border min-h-[60vh] flex flex-col"
                      >
                        <h3 className="font-display font-bold text-xl mb-4 text-primary">
                          {lesson.title}
                        </h3>
                        <div className="flex-1 prose prose-invert max-w-none w-full overflow-y-auto custom-scrollbar" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', hyphens: 'auto' }}>
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-0 mb-6 neon-text flex items-center gap-3 pt-2 break-words overflow-wrap-anywhere">
                                  <span className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_12px_rgba(34,197,94,0.7)] flex-shrink-0"></span>
                                  <span className="break-words overflow-wrap-anywhere">{children}</span>
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mt-6 mb-4 flex items-center gap-3 border-b-2 border-primary/30 pb-3 break-words overflow-wrap-anywhere">
                                  <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] flex-shrink-0"></span>
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
                                  <h3 className={`font-display text-lg md:text-xl font-semibold ${textColor} mt-5 mb-3 flex items-center gap-2 break-words overflow-wrap-anywhere`}>
                                    <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center border border-${textColor}/20 flex-shrink-0`}>
                                      {icon}
                                    </div>
                                    <span className="break-words overflow-wrap-anywhere">{children}</span>
                                  </h3>
                                );
                              },
                              p: ({ children }) => {
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
                                    icon = <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
                                    bgColor = 'bg-destructive/10';
                                    borderColor = 'border-destructive/30';
                                  } else if (trimmedText.startsWith('✅')) {
                                    icon = <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  } else if (trimmedText.startsWith('⚠️')) {
                                    icon = <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
                                    bgColor = 'bg-yellow-500/10';
                                    borderColor = 'border-yellow-500/30';
                                  } else if (trimmedText.startsWith('💡')) {
                                    icon = <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />;
                                    bgColor = 'bg-primary/10';
                                    borderColor = 'border-primary/30';
                                  }
                                  
                                  return (
                                    <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${bgColor} ${borderColor} mb-3 shadow-lg animate-in fade-in slide-in-from-left-2 text-left w-full block`}>
                                      <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                      <div className="text-foreground text-base md:text-lg flex-1 text-left break-words overflow-wrap-anywhere hyphens-auto [&_strong]:text-primary [&_strong]:font-bold">{displayChildren}</div>
                                    </div>
                                  );
                                }
                                
                                // Проверка на специальные блоки в середине текста
                                if (text.includes('✅') || text.includes('❌')) {
                                  return (
                                    <p className="text-base md:text-lg leading-relaxed mb-4 flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 break-words overflow-wrap-anywhere">
                                      <span className="mt-1 flex-shrink-0">
                                        {text.includes('✅') ? (
                                          <CheckCircle2 className="w-5 h-5 text-primary" />
                                        ) : (
                                          <AlertCircle className="w-5 h-5 text-destructive" />
                                        )}
                                      </span>
                                      <span className="text-foreground flex-1 break-words overflow-wrap-anywhere">{children}</span>
                                    </p>
                                  );
                                }
                                return <p className="text-base md:text-lg text-foreground/90 leading-relaxed mb-4 break-words overflow-wrap-anywhere hyphens-auto">{children}</p>;
                              },
                              ul: ({ children }) => (
                                <ul className="list-none space-y-3 mb-4 break-words overflow-wrap-anywhere">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-2 text-foreground/90 mb-4 break-words overflow-wrap-anywhere">
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
                                    <li className={`flex items-start gap-3 p-4 rounded-xl border-2 ${bgColor} ${borderColor} mb-3 shadow-lg animate-in fade-in slide-in-from-left-2 text-left w-full block`}>
                                      <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                      <div className="text-foreground text-base md:text-lg flex-1 text-left break-words overflow-wrap-anywhere hyphens-auto [&_strong]:text-primary [&_strong]:font-bold">{displayChildren}</div>
                                    </li>
                                  );
                                }
                                return (
                                  <li className="text-foreground/90 text-base md:text-lg flex items-start gap-3 mb-3 p-2 hover:bg-primary/5 rounded-lg transition-colors text-left break-words overflow-wrap-anywhere">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    <span className="flex-1 text-left break-words overflow-wrap-anywhere">{children}</span>
                                  </li>
                                );
                              },
                              strong: ({ children }) => (
                                <strong className="text-primary font-bold bg-primary/15 px-2 py-0.5 rounded-md border border-primary/20 neon-text break-words overflow-wrap-anywhere inline-block">{children}</strong>
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
                                  <blockquote className={`glass-card rounded-xl p-5 neon-border mb-6 flex items-start gap-4 ${bgColor} break-words overflow-wrap-anywhere`}>
                                    <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                      {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {title && <p className={`font-display font-bold text-sm mb-1 ${iconColor}`}>{title}</p>}
                                      <p className="text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere">{children}</p>
                                    </div>
                                  </blockquote>
                                );
                              },
                              code: ({ inline, children }) => {
                                if (inline) {
                                  return <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground">{children}</code>;
                                }
                                return (
                                  <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-black/30 p-4 font-mono text-sm text-foreground">
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
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4" />
                <CarouselNext className="right-2 md:right-4" />
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
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={0} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-2xl mb-2">Стратегии торговли</h1>
              <p className="text-sm text-muted-foreground">
                Рекомендации, правила и практические стратегии для успешной торговли
              </p>
            </div>

            {/* Description card */}
            <div className="glass-card rounded-xl p-6 neon-border mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg mb-2">
                    Рекомендации и правила
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    В этом разделе собраны практические стратегии торговли, правила управления капиталом 
                    и психологические аспекты трейдинга. Изучайте материалы в удобном для вас порядке, 
                    применяйте знания на практике и развивайте свои навыки.
                  </p>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              {strategyModules.map((module, index) => (
                <motion.button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="w-full glass-card rounded-xl p-6 neon-border text-left transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{module.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg mb-1">{module.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {module.lessons.length} {module.lessons.length === 1 ? 'материал' : 'материалов'}
                      </p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </div>
                </motion.button>
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

