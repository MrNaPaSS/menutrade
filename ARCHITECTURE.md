# 🏗️ Архитектура обучающего трейдинг-движка

## 📁 Структура проекта

```
src/
 ├─ core/                    # Ядро системы
 │   ├─ ChartEngine.tsx      # Единый движок для всех графиков
 │   ├─ LessonEngine.tsx     # Управление уроками и шагами
 │   ├─ InteractionEngine.ts  # Обработка взаимодействий
 │   └─ ValidationEngine.ts   # Валидация паттернов и уровней
 │
 ├─ charts/                  # Компоненты графиков
 │   ├─ Candle.tsx           # SVG компонент свечи
 │   ├─ PriceChart.tsx       # График цен
 │   ├─ Levels.tsx           # Уровни поддержки/сопротивления
 │   ├─ IndicatorPanel.tsx  # Базовый компонент индикатора
 │   ├─ RSI.tsx              # Индикатор RSI
 │   └─ MACD.tsx             # Индикатор MACD
 │
 ├─ data/                    # Данные курса
 │   ├─ patterns.ts          # Все паттерны с валидацией
 │   ├─ indicators.ts        # Все индикаторы с расчетами
 │   └─ course.ts            # Структура всего курса
 │
 └─ pages/
     └─ LessonPage.tsx       # Страница урока (пример использования)
```

## 🎯 Ключевые принципы

### 1. **Все свечи — SVG, без картинок**
```tsx
<Candle
  data={candle}
  x={x}
  width={candleWidth}
  yScale={yScale}
/>
```

### 2. **Все паттерны — логика, не картинки**
```ts
{
  id: "hammer",
  name: "Молот",
  validate: (candles, context) => validatePattern("hammer", candles, context),
  render: (candles) => renderPatternSVG(candles),
}
```

### 3. **Все индикаторы — один шаблон**
```tsx
<IndicatorPanel
  indicator={indicatorData}
  width={800}
  height={200}
  onSignalClick={handleSignalClick}
/>
```

### 4. **Весь курс — данными**
```ts
export const course: Course = {
  modules: [
    {
      id: "module-11",
      title: "Паттерны свечей",
      lessons: [
        {
          id: "lesson-11-1",
          type: "pattern",
          data: { patternId: "hammer" },
          steps: [...]
        }
      ]
    }
  ]
};
```

## 🔧 Использование

### Базовый пример урока

```tsx
import { LessonPage } from "@/pages/LessonPage";
import { generateCandles } from "@/utils/candles";

const candles = generateCandles(100);
const levels = [
  { price: 1.0850, type: "resistance", strength: 0.8, touches: 3 },
  { price: 1.0800, type: "support", strength: 0.9, touches: 5 },
];

<LessonPage
  lessonId="lesson-11-1"
  candles={candles}
  levels={levels}
/>
```

### Создание нового паттерна

```ts
// src/data/patterns.ts
{
  id: "new-pattern",
  name: "Новый паттерн",
  type: "разворотный",
  candles: 2,
  description: "Описание паттерна",
  validate: (candles, context) => {
    // Логика валидации
    const valid = candles[0].close < candles[1].close;
    return {
      valid,
      strength: valid ? 0.8 : 0,
      message: valid ? "Паттерн найден" : "Паттерн не найден"
    };
  },
  render: (candles) => renderPatternSVG(candles),
}
```

### Создание нового индикатора

```ts
// src/data/indicators.ts
{
  id: "new-indicator",
  name: "Новый индикатор",
  type: "MovingAverage",
  calculate: (candles, period = 20) => {
    // Расчет значений
    const values = calculateMA(candles, period);
    return {
      type: "MovingAverage",
      values,
      timestamps: candles.map(c => c.timestamp),
    };
  },
}
```

### Валидация уровня

```tsx
import { validateLevel } from "@/core/ValidationEngine";

const validation = validateLevel(1.0850, candles, 0.01);
if (validation.valid) {
  console.log("Уровень подтвержден:", validation.strength);
} else {
  console.error("Слабый уровень:", validation.message);
}
```

## 🎨 Кастомизация

### Стили свечей
```tsx
<Candle
  data={candle}
  bullishColor="#22c55e"
  bearishColor="#ef4444"
  shadowColor="#6b7280"
/>
```

### Оверлеи на графике
```tsx
<ChartEngine
  data={candles}
  overlays={[
    {
      type: "levels",
      component: <Levels levels={levels} />,
      zIndex: 5,
    },
    {
      type: "indicator",
      component: <RSI candles={candles} />,
      zIndex: 10,
    },
  ]}
/>
```

## 📊 Преимущества архитектуры

✅ **Масштабируемость** — легко добавлять новые паттерны и индикаторы  
✅ **Типобезопасность** — полная поддержка TypeScript  
✅ **Производительность** — SVG рендеринг, оптимизированные вычисления  
✅ **Интерактивность** — все элементы кликабельны и валидируемы  
✅ **Данные, не хардкод** — весь курс в структурированных данных  
✅ **Без картинок** — все отрисовывается программно  

## 🚀 Следующие шаги

1. Добавить генерацию тестовых данных свечей
2. Расширить валидацию для графических фигур
3. Добавить анимации переходов между шагами
4. Реализовать сохранение прогресса
5. Добавить больше индикаторов (Bollinger Bands, Stochastic)

