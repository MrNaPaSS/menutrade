import { useState, useCallback, useMemo } from "react";

// Генерируем варианты путей для надежной загрузки
function generatePathVariants(path: string): string[] {
  if (!path) return [];
  
  const variants: string[] = [];
  // Убираем все кавычки из пути
  const cleanedPath = path.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[""]/g, '')
    .replace(/['']/g, '');
  
  const ensureLeadingSlash = (p: string) => p.startsWith('/') ? p : `/${p}`;
  const pathWithSlash = ensureLeadingSlash(cleanedPath);
  
  // 1. Оригинальный путь как есть
  variants.push(pathWithSlash);
  
  // 2. С кодированием каждого сегмента (самый надежный для Vite с кириллицей)
  if (pathWithSlash.startsWith('/')) {
    const segments = pathWithSlash.substring(1).split('/');
    const encodedSegments = segments.map(segment => encodeURIComponent(segment));
    variants.push(`/${encodedSegments.join('/')}`);
  }
  
  // 3. С заменой пробелов на %20
  variants.push(pathWithSlash.replace(/\s/g, '%20'));
  
  // Убираем дубликаты
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

interface PatternImageWithFallbackProps {
  src: string;
  alt: string;
  pathVariants: string[];
  patternId: string;
}

function PatternImageWithFallback({ src, alt, pathVariants: initialVariants, patternId }: PatternImageWithFallbackProps) {
  // Генерируем варианты путей
  const pathVariants = useMemo(() => {
    if (initialVariants && initialVariants.length > 0) {
      return initialVariants.flatMap(v => generatePathVariants(v));
    }
    return generatePathVariants(src);
  }, [src, initialVariants]);
  
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  const currentSrc = pathVariants[currentSrcIndex] || pathVariants[0];
  
  const handleError = useCallback(() => {
    if (currentSrcIndex < pathVariants.length - 1) {
      setCurrentSrcIndex(currentSrcIndex + 1);
    } else {
      setHasError(true);
      console.error(`Ошибка загрузки изображения паттерна ${patternId}. Испробованы пути:`, pathVariants);
    }
  }, [currentSrcIndex, pathVariants, patternId]);
  
  if (hasError) {
    return (
      <div className="max-w-full rounded-lg my-4 mx-auto p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
        Не удалось загрузить изображение: {alt}
      </div>
    );
  }
  
  return (
    <img 
      src={currentSrc} 
      alt=""
      title=""
      className="max-w-full h-auto rounded-lg shadow-lg border border-primary/20"
      loading="lazy"
      onError={handleError}
    />
  );
}

export { PatternImageWithFallback };

