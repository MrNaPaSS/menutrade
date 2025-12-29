export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: string;
  isLocked: boolean;
  isCompleted: boolean;
  quiz: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  icon: string;
  quiz?: QuizQuestion[];
  isCompleted?: boolean;
}
