import { getPatternById, getPatternByName, type Pattern } from "@/data/patterns";
import { PatternImageWithFallback } from "./PatternImageWithFallback";

interface PatternImageProps {
  patternId?: string;
  patternName?: string;
  alt?: string;
  className?: string;
}

export function PatternImage({ patternId, patternName, alt, className = "" }: PatternImageProps) {
  let pattern: Pattern | undefined;
  
  if (patternId) {
    pattern = getPatternById(patternId);
  } else if (patternName) {
    pattern = getPatternByName(patternName);
  }
  
  if (!pattern) {
    return (
      <div className={`max-w-full rounded-lg my-4 mx-auto p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center ${className}`}>
        Паттерн не найден: {patternId || patternName}
      </div>
    );
  }
  
  // Если есть PNG, используем его
  if (pattern.png) {
    return (
      <div className={`max-w-full my-4 mx-auto ${className}`}>
        <PatternImageWithFallback 
          src={pattern.png}
          alt=""
          pathVariants={[pattern.png]}
          patternId={pattern.id}
        />
      </div>
    );
  }
  
  // Если нет изображения, показываем описание
  return (
    <div className={`max-w-full rounded-lg my-4 mx-auto p-4 bg-primary/10 border border-primary/20 ${className}`}>
      <p className="text-foreground font-semibold">{pattern.name}</p>
      <p className="text-muted-foreground text-sm mt-1">{pattern.description}</p>
    </div>
  );
}
