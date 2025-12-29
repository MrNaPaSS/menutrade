export interface Pattern {
  id: string;
  name: string;
  nameEn: string;
  type: "разворотный" | "продолжающий" | "графическая фигура" | "гармонический";
  candles?: number;
  svg?: string;
  png?: string;
  description: string;
}

export const patterns: Pattern[] = [
  // Разворотные паттерны свечей
  {
    id: "hammer",
    name: "Молот",
    nameEn: "Hammer",
    type: "разворотный",
    candles: 1,
    description: "Разворот вниз → вверх после падения"
  },
  {
    id: "hanging-man",
    name: "Повешенный",
    nameEn: "Hanging Man",
    type: "разворотный",
    candles: 1,
    description: "Разворот вверх → вниз после роста"
  },
  {
    id: "bullish-engulfing",
    name: "Бычье поглощение",
    nameEn: "Bullish Engulfing",
    type: "разворотный",
    candles: 2,
    description: "Разворот вниз → вверх"
  },
  {
    id: "bearish-engulfing",
    name: "Медвежье поглощение",
    nameEn: "Bearish Engulfing",
    type: "разворотный",
    candles: 2,
    description: "Разворот вверх → вниз"
  },
  {
    id: "morning-star",
    name: "Утренняя звезда",
    nameEn: "Morning Star",
    type: "разворотный",
    candles: 3,
    description: "Разворот вниз → вверх"
  },
  {
    id: "evening-star",
    name: "Вечерняя звезда",
    nameEn: "Evening Star",
    type: "разворотный",
    candles: 3,
    description: "Разворот вверх → вниз"
  },
  {
    id: "doji",
    name: "Доджи",
    nameEn: "Doji",
    type: "разворотный",
    candles: 1,
    description: "Неопределенность, возможный разворот"
  },
  
  // Продолжающие паттерны свечей
  {
    id: "bull-flag",
    name: "Бычий флаг",
    nameEn: "Bull Flag",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Бычий флаг.png",
    description: "Продолжение восходящего тренда"
  },
  {
    id: "bear-flag",
    name: "Медвежий флаг",
    nameEn: "Bear Flag",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Медвежий флаг.png",
    description: "Продолжение нисходящего тренда"
  },
  {
    id: "bull-pennant",
    name: "Бычий вымпел",
    nameEn: "Bull Pennant",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Бычий вымпел.png",
    description: "Продолжение восходящего тренда"
  },
  {
    id: "bear-pennant",
    name: "Медвежий вымпел",
    nameEn: "Bear Pennant",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Медвежий вымпел.png",
    description: "Продолжение нисходящего тренда"
  },
  {
    id: "ascending-triangle",
    name: "Восходящий треугольник",
    nameEn: "Ascending Triangle",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Восходщий треугольник.png",
    description: "Продолжение восходящего тренда"
  },
  {
    id: "descending-triangle",
    name: "Нисходящий треугольник",
    nameEn: "Descending Triangle",
    type: "продолжающий",
    png: "/патерны/Графическая фигура Нисходящий треугольник.png",
    description: "Продолжение нисходящего тренда"
  },
  
  // Графические фигуры
  {
    id: "head-and-shoulders",
    name: "Голова и плечи",
    nameEn: "Head and Shoulders",
    type: "графическая фигура",
    png: "/патерны/голова и плечи.png",
    description: "Разворот вниз"
  },
  {
    id: "double-top",
    name: "Двойная вершина",
    nameEn: "Double Top",
    type: "графическая фигура",
    png: "/патерны/двойная вершина.png",
    description: "Разворот вниз"
  },
  {
    id: "double-bottom",
    name: "Двойное дно",
    nameEn: "Double Bottom",
    type: "графическая фигура",
    png: "/патерны/двойное дно.png",
    description: "Разворот вверх"
  },
  {
    id: "triple-indians",
    name: "Три индейца",
    nameEn: "Three Indians",
    type: "графическая фигура",
    png: "/патерны/Графическая фигура Три индейца показана синим и голубым цветом. Красным цветом отмечены касания линии тренда.png",
    description: "Разворот вниз"
  },
  {
    id: "triple-top",
    name: "Тройная вершина",
    nameEn: "Triple Top",
    type: "графическая фигура",
    png: "/патерны/двойная вершина.png", // Временно используем двойную вершину, пока нет отдельного изображения
    description: "Разворот вниз - три пика на одном уровне"
  },
  {
    id: "triple-bottom",
    name: "Тройное дно",
    nameEn: "Triple Bottom",
    type: "графическая фигура",
    png: "/патерны/двойное дно.png", // Временно используем двойное дно, пока нет отдельного изображения
    description: "Разворот вверх - три впадины на одном уровне"
  },
  {
    id: "cup-with-handle",
    name: "Чашка с ручкой",
    nameEn: "Cup with Handle",
    type: "графическая фигура",
    png: "/патерны/чашка_с_ручкой.png",
    description: "Разворот вверх"
  },
  {
    id: "diamond",
    name: "Бриллиант",
    nameEn: "Diamond",
    type: "графическая фигура",
    png: "/патерны/бриллиант патерн.png",
    description: "Разворот"
  },
  {
    id: "triple-black-crows",
    name: "Три чёрные волны",
    nameEn: "Three Black Crows",
    type: "графическая фигура",
    png: "/патерны/три чёрные волны.png",
    description: "Разворот вниз"
  },
  {
    id: "triangle-squeeze",
    name: "Треугольник с поджатием",
    nameEn: "Triangle Squeeze",
    type: "графическая фигура",
    png: "/патерны/Треугольник с поджатием.png",
    description: "Продолжение тренда"
  },
  {
    id: "broadening-top",
    name: "Трубовидная вершина",
    nameEn: "Broadening Top",
    type: "графическая фигура",
    png: "/патерны/трубовидная вершина.png",
    description: "Разворот вниз"
  },
  {
    id: "broadening-bottom",
    name: "Трубовидное дно",
    nameEn: "Broadening Bottom",
    type: "графическая фигура",
    png: "/патерны/графическая фигура трубовидное дно.png",
    description: "Разворот вверх"
  },
  
  // Гармонические паттерны
  {
    id: "butterfly-gartley",
    name: "Бабочка Гартли",
    nameEn: "Butterfly Gartley",
    type: "гармонический",
    png: "/патерны/Бычий вариант паттерна Бабочка Гартли.png",
    description: "Гармонический паттерн"
  },
  {
    id: "bat",
    name: "Летучая мышь",
    nameEn: "Bat",
    type: "гармонический",
    png: "/патерны/Паттерн Летучая мышь медвежийвариант.png",
    description: "Гармонический паттерн"
  },
  {
    id: "crab",
    name: "Краб",
    nameEn: "Crab",
    type: "гармонический",
    png: "/патерны/Паттерн Краб показан синим цветом.png",
    description: "Гармонический паттерн"
  },
  {
    id: "shark",
    name: "Акула",
    nameEn: "Shark",
    type: "гармонический",
    png: "/патерны/Паттерн Акула Слева показан бычий вариант справа медвежий.png",
    description: "Гармонический паттерн"
  },
  {
    id: "five-zero",
    name: "Паттерн 5-0",
    nameEn: "5-0 Pattern",
    type: "гармонический",
    png: "/патерны/Паттерн показан фиолетовым цветом.png",
    description: "Гармонический паттерн"
  }
];

export const getPatternById = (id: string): Pattern | undefined => {
  return patterns.find(p => p.id === id);
};

export const getPatternByName = (name: string): Pattern | undefined => {
  return patterns.find(p => p.name === name || p.nameEn === name);
};
