import React, { useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowLeft, BookOpen, Brain, CheckCircle2, AlertCircle, AlertTriangle, Lightbulb, Info, Calculator } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "./Quiz";
import { SimpleMenu } from "@/components/SimpleMenu";
import { Button } from "@/components/ui/button";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import type { Lesson } from "@/types/lesson";
import {
  CandlestickChart,
  SupportResistanceChart,
  TrendChart,
  IndicatorChart,
  PatternChart,
  StrategyExample,
  SessionActivityChart,
  NewsImpactChart,
  TimeframeComparison,
  InteractiveExample,
} from "@/components/lesson-visuals";
import type { ChartConfig } from "@/components/lesson-visuals/types";
import { ChartErrorBoundary } from "@/components/ChartErrorBoundary";
import { PatternImage } from "@/components/PatternImage";

// Функции для обработки путей (вынесены наружу для стабильности)
function normalizePath(path: string): string {
  return path
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .trim();
}

function encodePath(path: string): string {
  if (!path) return path;
  const normalized = normalizePath(path);
  if (normalized.startsWith('/')) {
    const segments = normalized.substring(1).split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    return `/${encodedSegments.join('/')}`;
  } else {
    const segments = normalized.split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    return `/${encodedSegments.join('/')}`;
  }
}

function generatePathVariants(path: string): string[] {
  if (!path) return [];

  const variants: string[] = [];
  // Убираем все кавычки из пути (в начале, конце и внутри)
  const cleanedPath = path.trim()
    .replace(/^["']|["']$/g, '') // Убираем кавычки в начале и конце
    .replace(/[""]/g, '') // Убираем типографские кавычки внутри
    .replace(/['']/g, ''); // Убираем одинарные кавычки внутри
  // Убеждаемся, что путь начинается с /
  const ensureLeadingSlash = (p: string) => p.startsWith('/') ? p : `/${p}`;
  const pathWithSlash = ensureLeadingSlash(cleanedPath);

  // 1. Оригинальный путь как есть (пробуем сначала - Vite может обработать сам)
  variants.push(pathWithSlash);

  // 2. С кодированием каждого сегмента (самый надежный для Vite с кириллицей)
  if (pathWithSlash.startsWith('/')) {
    const segments = pathWithSlash.substring(1).split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    variants.push(`/${encodedSegments.join('/')}`);
  }

  // 3. С заменой пробелов на %20 (для совместимости)
  variants.push(pathWithSlash.replace(/\s/g, '%20'));

  // Убираем дубликаты и пустые строки, сохраняя порядок
  const uniqueVariants: string[] = [];
  const seen = new Set<string>();
  for (const variant of variants) {
    if (variant && variant.length > 0 && !seen.has(variant)) {
      seen.add(variant);
      uniqueVariants.push(variant);
    }
  }

  return uniqueVariants;
}

// Компонент для загрузки изображений
function ImageWithFallback({ src: originalSrc, alt }: { src: string; alt?: string }) {
  // Очищаем путь от всех кавычек (в начале, конце и внутри пути)
  const cleanedSrc = useMemo(() => {
    if (!originalSrc) return originalSrc;
    // Убираем все типы кавычек из пути
    return originalSrc.trim()
      .replace(/^["']|["']$/g, '') // Убираем кавычки в начале и конце
      .replace(/[""]/g, '') // Убираем типографские кавычки внутри
      .replace(/['']/g, ''); // Убираем одинарные кавычки внутри
  }, [originalSrc]);

  // Декодируем путь если он уже закодирован (чтобы избежать двойного кодирования)
  const decodedSrc = useMemo(() => {
    if (!cleanedSrc) return cleanedSrc;
    try {
      // Проверяем, закодирован ли путь (содержит %)
      if (cleanedSrc.includes('%')) {
        // Пробуем декодировать
        const decoded = decodeURIComponent(cleanedSrc);
        // Если декодирование успешно и результат отличается, используем декодированный
        if (decoded !== cleanedSrc && !decoded.includes('%')) {
          return decoded;
        }
      }
      return cleanedSrc;
    } catch (e) {
      // Если декодирование не удалось, используем оригинал
      return cleanedSrc;
    }
  }, [cleanedSrc]);

  // Генерируем варианты путей для попытки загрузки
  const pathVariants = useMemo(() => {
    if (!decodedSrc) return [decodedSrc];
    return generatePathVariants(decodedSrc);
  }, [decodedSrc]);

  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const currentSrc = pathVariants[currentSrcIndex] || pathVariants[0];

  const handleError = useCallback(() => {
    // Пробуем следующий вариант пути
    if (currentSrcIndex < pathVariants.length - 1) {
      const nextPath = pathVariants[currentSrcIndex + 1];
      // Логируем для проблемных изображений
      if (alt && (alt.includes('Три индейца') || alt.includes('Чашка с ручкой') || alt.includes('чашка_с_ручкой'))) {
        console.log(`[Image Debug] Пробуем следующий путь для "${alt}":`, nextPath);
      }
      setCurrentSrcIndex(currentSrcIndex + 1);
    } else {
      // Все варианты испробованы
      setHasError(true);
      console.error('Ошибка загрузки изображения:', originalSrc, 'Испробованы пути:', pathVariants);
      // Дополнительное логирование для проблемных изображений
      if (alt && (alt.includes('Три индейца') || alt.includes('Чашка с ручкой') || alt.includes('чашка_с_ручкой'))) {
        console.error(`[Image Debug] Все пути испробованы для "${alt}":`, pathVariants);
      }
    }
  }, [currentSrcIndex, pathVariants, originalSrc, alt]);

  // Сбрасываем ошибку при изменении src
  useEffect(() => {
    setHasError(false);
    setCurrentSrcIndex(0);
  }, [originalSrc]);

  if (hasError) {
    return (
      <div className="max-w-full rounded-lg my-4 mx-auto p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
        Не удалось загрузить изображение: {alt || originalSrc}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt=""
      className="max-w-full h-auto rounded-lg my-4 mx-auto block shadow-lg border border-primary/20"
      loading="lazy"
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      onError={handleError}
    />
  );
}

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

// Функция для удаления эмодзи из React элементов
function removeEmojiFromChildren(children: ReactNode): ReactNode {
  if (typeof children === 'string') {
    // Удаляем эмодзи в начале строки (может быть после дефиса и пробела)
    return children.replace(/^-\s*(✅|❌|⚠️|💡)\s*/u, '').replace(/^(✅|❌|⚠️|💡)\s*/u, '').trim();
  }
  if (typeof children === 'number') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      // Если первый элемент - строка с эмодзи, удаляем эмодзи
      if (index === 0 && typeof child === 'string') {
        const cleaned = child.replace(/^-\s*(✅|❌|⚠️|💡)\s*/u, '').replace(/^(✅|❌|⚠️|💡)\s*/u, '').trim();
        return cleaned || removeEmojiFromChildren(child);
      }
      return removeEmojiFromChildren(child);
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

interface LessonContentProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete?: () => void;
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

    // Пропускаем уже отформатированные списки (начинаются с - или *)
    if (/^[-*]\s+(✅|❌|⚠️|💡)/u.test(trimmed)) {
      // Если была группа эмодзи, закрываем её
      if (inEmojiBlock && emojiBlock.length > 0) {
        result.push(emojiBlock.join('\n'));
        emojiBlock = [];
        inEmojiBlock = false;
        emojiType = '';
      }
      // Добавляем уже отформатированный список как есть
      result.push(line);
      continue;
    }

    // Проверяем, начинается ли строка с эмодзи (с учетом возможных пробелов и жирного текста)
    // Паттерн: эмодзи, затем пробел(ы), затем текст (который может содержать **жирный**)
    const emojiMatch = trimmed.match(/^([✅❌⚠️💡])\s+(.+)$/u);

    if (emojiMatch) {
      const emoji = emojiMatch[1];
      const text = emojiMatch[2].trim(); // Убираем лишние пробелы

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

      // Добавляем как элемент списка с эмодзи в начале
      emojiBlock.push(`- ${emoji} ${text}`);
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

// Функция для извлечения атрибутов из тега
function extractAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Извлекаем все атрибуты вида key="value" или key='value'
  const attrRegex = /(\w+)="([^"]+)"|(\w+)='([^']+)'/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    if (key && value) {
      attrs[key] = value;
    }
  }
  return attrs;
}

// Функция для разбиения контента на части с компонентами
function parseContentWithComponents(content: string, defaultLessonId: string): Array<string | React.ReactElement> {
  const result: Array<string | React.ReactElement> = [];
  let componentIndex = 0;
  let lastIndex = 0;

  // Паттерны для поиска компонентов
  const patterns = [
    {
      // Markdown изображения: ![alt](src)
      // Используем более умное регулярное выражение, которое правильно обрабатывает скобки в путях
      // Ищем все изображения и парсим их вручную для лучшей обработки скобок
      regex: /!\[([^\]]*)\]\(/g,
      create: (match: RegExpMatchArray, idx: number, fullText?: string) => {
        const alt = match[1] || '';
        let src = '';

        if (fullText && match.index !== undefined) {
          // Улучшенная обработка путей со скобками
          const startPos = match.index + match[0].length;
          let depth = 1;
          let pos = startPos;

          while (pos < fullText.length && depth > 0) {
            const char = fullText[pos];
            if (char === '(') {
              depth++;
              if (depth > 1) src += char; // Добавляем скобку в путь, если она внутри
            } else if (char === ')') {
              depth--;
              if (depth === 0) break; // Закрывающая скобка markdown - не добавляем
              if (depth > 0) src += char; // Добавляем скобку в путь, если она внутри
            } else {
              src += char; // Обычный символ - добавляем
            }
            pos++;
          }
        } else {
          // Fallback на стандартное извлечение (если fullText не передан)
          // Пробуем извлечь из match[2], если есть
          const fallbackMatch = match[0].match(/\]\(([^)]+)\)/);
          src = (fallbackMatch ? fallbackMatch[1] : '').trim();
        }

        const originalSrc = src;
        // Убираем все кавычки из пути (в начале, конце и внутри)
        src = src.trim()
          .replace(/^["']|["']$/g, '') // Убираем кавычки в начале и конце
          .replace(/[""]/g, '') // Убираем типографские кавычки внутри
          .replace(/['']/g, ''); // Убираем одинарные кавычки внутри

        // Логируем для отладки всех изображений с проблемными путями
        if (src.includes('(') || src.includes(')') || src.includes('Поглощение') || src.includes('звезда')) {
          console.log(`[Image Debug] Alt: ${alt}, Original src: ${originalSrc}, Cleaned src: ${src}, fullText provided: ${!!fullText}`);
        }

        return (
          <ImageWithFallback
            key={`img-${idx}`}
            src={src}
            alt=""
          />
        );
      },
    },
    {
      regex: /<CandlestickChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        return (
          <ChartErrorBoundary key={`chart-boundary-${idx}`}>
            <CandlestickChart
              key={`chart-${idx}`}
              lessonId={lessonId}
              timeframe={(attrs.timeframe as 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4') || 'M15'}
              showLevels={attrs.showLevels !== undefined || match[0].includes('showLevels')}
              showVolume={attrs.showVolume !== undefined || match[0].includes('showVolume')}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<SupportResistanceChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        return (
          <ChartErrorBoundary key={`sr-boundary-${idx}`}>
            <SupportResistanceChart
              key={`sr-${idx}`}
              lessonId={lessonId}
              showBounces={attrs.showBounces !== 'false'}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<TrendChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        return (
          <ChartErrorBoundary key={`trend-boundary-${idx}`}>
            <TrendChart
              key={`trend-${idx}`}
              lessonId={lessonId}
              trendType={(attrs.trendType as 'up' | 'down' | 'both') || 'both'}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<IndicatorChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        const IndicatorChartComponent = IndicatorChart as React.ComponentType<{
          indicatorType: string;
          lessonId?: string;
          interactive?: boolean;
          key?: string;
        }>;
        return (
          <ChartErrorBoundary key={`indicator-boundary-${idx}`}>
            <IndicatorChartComponent
              key={`indicator-${idx}`}
              lessonId={lessonId}
              indicatorType={(attrs.type || attrs.indicatorType || 'rsi') as 'rsi' | 'macd' | 'ma' | 'bb' | 'stochastic'}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<PatternImage\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        return (
          <PatternImage
            key={`pattern-img-${idx}`}
            patternId={attrs.patternId}
            patternName={attrs.patternName}
            alt=""
          />
        );
      },
    },
    {
      regex: /<PatternChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        const PatternChartComponent = PatternChart as React.ComponentType<{
          pattern: string;
          lessonId?: string;
          interactive?: boolean;
          key?: string;
        }>;
        return (
          <ChartErrorBoundary key={`pattern-boundary-${idx}`}>
            <PatternChartComponent
              key={`pattern-${idx}`}
              lessonId={lessonId}
              pattern={attrs.pattern || 'hammer'}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<StrategyExample\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        return (
          <ChartErrorBoundary key={`strategy-boundary-${idx}`}>
            <StrategyExample
              key={`strategy-${idx}`}
              lessonId={lessonId}
              strategy={(attrs.strategy as 'trend' | 'bounce' | 'breakout' | 'news' | 'strike_zone') || 'trend'}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<SessionActivityChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        const SessionActivityChartComponent = SessionActivityChart as React.ComponentType<{
          lessonId?: string;
          interactive?: boolean;
          key?: string;
        }>;
        return (
          <ChartErrorBoundary key={`session-boundary-${idx}`}>
            <SessionActivityChartComponent
              key={`session-${idx}`}
              lessonId={lessonId}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<NewsImpactChart\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        const NewsImpactChartComponent = NewsImpactChart as React.ComponentType<{
          lessonId?: string;
          interactive?: boolean;
          key?: string;
        }>;
        return (
          <ChartErrorBoundary key={`news-boundary-${idx}`}>
            <NewsImpactChartComponent
              key={`news-${idx}`}
              lessonId={lessonId}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<TimeframeComparison\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const interactive = attrs.interactive !== 'false'; // По умолчанию true
        const TimeframeComparisonComponent = TimeframeComparison as React.ComponentType<{
          lessonId?: string;
          interactive?: boolean;
          key?: string;
        }>;
        return (
          <ChartErrorBoundary key={`timeframe-boundary-${idx}`}>
            <TimeframeComparisonComponent
              key={`timeframe-${idx}`}
              lessonId={lessonId}
              interactive={interactive}
            />
          </ChartErrorBoundary>
        );
      },
    },
    {
      regex: /<InteractiveExample\s+[^>]*\/>/gi,
      create: (match: RegExpMatchArray, idx: number) => {
        const attrs = extractAttributes(match[0]);
        const lessonId = attrs.lessonId || defaultLessonId;
        const InteractiveExampleComponent = InteractiveExample as React.ComponentType<{
          lessonId: string;
          title?: string;
          description?: string;
          defaultTimeframe?: ChartConfig['timeframe'];
          showLevels?: boolean;
          showPatterns?: boolean;
          className?: string;
        }>;
        return (
          <ChartErrorBoundary key={`interactive-boundary-${idx}`}>
            <InteractiveExampleComponent
              key={`interactive-${idx}`}
              lessonId={lessonId}
              title={attrs.title}
              description={attrs.description}
              defaultTimeframe={attrs.defaultTimeframe as ChartConfig['timeframe']}
              showLevels={attrs.showLevels !== 'false'}
              showPatterns={attrs.showPatterns !== 'false'}
            />
          </ChartErrorBoundary>
        );
      },
    },
  ];

  // Собираем все совпадения с их позициями
  const matches: Array<{ index: number; length: number; component: React.ReactElement }> = [];

  patterns.forEach(({ regex, create }) => {
    const regexMatches = Array.from(content.matchAll(regex));
    regexMatches.forEach((match) => {
      if (match.index !== undefined) {
        // Для изображений передаем content для правильной обработки скобок
        const component = (create.length === 3)
          ? (create as (match: RegExpMatchArray, idx: number, content: string) => React.ReactElement)(match, componentIndex++, content)
          : create(match, componentIndex++);

        // Для изображений нужно вычислить полную длину markdown синтаксиса
        let fullLength = match[0].length;
        if (regex.source.includes('!\\[')) {
          // Это изображение - нужно найти закрывающую скобку
          const startPos = match.index + match[0].length;
          let depth = 1;
          let pos = startPos;

          while (pos < content.length && depth > 0) {
            const char = content[pos];
            if (char === '(') {
              depth++;
            } else if (char === ')') {
              depth--;
              if (depth === 0) {
                fullLength = pos + 1 - match.index;
                break;
              }
            }
            pos++;
          }
        }

        matches.push({
          index: match.index,
          length: fullLength,
          component,
        });
      }
    });
  });

  // Сортируем по позиции
  matches.sort((a, b) => a.index - b.index);

  // Разбиваем контент на части
  matches.forEach((match) => {
    // Добавляем текст до компонента
    if (match.index > lastIndex) {
      const textPart = content.slice(lastIndex, match.index);
      if (textPart.trim()) {
        result.push(textPart);
      }
    }
    // Добавляем компонент
    result.push(match.component);
    lastIndex = match.index + match.length;
  });

  // Добавляем оставшийся текст
  if (lastIndex < content.length) {
    const textPart = content.slice(lastIndex);
    if (textPart.trim()) {
      result.push(textPart);
    }
  }

  // Если не было совпадений, возвращаем весь контент
  if (matches.length === 0) {
    return [content];
  }

  return result;
}

// Функция для разбиения контента на карточки
function parseContentToCards(content: string): string[] {
  // Сначала преобразуем строки с эмодзи в списки
  const processedContent = convertEmojiLinesToLists(content);

  const cards: string[] = [];
  const lines = processedContent.split('\n');
  let currentCard: string[] = [];
  let foundH2 = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Проверяем, является ли строка H2 заголовком (начинается с "## ")
    if (/^##\s/.test(line)) {
      foundH2 = true;
      // Если уже есть накопленная карточка, сохраняем её
      if (currentCard.length > 0) {
        cards.push(currentCard.join('\n').trim());
        currentCard = [];
      }
      // Начинаем новую карточку с этого H2
      currentCard.push(line);
    } else {
      // Добавляем строку к текущей карточке
      currentCard.push(line);
    }
  }

  // Добавляем последнюю карточку
  if (currentCard.length > 0) {
    cards.push(currentCard.join('\n').trim());
  }

  // Если не нашлось H2 заголовков, возвращаем весь контент
  if (!foundH2 || cards.length === 0) {
    return [processedContent];
  }

  return cards;
}

export function LessonContent({ lesson, onBack, onComplete }: LessonContentProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>(null);
  const [carouselHeight, setCarouselHeight] = useState<number | undefined>(undefined);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Хук для свайпа назад
  useSwipeBack({
    onSwipeBack: onBack,
    enabled: true
  });

  // КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ: Ленивая загрузка компонентов графиков
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [loadedCardIndex, setLoadedCardIndex] = useState<Set<number>>(new Set([0])); // Загружаем только первую карточку

  // Сначала обрабатываем только текст без компонентов
  const contentParts = useMemo(() => {
    if (!isContentLoaded) {
      // Удаляем все теги компонентов для первоначального отображения
      const textOnly = lesson.content.replace(/<[^>]+\/>/g, '').trim();
      return [textOnly];
    }
    return parseContentWithComponents(lesson.content, lesson.id);
  }, [lesson.content, lesson.id, isContentLoaded]);

  // Загружаем компоненты только после полной загрузки страницы
  useEffect(() => {
    // Большая задержка для предотвращения блокировки
    const timer = setTimeout(() => {
      setIsContentLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Разбиваем на карточки, учитывая компоненты
  const cards = useMemo(() => {
    // Сначала объединяем все части в одну строку для поиска H2
    const fullText = contentParts.map(part => typeof part === 'string' ? part : '\n__COMPONENT__\n').join('');

    // Разбиваем по H2 заголовкам
    const h2Sections = fullText.split(/(?=^##\s)/m).filter(section => section.trim().length > 0);

    const cardsList: Array<Array<string | React.ReactElement>> = [];

    let componentIndex = 0;
    const components = contentParts.filter(p => typeof p !== 'string') as React.ReactElement[];

    h2Sections.forEach((section, sectionIdx) => {
      if (!section.trim()) return;

      const cardParts: Array<string | React.ReactElement> = [];
      const lines = section.split('\n');
      let currentText: string[] = [];

      lines.forEach((line) => {
        if (line === '__COMPONENT__') {
          // Добавляем накопленный текст
          if (currentText.length > 0) {
            cardParts.push(currentText.join('\n'));
            currentText = [];
          }
          // Добавляем компонент
          if (componentIndex < components.length) {
            cardParts.push(components[componentIndex++]);
          }
        } else {
          currentText.push(line);
        }
      });

      // Добавляем оставшийся текст
      if (currentText.length > 0) {
        cardParts.push(currentText.join('\n'));
      }

      if (cardParts.length > 0) {
        cardsList.push(cardParts);
      }
    });

    // Если не нашлось H2, возвращаем одну карточку со всем контентом
    if (cardsList.length === 0) {
      return [contentParts];
    }

    return cardsList;
  }, [contentParts]);

  // Загружаем графики только когда карточка попадает в область видимости
  useEffect(() => {
    if (!isContentLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute('data-index');
            if (indexStr !== null) {
              const index = parseInt(indexStr, 10);
              if (!isNaN(index)) {
                // Плавная загрузка с небольшой задержкой для предотвращения фризов при быстром свайпе
                setTimeout(() => {
                  setLoadedCardIndex((prev) => {
                    if (prev.has(index)) return prev;
                    const next = new Set(prev);
                    next.add(index);
                    return next;
                  });
                }, 100);
              }
            }
          }
        });
      },
      {
        threshold: 0.2, // Загружаем, когда видно 20% карточки
        rootMargin: '0px 100px 0px 100px' // Начинаем загрузку чуть заранее по горизонтали
      }
    );

    const currentRefs = cardRefs.current;
    currentRefs.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [isContentLoaded, cards.length]);

  const isLastCard = currentSlide === cards.length - 1;

  // Отслеживаем текущий слайд и сбрасываем прокрутку
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const newSlide = api.selectedScrollSnap();
      setCurrentSlide(newSlide);

      // Сбрасываем прокрутку предыдущей карточки
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

    api.on('select', handleSelect);
    handleSelect();

    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  // Дополнительно сбрасываем прокрутку при изменении currentSlide
  useEffect(() => {
    const currentCard = cardRefs.current.get(currentSlide);
    if (currentCard) {
      currentCard.scrollTop = 0;
    }
  }, [currentSlide]);

  // Высота карусели = высота активного слайда (убирает пустоту под коротким уроком)
  useEffect(() => {
    const el = cardRefs.current.get(currentSlide);
    if (!el) return;
    const measure = () => setCarouselHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentSlide, cards.length, loadedCardIndex]);


  if (showQuiz) {
    return (
      <div className="min-h-[100dvh] p-4 pb-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setShowQuiz(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Вернуться к уроку</span>
          </button>

          <div className="glass-card rounded-xl p-6 neon-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold">Проверка знаний</h2>
                <p className="text-xs text-muted-foreground">Ответь правильно на 70% вопросов</p>
              </div>
            </div>

            <Quiz
              questions={lesson.quiz}
              onComplete={() => {
                if (onComplete) {
                  onComplete();
                }
                setShowQuiz(false);
              }}
              passingThreshold={70}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] scanline pb-8 sm:pb-10">
      <div className="relative z-10">
        {/* Sticky header с кнопкой назад */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm -mx-4 px-4 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,12px))]">
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground text-xs h-8 px-2 focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-sm">{lesson.title}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                {cards.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'w-5 bg-primary'
                      : 'w-1 bg-muted-foreground/30'
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <div className="p-4 pb-20 flex justify-center">
          <div className="w-full max-w-full mx-auto">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                dragFree: false,
                loop: false,
                containScroll: "trimSnaps",
                axis: "x",
                slidesToScroll: 1,
              }}
              className="w-full"
              style={{ touchAction: 'pan-x' }}
            >
              <CarouselContent className="-ml-0 items-start" style={{ height: carouselHeight, transition: 'height 0.25s ease' }}>
                {cards.map((card, index) => (
                  <CarouselItem key={index} className="pl-0 basis-full">
                    <div
                      ref={(el) => {
                        if (el) {
                          cardRefs.current.set(index, el);
                        }
                      }}
                      data-index={index}
                      className="glass-card rounded-xl p-4 neon-border max-h-[calc(var(--tg-viewport-height,100dvh)_-_var(--tg-content-top,0px)_-_150px)] flex flex-col overflow-hidden relative mx-auto w-full"
                      style={{ touchAction: 'pan-y pinch-zoom' }}
                    >
                      <div className="flex-1 min-h-0 prose prose-invert max-w-none w-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                        style={{ willChange: 'scroll-position', transform: 'translateZ(0)' }}>
                        <div className="markdown-content text-sm leading-relaxed w-full pb-4 px-0">
                          {/* Рендерим части карточки - чередуем markdown и компоненты */}
                          {cards[index].map((part, partIdx) => {
                            if (typeof part === 'string') {
                              // Это markdown текст - рендерим через ReactMarkdown
                              return (
                                <ReactMarkdown
                                  key={`md-${index}-${partIdx}`}
                                  components={{
                                    img: ({ node, ...props }) => {
                                      return (
                                        <ImageWithFallback
                                          src={props.src || ''}
                                          alt=""
                                        />
                                      );
                                    },
                                    p: ({ children, node }) => {
                                      // Проверяем, есть ли внутри параграфа изображение
                                      const hasImage = node && 'children' in node &&
                                        Array.isArray(node.children) &&
                                        node.children.some((child: any) => child.type === 'image');

                                      // Если есть изображение, рендерим его отдельно
                                      if (hasImage) {
                                        const imageNode = (node as { children: Array<{ type: string; url?: string }> }).children.find((child) => child.type === 'image');
                                        if (imageNode) {
                                          return (
                                            <ImageWithFallback
                                              src={imageNode.url || ''}
                                              alt=""
                                            />
                                          );
                                        }
                                      }

                                      const text = extractTextFromChildren(children);
                                      const trimmedText = text.trim();
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
                                          <div className={`flex items-start gap-2 p-3 rounded-lg border-2 ${bgColor} ${borderColor} mb-3 shadow-lg text-left w-full block`}>
                                            <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                            <div className="text-foreground text-sm flex-1 text-left break-words overflow-wrap-anywhere word-break-break-word min-w-0 whitespace-normal [&_strong]:text-primary [&_strong]:font-bold">{displayChildren}</div>
                                          </div>
                                        );
                                      }

                                      if (text.includes('✅') || text.includes('❌')) {
                                        return (
                                          <p className="text-base md:text-lg leading-relaxed mb-4 flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <span className="mt-1 flex-shrink-0">
                                              {text.includes('✅') ? (
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                              ) : (
                                                <AlertCircle className="w-5 h-5 text-destructive" />
                                              )}
                                            </span>
                                            <span className="text-foreground flex-1 break-words overflow-wrap-anywhere word-break-break-word min-w-0 whitespace-normal">{children}</span>
                                          </p>
                                        );
                                      }
                                      return <p className="text-sm text-foreground/90 leading-relaxed mb-3 break-words overflow-wrap-anywhere word-break-break-word whitespace-normal">{children}</p>;
                                    },
                                    h1: ({ children }) => (
                                      <h1 className="font-display text-base font-bold text-foreground mt-0 mb-4 neon-text flex items-center gap-2 pt-2 break-words overflow-wrap-anywhere">
                                        <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(34,197,94,0.7)] flex-shrink-0"></span>
                                        <span className="break-words overflow-wrap-anywhere min-w-0">{children}</span>
                                      </h1>
                                    ),
                                    h2: ({ children }) => {
                                      const text = extractTextFromChildren(children);
                                      const isCriticalErrors = text.includes('Критические ошибки');

                                      if (isCriticalErrors) {
                                        return (
                                          <h2 className="font-display text-sm font-semibold text-destructive mt-3 mb-2 flex items-center gap-2 border-b-2 border-destructive/30 pb-2 break-words overflow-wrap-anywhere">
                                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                            <span className="break-words overflow-wrap-anywhere min-w-0">{children}</span>
                                          </h2>
                                        );
                                      }

                                      return (
                                        <h2 className="font-display text-sm font-semibold text-foreground mt-3 mb-2 flex items-center gap-2 border-b-2 border-primary/30 pb-2 break-words overflow-wrap-anywhere">
                                          <span className="w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] flex-shrink-0"></span>
                                          <span className="break-words overflow-wrap-anywhere min-w-0">{children}</span>
                                        </h2>
                                      );
                                    },
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
                                          <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center border border-${textColor}/20 flex-shrink-0`}>
                                            {icon}
                                          </div>
                                          <span className="break-words overflow-wrap-anywhere min-w-0">{children}</span>
                                        </h3>
                                      );
                                    },
                                    ul: ({ children }) => {
                                      // Проверяем, есть ли в списке элементы с эмодзи
                                      const hasEmojiItems = React.Children.toArray(children).some((child) => {
                                        if (child && typeof child === 'object' && 'props' in child && (child.props as { children?: ReactNode }).children) {
                                          const text = extractTextFromChildren((child.props as { children: ReactNode }).children);
                                          return text.includes('❌') || text.includes('✅') || text.includes('⚠️') || text.includes('💡');
                                        }
                                        return false;
                                      });

                                      return (
                                        <ul className={`list-none ${hasEmojiItems ? 'space-y-0' : 'space-y-3'} mb-4 w-full`}>
                                          {children}
                                        </ul>
                                      );
                                    },
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside space-y-2 text-foreground/90 mb-4">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => {
                                      const text = extractTextFromChildren(children);
                                      const trimmedText = text.trim();
                                      // Проверяем наличие эмодзи в начале строки (после дефиса, пробела или без них)
                                      const hasEmojiAtStart = trimmedText.startsWith('✅') ||
                                        trimmedText.startsWith('❌') ||
                                        trimmedText.startsWith('⚠️') ||
                                        trimmedText.startsWith('💡') ||
                                        /^-\s*(✅|❌|⚠️|💡)/.test(trimmedText);

                                      // Также проверяем наличие эмодзи в тексте для специального оформления
                                      const hasEmoji = hasEmojiAtStart || text.includes('❌') || text.includes('✅') || text.includes('⚠️') || text.includes('💡');

                                      if (hasEmoji) {
                                        let icon = null;
                                        let bgColor = '';
                                        let borderColor = '';

                                        // Определяем тип эмодзи по первому найденному
                                        let emojiType = '';
                                        if (text.includes('❌')) {
                                          emojiType = '❌';
                                          icon = <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
                                          bgColor = 'bg-destructive/10';
                                          borderColor = 'border-destructive/30';
                                        } else if (text.includes('✅')) {
                                          emojiType = '✅';
                                          icon = <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
                                          bgColor = 'bg-primary/10';
                                          borderColor = 'border-primary/30';
                                        } else if (text.includes('⚠️')) {
                                          emojiType = '⚠️';
                                          icon = <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
                                          bgColor = 'bg-yellow-500/10';
                                          borderColor = 'border-yellow-500/30';
                                        } else if (text.includes('💡')) {
                                          emojiType = '💡';
                                          icon = <Lightbulb className="w-5 h-5 text-primary flex-shrink-0" />;
                                          bgColor = 'bg-primary/10';
                                          borderColor = 'border-primary/30';
                                        }

                                        // Удаляем эмодзи из children, сохраняя структуру
                                        const displayChildren = removeEmojiFromChildren(children);

                                        return (
                                          <li className={`flex items-start gap-2 p-3 rounded-lg border-2 ${bgColor} ${borderColor} mb-3 shadow-lg w-full`}>
                                            <span className="mt-0.5 flex-shrink-0">{icon}</span>
                                            <div className="text-foreground text-sm flex-1 flex flex-col items-center gap-2 text-center">
                                              <div className="[&_strong]:text-primary [&_strong]:font-bold [&_strong]:bg-primary/20 [&_strong]:border-2 [&_strong]:border-primary/50 [&_strong]:px-3 [&_strong]:py-1.5 [&_strong]:rounded-lg [&_strong]:block [&_strong]:w-full [&_strong]:mb-2 [&_strong]:text-center">
                                                {displayChildren}
                                              </div>
                                            </div>
                                          </li>
                                        );
                                      }
                                      return (
                                        <li className="text-foreground/90 text-sm flex items-start gap-2 mb-3 p-2 hover:bg-primary/5 rounded-lg transition-colors text-left">
                                          <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                          <span className="flex-1 text-left break-words overflow-wrap-anywhere">{children}</span>
                                        </li>
                                      );
                                    },
                                    strong: ({ children }) => {
                                      // В списках с эмодзи (критические ошибки) - зелёная обводка, блок на отдельной строке
                                      return (
                                        <strong className="text-primary font-bold bg-primary/20 border-2 border-primary/50 px-3 py-1.5 rounded-lg block w-full mb-2 text-center">{children}</strong>
                                      );
                                    },
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
                                        bgColor = 'bg-primary/15 border-primary/40';
                                        iconColor = 'text-primary';
                                        title = 'Совет';
                                      } else if (text.toLowerCase().includes('пример')) {
                                        icon = <Calculator className="w-6 h-6" />;
                                        bgColor = 'bg-primary/15 border-primary/40';
                                        iconColor = 'text-primary';
                                        title = 'Пример';
                                      }

                                      // Удаляем кавычки, эмодзи и "Помните:" из текста для советов
                                      const textStr = extractTextFromChildren(children);
                                      // Удаляем кавычки >, эмодзи 💡 и "Помните:" в начале
                                      let cleaned = textStr.replace(/^>\s*💡\s*\*\*Помните:\*\*\s*/i, '')
                                        .replace(/^>\s*💡\s*Помните:\s*/i, '')
                                        .replace(/^>\s*💡\s*\*\*/, '')
                                        .replace(/^>\s*💡\s*/, '')
                                        .replace(/^💡\s*\*\*Помните:\*\*\s*/i, '')
                                        .replace(/^💡\s*Помните:\s*/i, '')
                                        .replace(/^💡\s*\*\*/, '')
                                        .replace(/^💡\s*/, '')
                                        .trim();
                                      // Удаляем оставшиеся ** вокруг "Помните:"
                                      cleaned = cleaned.replace(/\*\*Помните:\*\*/gi, '').replace(/Помните:\s*/gi, '').trim();

                                      // Функция для удаления "Помните:" из ReactNode
                                      const removeRememberFromChildren = (node: ReactNode): ReactNode => {
                                        if (typeof node === 'string') {
                                          return node.replace(/\*\*Помните:\*\*/gi, '').replace(/Помните:\s*/gi, '').trim();
                                        }
                                        if (Array.isArray(node)) {
                                          return node.map(removeRememberFromChildren).filter(n => n !== '' && n !== null);
                                        }
                                        if (node && typeof node === 'object' && 'props' in node && node.props) {
                                          return {
                                            ...node,
                                            props: {
                                              ...node.props,
                                              children: removeRememberFromChildren(node.props.children)
                                            }
                                          };
                                        }
                                        return node;
                                      };

                                      const displayText = cleaned !== textStr ? cleaned : removeRememberFromChildren(children);

                                      return (
                                        <blockquote className={`border-l-4 ${bgColor} pl-4 py-3 my-4 rounded-r-lg flex flex-col items-center gap-3 shadow-lg text-center`}>
                                          <div className={`${iconColor} flex-shrink-0 w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center border-2 ${bgColor.split(' ')[0]}`}>
                                            {icon}
                                          </div>
                                          <div className="flex-1 min-w-0 w-full text-center">
                                            {title && (
                                              <div className={`font-bold text-base mb-2 ${iconColor}`}>{title}</div>
                                            )}
                                            <div className="text-foreground text-sm block text-center [&_strong]:text-foreground [&_strong]:font-normal">{displayText}</div>
                                          </div>
                                        </blockquote>
                                      );
                                    },
                                    code: ({ children, className }) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const isInline = !match;

                                      if (isInline) {
                                        return (
                                          <code className="bg-primary/20 px-2 py-1 rounded-md text-primary font-mono text-sm border border-primary/30 font-semibold break-words overflow-wrap-anywhere">
                                            {children}
                                          </code>
                                        );
                                      }

                                      return (
                                        <div className="my-5 relative break-words overflow-wrap-anywhere">
                                          <div className="absolute top-3 right-3 z-10">
                                            <Badge variant="secondary" className="text-xs bg-primary/20 border-primary/40 break-words overflow-wrap-anywhere">
                                              {match[1]}
                                            </Badge>
                                          </div>
                                          <code className={`block bg-muted/70 p-5 rounded-xl text-primary font-mono text-sm border-2 border-primary/30 overflow-x-auto shadow-lg break-words overflow-wrap-anywhere word-break-break-word whitespace-pre-wrap ${className}`}>
                                            {children}
                                          </code>
                                        </div>
                                      );
                                    },
                                  }}
                                >
                                  {part}
                                </ReactMarkdown>
                              );
                            } else {
                              // Это компонент - рендерим только если карточка загружена
                              const isLoaded = loadedCardIndex.has(index);
                              return (
                                <div key={`comp-${index}-${partIdx}`} className="my-6 min-h-[200px] flex items-center justify-center bg-muted/5 rounded-xl border border-border/30">
                                  {isLoaded ? part : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
                                      <Brain className="w-8 h-8 opacity-20" />
                                      <span className="text-[10px] uppercase tracking-wider font-mono">Loading dynamic context...</span>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>

            {/* Прогресс индикатор */}
            <div className="flex justify-center gap-1.5 mt-4">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                    ? 'bg-primary w-8 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                    : 'bg-primary/20 w-1.5'
                    }`}
                />
              ))}
            </div>

            {isLastCard && lesson.quiz && lesson.quiz.length > 0 && (
              <button
                onClick={() => setShowQuiz(true)}
                className="mt-4 w-full glass-card rounded-xl p-4 neon-border hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2 font-display font-semibold text-base min-h-[44px]"
              >
                <Brain className="w-6 h-6 text-primary" />
                <span>Пройти квиз</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
