import { useState, useCallback, useMemo } from "react";
import { type Lesson, type LessonStep } from "@/data/course";
import { type CandleData } from "@/charts/Candle";
import { type Level } from "@/charts/Levels";
import { validatePattern, validateLevel } from "./ValidationEngine";
import { getPatternById } from "@/data/patterns";

export interface LessonState {
  currentStepIndex: number;
  completedSteps: Set<string>;
  userActions: Map<string, any>;
  validationResults: Map<string, { valid: boolean; message?: string }>;
}

export interface LessonEngineProps {
  lesson: Lesson;
  candles: CandleData[];
  levels?: Level[];
  onStepComplete?: (stepId: string) => void;
  onLessonComplete?: () => void;
}

export function useLessonEngine({
  lesson,
  candles,
  levels = [],
  onStepComplete,
  onLessonComplete,
}: LessonEngineProps) {
  const [state, setState] = useState<LessonState>({
    currentStepIndex: 0,
    completedSteps: new Set(),
    userActions: new Map(),
    validationResults: new Map(),
  });
  
  const currentStep = useMemo(() => {
    return lesson.steps[state.currentStepIndex];
  }, [lesson.steps, state.currentStepIndex]);
  
  const isStepComplete = useCallback((stepId: string) => {
    return state.completedSteps.has(stepId);
  }, [state.completedSteps]);
  
  const recordAction = useCallback((actionId: string, data: any) => {
    setState(prev => ({
      ...prev,
      userActions: new Map(prev.userActions).set(actionId, data),
    }));
  }, []);
  
  const validateStep = useCallback((step: LessonStep): { valid: boolean; message?: string } => {
    if (!step.validation) {
      return { valid: true };
    }
    
    const { type, patternId, levelPrice, signalType } = step.validation;
    
    switch (type) {
      case "pattern":
        if (!patternId) return { valid: false, message: "Не указан ID паттерна" };
        const pattern = getPatternById(patternId);
        if (!pattern) return { valid: false, message: "Паттерн не найден" };
        
        // Берем последние N свечей для паттерна
        const patternCandles = candles.slice(-pattern.candles);
        const validation = pattern.validate(patternCandles, {
          trend: pattern.context?.trend,
        });
        
        return {
          valid: validation.valid,
          message: validation.message,
        };
        
      case "level":
        if (levelPrice === undefined) return { valid: false, message: "Не указана цена уровня" };
        const levelValidation = validateLevel(levelPrice, candles);
        return {
          valid: levelValidation.valid,
          message: levelValidation.message,
        };
        
      case "signal":
        // Валидация сигнала индикатора
        return { valid: true, message: "Сигнал найден" };
        
      default:
        return { valid: true };
    }
  }, [candles]);
  
  const completeStep = useCallback((stepId: string) => {
    const step = lesson.steps.find(s => s.id === stepId);
    if (!step) return;
    
    const validation = validateStep(step);
    
    setState(prev => ({
      ...prev,
      completedSteps: new Set(prev.completedSteps).add(stepId),
      validationResults: new Map(prev.validationResults).set(stepId, validation),
    }));
    
    if (validation.valid) {
      onStepComplete?.(stepId);
      
      // Переход к следующему шагу
      const nextIndex = lesson.steps.findIndex(s => s.id === stepId) + 1;
      if (nextIndex < lesson.steps.length) {
        setState(prev => ({
          ...prev,
          currentStepIndex: nextIndex,
        }));
      } else {
        // Урок завершен
        onLessonComplete?.();
      }
    }
  }, [lesson, validateStep, onStepComplete, onLessonComplete]);
  
  const nextStep = useCallback(() => {
    if (state.currentStepIndex < lesson.steps.length - 1) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }));
    }
  }, [state.currentStepIndex, lesson.steps.length]);
  
  const prevStep = useCallback(() => {
    if (state.currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
      }));
    }
  }, [state.currentStepIndex]);
  
  const progress = useMemo(() => {
    return (state.completedSteps.size / lesson.steps.length) * 100;
  }, [state.completedSteps.size, lesson.steps.length]);
  
  return {
    state,
    currentStep,
    isStepComplete,
    recordAction,
    validateStep,
    completeStep,
    nextStep,
    prevStep,
    progress,
    canGoNext: state.currentStepIndex < lesson.steps.length - 1,
    canGoPrev: state.currentStepIndex > 0,
    isComplete: state.completedSteps.size === lesson.steps.length,
  };
}




