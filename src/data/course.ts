export type LessonType = 
  | "candle-anatomy"
  | "pattern"
  | "indicator"
  | "support-resistance"
  | "trend"
  | "strategy"
  | "theory";

export interface LessonStep {
  id: string;
  type: "text" | "interactive" | "validation" | "quiz";
  content: string;
  requireAction?: string; // ID действия, которое нужно выполнить
  highlight?: string; // Что выделить на графике
  validation?: {
    type: "pattern" | "level" | "signal";
    patternId?: string;
    levelPrice?: number;
    signalType?: "buy" | "sell";
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  duration: string;
  steps: LessonStep[];
  data?: {
    patternId?: string;
    indicatorId?: string;
    candles?: any[]; // Данные свечей для урока
  };
  quiz?: any[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  modules: Module[];
}

// Пример структуры курса
export const course: Course = {
  modules: [
    {
      id: "module-11",
      title: "Паттерны свечей и графические фигуры",
      description: "Разворотные и продолжающие паттерны, фигуры технического анализа",
      order: 11,
      lessons: [
        {
          id: "lesson-11-1",
          title: "Разворотные паттерны свечей",
          description: "Молот, Повешенный, Поглощение, Звезды, Доджи",
          type: "pattern",
          duration: "15 мин",
          data: {
            patternId: "hammer",
          },
          steps: [
            {
              id: "step-1",
              type: "text",
              content: "Паттерн Молот - это разворотный паттерн, который появляется в конце нисходящего тренда",
            },
            {
              id: "step-2",
              type: "interactive",
              content: "Найди паттерн Молот на графике",
              requireAction: "find-pattern",
              highlight: "pattern",
              validation: {
                type: "pattern",
                patternId: "hammer",
              },
            },
          ],
        },
      ],
    },
  ],
};

export const getLessonById = (id: string): Lesson | undefined => {
  for (const module of course.modules) {
    const lesson = module.lessons.find(l => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getModuleById = (id: string): Module | undefined => {
  return course.modules.find(m => m.id === id);
};




