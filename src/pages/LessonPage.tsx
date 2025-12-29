import React, { useState, useMemo } from "react";
import { ChartEngine, useLessonEngine, InteractionEngine } from "@/core";
import { Levels, RSI, MACD } from "@/charts";
import { type Lesson, getLessonById } from "@/data/course";
import { getPatternById } from "@/data/patterns";
import { getIndicatorById } from "@/data/indicators";
import { type CandleData } from "@/charts/Candle";
import { type Level } from "@/charts/Levels";

interface LessonPageProps {
  lessonId: string;
  candles: CandleData[];
  levels?: Level[];
}

export function LessonPage({ lessonId, candles, levels = [] }: LessonPageProps) {
  const lesson = getLessonById(lessonId);
  const [interactionEngine] = useState(() => new InteractionEngine());
  
  if (!lesson) {
    return <div>Урок не найден</div>;
  }
  
  const {
    currentStep,
    isStepComplete,
    recordAction,
    completeStep,
    nextStep,
    prevStep,
    progress,
    canGoNext,
    canGoPrev,
  } = useLessonEngine({
    lesson,
    candles,
    levels,
    onStepComplete: (stepId) => {
      console.log("Шаг завершен:", stepId);
    },
    onLessonComplete: () => {
      console.log("Урок завершен!");
    },
  });
  
  // Формируем оверлеи для графика
  const overlays = useMemo(() => {
    const result: any[] = [];
    
    // Уровни поддержки/сопротивления
    if (levels.length > 0) {
      result.push({
        type: "levels" as const,
        component: (
          <Levels
            levels={levels}
            data={candles}
            width={800}
            height={400}
            onLevelClick={(level) => {
              interactionEngine.handleLevelClick(level);
              recordAction("level-click", { level });
            }}
          />
        ),
        zIndex: 5,
      });
    }
    
    // Индикаторы
    if (lesson.data?.indicatorId) {
      const indicatorConfig = getIndicatorById(lesson.data.indicatorId);
      if (indicatorConfig) {
        const indicatorData = indicatorConfig.calculate(candles);
        
        if (indicatorConfig.type === "RSI") {
          result.push({
            type: "indicator" as const,
            component: (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200 }}>
                <RSI
                  candles={candles}
                  onSignalClick={(signal, index) => {
                    interactionEngine.handleSignalClick(signal, index);
                    recordAction("signal-click", { signal, index });
                  }}
                />
              </div>
            ),
            zIndex: 10,
          });
        } else if (indicatorConfig.type === "MACD") {
          result.push({
            type: "indicator" as const,
            component: (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 200 }}>
                <MACD
                  candles={candles}
                  onSignalClick={(signal, index) => {
                    interactionEngine.handleSignalClick(signal, index);
                    recordAction("signal-click", { signal, index });
                  }}
                />
              </div>
            ),
            zIndex: 10,
          });
        }
      }
    }
    
    return result;
  }, [lesson, candles, levels, interactionEngine, recordAction]);
  
  // Обработчики взаимодействий
  const handleCandleClick = (candle: CandleData, index: number) => {
    interactionEngine.handleCandleClick(candle, index);
    recordAction("candle-click", { candle, index });
    
    // Если текущий шаг требует действия с паттерном
    if (currentStep?.requireAction === "find-pattern" && currentStep.validation?.type === "pattern") {
      const patternId = currentStep.validation.patternId;
      if (patternId) {
        const pattern = getPatternById(patternId);
        if (pattern) {
          const patternCandles = candles.slice(Math.max(0, index - pattern.candles + 1), index + 1);
          const validation = pattern.validate(patternCandles);
          
          if (validation.valid) {
            completeStep(currentStep.id);
          }
        }
      }
    }
  };
  
  return (
    <div className="lesson-page p-6 space-y-6">
      {/* Заголовок урока */}
      <div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground mt-2">{lesson.description}</p>
        <div className="mt-4">
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Прогресс: {Math.round(progress)}%
          </p>
        </div>
      </div>
      
      {/* Текущий шаг */}
      {currentStep && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Шаг {currentStep.id}
              </h3>
              <p className="text-foreground">{currentStep.content}</p>
              
              {currentStep.requireAction && (
                <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
                  <p className="text-sm text-primary">
                    ⚡ Требуется действие: {currentStep.requireAction}
                  </p>
                </div>
              )}
            </div>
            
            {isStepComplete(currentStep.id) && (
              <div className="ml-4 text-green-500">
                ✓ Выполнено
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* График */}
      <div className="bg-card border rounded-lg p-4">
        <ChartEngine
          data={candles}
          width={800}
          height={400}
          overlays={overlays}
          interactions={{
            onCandleClick: handleCandleClick,
            onLevelClick: (level, type) => {
              interactionEngine.handleLevelClick({ ...level, type });
              recordAction("level-click", { level, type });
            },
          }}
        />
      </div>
      
      {/* Навигация */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={!canGoPrev}
          className="px-4 py-2 bg-secondary rounded disabled:opacity-50"
        >
          ← Назад
        </button>
        
        <button
          onClick={nextStep}
          disabled={!canGoNext}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          Далее →
        </button>
      </div>
    </div>
  );
}

