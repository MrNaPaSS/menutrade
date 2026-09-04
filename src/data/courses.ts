import { Module } from "@/types/lesson";
import { modules as binaryModules } from "@/data/lessons";
import { cryptoModules } from "@/data/cryptoLessons";
import { forexModules } from "@/data/forexLessons";

export type CourseId = "binary" | "forex" | "crypto";

export interface Course {
  id: CourseId;
  title: string;
  description: string;
  icon: string;
  modules: Module[];
}

/**
 * Реестр обучающих треков приложения.
 *
 * Внимание: модули "module-3", "module-4", "module-5" курса по бинарным опционам
 * это модули стратегий. useProgress исключает их из основного обучения,
 * поэтому здесь они намеренно оставлены в исходном виде: фильтрация остаётся
 * на стороне потребителя, чтобы не менять текущее поведение.
 */
export const courses: Course[] = [
  {
    id: "binary",
    title: "Бинарные опционы",
    description:
      "Базовый курс: типы опционов, экспирация, технический анализ и торговля без стоп-лоссов",
    icon: "🎓",
    modules: binaryModules
  },
  {
    id: "forex",
    title: "Форекс",
    description:
      "Smart Money на валютном рынке: структура, ликвидность, торговые сессии, IPDA, SMT и проп-трейдинг",
    icon: "💱",
    modules: forexModules
  },
  {
    id: "crypto",
    title: "Криптотрейдинг",
    description:
      "Smart Money на крипторынке: структура, ликвидность, зоны интереса, Вайкофф, кластерный анализ и спот",
    icon: "₿",
    modules: cryptoModules
  }
];

export const getCourseById = (id: CourseId): Course | undefined =>
  courses.find(course => course.id === id);

export default courses;
