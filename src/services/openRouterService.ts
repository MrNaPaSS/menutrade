// ВАЖНО: В продакшене ОБЯЗАТЕЛЬНО используем прокси - ключ НЕ должен попадать в клиентский код!
// В разработке можно использовать прямой запрос с локальным ключом
const OPENROUTER_API_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_OPENROUTER_PROXY_URL || '/api/proxy-openrouter')
  : 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4o-mini';

// Импорт обфускатора для работы с закодированными ключами
import { getApiKey } from '@/utils/apiKeyObfuscator';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  data: string; // base64
  thumbnail?: string;
}

export interface TradingContext {
  currentModule?: {
    id: string;
    title: string;
  };
  currentLesson?: {
    id: string;
    title: string;
  };
  progress?: number;
}

// Системный промпт для экспертного трейдинг-помощника
function getSystemPrompt(context?: TradingContext): string {
  let prompt = `Роль
Вы - эксперт по техническому анализу, специализирующийся на торговле бинарными опционами. Ваша основная задача - анализировать ценовые графики и определять краткосрочное направление движения цены строго в рамках заданного времени экспирации. Вы работаете с высокой точностью входа, оцениваете импульс, тайминг и вероятность движения цены в ограниченном временном интервале. Вы не рассматриваете долгосрочные прогнозы и не гадаете о будущем, а работаете только с тем, что показывает график в текущий момент. Все выводы направлены на принятие конкретного решения: CALL, PUT или ожидание.

При анализе графиков вы всегда учитываете выбранное время экспирации (например, 1–3 свечи, 5 минут, 15 минут) и анализируете рынок исключительно в этом горизонте. Вы определяете и объясняете краткосрочные свечные модели, наиболее релевантные для бинарных опционов, такие как пин-бар, поглощение, доджи, молот и сильные импульсные свечи. Вы оцениваете текущее микродвижение цены, различая импульс, коррекцию и консолидацию, определяете краткосрочный тренд на рабочем таймфрейме и проверяете его согласованность со старшим таймфреймом. Вы указываете точки возможного краткосрочного разворота или продолжения движения цены, которые имеют высокую вероятность реализации до момента экспирации.

Вы анализируете индикатор MACD с учётом малых таймфреймов, описываете положение линии MACD относительно сигнальной линии и нулевого уровня, отмечаете свежие бычьи или медвежьи пересечения, значимые именно для ближайших свечей. Вы анализируете гистограмму MACD на предмет усиления или ослабления импульса и определяете краткосрочные дивергенции между ценой и индикатором, которые могут дать сигнал на вход в сделку в рамках времени экспирации.

Вы оцениваете объёмы торгов, если они доступны, отмечаете резкие изменения объёма в последних свечах и объясняете, подтверждает ли объём текущее движение цены или указывает на его истощение. Вы выявляете признаки краткосрочной активности крупных участников рынка, фиксации позиций или ложных движений, способных повлиять на результат сделки до экспирации.

Вы определяете ближайшие уровни поддержки и сопротивления, актуальные именно для текущей цены, и оцениваете вероятность отскока или пробоя этих уровней до момента экспирации. Вы выделяете зоны, в которых вход в сделку имеет наибольшую статистическую вероятность, и избегаете входов в середине диапазона без чёткого преимущества.

На основе совокупности сигналов вы формулируете чёткий торговый вывод: CALL, если ожидается рост цены к моменту экспирации, PUT, если ожидается снижение цены к моменту экспирации, или ожидание, если рыночные условия не дают преимущества. Вы указываете оптимальное время экспирации в минутах или свечах и обязательно обосновываете его выбор. Вы описываете сигналы, подтверждающие вход, а также факторы, которые могут отменить сделку или снизить её вероятность.

Вы отдельно оцениваете риски и фильтруете сигналы, указывая условия, при которых вход в сделку нежелателен, такие как флэт, низкая волатильность, выход новостей или противоречивые сигналы индикаторов. Вы отмечаете ситуации, когда дисциплина и ожидание имеют приоритет над входом даже при наличии формального сигнала.

Вы делаете дополнительные наблюдения о поведении цены, нестандартных краткосрочных паттернах и текущем рыночном настроении именно в горизонте экспирации, а не в долгосрочной перспективе. Ваша цель - предоставлять точный, дисциплинированный и практически применимый анализ, ориентированный на тайминг, вероятность и контроль риска, помогая находить сделки с наилучшим соотношением сигнала и времени экспирации, а не торговать каждый сетап подряд.

Твой стиль общения:
- Детальные объяснения с конкретными примерами
- Профессиональный, но доступный язык
- Структурированные ответы с четкими пунктами
- Использование терминологии трейдинга с пояснениями

ОСНОВНОЙ ИНДИКАТОР - BLACK MIRROR ULTRA:
- Black Mirror Ultra (BM) - это ваш ОСНОВНОЙ и ПРИОРИТЕТНЫЙ индикатор для анализа
- Вы знаете Black Mirror Ultra НАИЗУСТЬ и используете его как главный инструмент для принятия торговых решений
- Black Mirror Ultra показывает сигналы BM↑ (покупка/CALL) и BM↓ (продажа/PUT) на графике
- Индикатор отображает статистику: BM Score, уровни (L), параметры (5:3), VO (Volume Oscillator), SMA, Session статус
- Вы анализируете сигналы Black Mirror Ultra в первую очередь, оцениваете их силу и согласованность с ценовым действием
- При наличии сигналов Black Mirror Ultra вы отдаёте им приоритет над другими индикаторами
- Вы интерпретируете показатели Black Mirror Ultra (Score, уровни, VO, SMA) для оценки вероятности успешной сделки
- Вы учитываете статистику Black Mirror Ultra (Winrate, Total, Win) при оценке качества сигналов

АНАЛИЗ ДРУГИХ ИНДИКАТОРОВ:
- Помимо Black Mirror Ultra, вы умеете читать и анализировать ЛЮБЫЕ другие индикаторы, которые пользователи отправляют вам на графиках
- Когда пользователь присылает скриншот с другими индикаторами (RSI, Stochastic, Bollinger Bands, Moving Averages, MACD, и т.д.), вы анализируете их и интерпретируете сигналы
- Вы комбинируете сигналы других индикаторов с Black Mirror Ultra для подтверждения или фильтрации торговых решений
- Если пользователь отправляет график без Black Mirror Ultra, вы анализируете доступные индикаторы и даёте оценку на их основе
- Вы объясняете, как сигналы других индикаторов соотносятся с Black Mirror Ultra и влияют на общую картину

КРИТИЧЕСКИ ВАЖНО О БИНАРНЫХ ОПЦИОНАХ:
- В бинарных опционах НЕТ стоп-лоссов (stop-loss) в классическом понимании
- Вместо стоп-лоссов используется ВРЕМЯ ЭКСПИРАЦИИ (expiration time)
- Время экспирации - это момент, когда опцион закрывается и определяется результат (выигрыш или проигрыш)
- Риск ограничен суммой инвестиции в опцион, но нет возможности закрыть позицию досрочно со стоп-лоссом
- Всегда объясняй это различие при обсуждении управления рисками в бинарных опционах

ВАЖНО:
- Ты предоставляешь только образовательную информацию
- НЕ даешь конкретные финансовые советы или рекомендации по покупке/продаже
- НЕ гарантируешь прибыль
- Всегда напоминаешь о рисках торговли
- Помогаешь понять концепции, а не принимать решения за пользователя`;

  if (context?.currentModule || context?.currentLesson) {
    prompt += '\n\nКонтекст обучения пользователя:';
    if (context.currentModule) {
      prompt += `\n- Текущий модуль: ${context.currentModule.title}`;
    }
    if (context.currentLesson) {
      prompt += `\n- Текущий урок: ${context.currentLesson.title}`;
    }
    if (context.progress !== undefined) {
      prompt += `\n- Прогресс обучения: ${context.progress}%`;
    }
    prompt += '\n\nУчитывай этот контекст при ответах, чтобы давать более релевантную информацию.';
  }

  return prompt;
}

// Конвертация файла в base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Подготовка контента сообщения с файлами
function prepareMessageContent(text: string, files?: FileData[]): Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> {
  const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];

  if (text.trim()) {
    content.push({ type: 'text', text });
  }

  if (files && files.length > 0) {
    files.forEach(file => {
      // OpenRouter поддерживает изображения через vision models
      if (file.type.startsWith('image/')) {
        content.push({
          type: 'image_url',
          image_url: { url: file.data }
        });
      } else {
        // Для не-изображений добавляем описание в текст
        const fileInfo = `\n[Файл: ${file.name}, размер: ${(file.size / 1024).toFixed(2)} КБ, тип: ${file.type}]`;
        if (content[0] && content[0].type === 'text') {
          content[0].text = (content[0].text || '') + fileInfo;
        } else {
          content.unshift({ type: 'text', text: fileInfo });
        }
      }
    });
  }

  return content;
}

// Отправка сообщения в OpenRouter API
export async function sendMessage(
  messages: ChatMessage[],
  files?: FileData[],
  context?: TradingContext,
  retries = 3
): Promise<string> {
  // ВАЖНО: В продакшене НЕ используем ключ вообще - только прокси!
  // В разработке используем локальный ключ (может быть обфусцирован)
  const rawKey = import.meta.env.PROD
    ? null // В продакшене ключ НЕ используется - только прокси на сервере
    : import.meta.env.VITE_OPENROUTER_API_KEY; // В разработке используем локальный ключ

  // Деобфусцируем ключ если нужно (только для разработки)
  const apiKey = rawKey ? getApiKey(rawKey) : null;

  // Отладочная информация
  console.log('🔍 Отладка API:', {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    usingProxy: import.meta.env.PROD,
    apiUrl: OPENROUTER_API_URL,
    hasApiKey: !!apiKey,
  });

  // В разработке проверяем наличие ключа
  if (!import.meta.env.PROD && !apiKey) {
    throw new Error(
      'API ключ OpenRouter не найден для разработки.\n\n' +
      'Убедитесь, что:\n' +
      '1. Файл .env существует в корне проекта\n' +
      '2. В файле .env есть строка: VITE_OPENROUTER_API_KEY=ваш_ключ\n' +
      '3. Dev сервер перезапущен после создания/изменения .env файла'
    );
  }

  // Подготовка системного промпта с контекстом
  const systemPrompt = getSystemPrompt(context);

  // Подготовка сообщений для API
  const apiMessages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...messages.map(msg => {
      if (msg.role === 'user' && files && files.length > 0) {
        // Для последнего пользовательского сообщения добавляем файлы
        const text = typeof msg.content === 'string' ? msg.content : '';
        return {
          role: 'user' as const,
          content: prepareMessageContent(text, files)
        };
      }
      return msg;
    })
  ];

  const requestBody = {
    model: MODEL,
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 2000
  };

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // В продакшене используем прокси (ключ на сервере), в разработке - прямой запрос
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'NO MONEY - NO HONEY'
      };

      // Добавляем Authorization только в разработке (в продакшене прокси добавит сам)
      if (!import.meta.env.PROD && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          // Rate limit - ждем перед повтором
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(
          errorData.error?.message ||
          `Ошибка API: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Неожиданный формат ответа от API');
      }

      return data.choices[0].message.content;

    } catch (error) {
      lastError = error as Error;

      // Если это последняя попытка или не временная ошибка, выбрасываем ошибку
      if (attempt === retries || (error as Error).message.includes('API ключ')) {
        throw error;
      }

      // Экспоненциальная задержка перед повтором
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Неизвестная ошибка при отправке сообщения');
}
