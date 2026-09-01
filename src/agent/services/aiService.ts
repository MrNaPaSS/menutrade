import { detectAIMode, getPromptForMode, AIMode } from '@/agent/config/prompts';

// В production используем наш Cloudflare Worker, в dev - прямой запрос (если есть ключ)
// Рабочий прокси академии - тот же, на котором AI работает в проде.
// agent-proxy.kaktotakxm.workers.dev не используем: он отвечает 401,
// ключ OpenRouter в том воркере недействителен.
const API_URL =
    import.meta.env.VITE_OPENROUTER_PROXY_URL || 'https://long-rice-ed1.kaktotakxm.workers.dev';
// const API_URL = import.meta.env.PROD
//     ? 'https://agent-proxy.kaktotakxm.workers.dev'
//     : 'https://openrouter.ai/api/v1/chat/completions';

const MODEL = 'openai/gpt-4o-mini';

export interface FileData {
    name: string;
    type: string;
    size: number;
    data: string; // base64
    thumbnail?: string;
}

export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
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
function prepareMessageContent(
    text: string,
    files?: FileData[]
): Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> {
    const content: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [];

    if (text.trim()) {
        content.push({ type: 'text', text });
    }

    if (files && files.length > 0) {
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                content.push({
                    type: 'image_url',
                    image_url: { url: file.data },
                });
            } else {
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

// Отправка сообщения в AI
export async function sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    files?: FileData[],
    explicitMode?: AIMode,
    retries = 3
): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    // Ключ OpenRouter лежит в прокси-воркере, приложению он не нужен -
    // ни в проде, ни локально. Прежняя проверка ключа в .env осталась
    // от отдельного приложения агента и ломала работу в разработке.

    // Определение режима
    let mode: AIMode;

    if (explicitMode) {
        // Если режим выбран вручную - используем его
        mode = explicitMode;
    } else {
        // Иначе автоопределение
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const hasFiles = files && files.length > 0;
        mode = detectAIMode(lastUserMessage?.content || '', hasFiles || false);
    }

    const systemPrompt = getPromptForMode(mode);

    console.log(`🤖 AI Mode: ${mode === 'analyst' ? '📊 АНАЛИТИК' : '📚 УЧИТЕЛЬ'} ${explicitMode ? '(Ручной)' : '(Авто)'}`);

    // Подготовка сообщений для API
    const apiMessages: AIMessage[] = [
        {
            role: 'system',
            content: systemPrompt,
        },
        ...messages.map((msg, index) => {
            // Для последнего сообщения пользователя добавляем файлы
            if (msg.role === 'user' && index === messages.length - 1 && files && files.length > 0) {
                return {
                    role: 'user' as const,
                    content: prepareMessageContent(msg.content, files),
                };
            }
            return {
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
            };
        }),
    ];

    const requestBody = {
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Trading Mentor',
            };

            // В dev режиме добавляем Authorization
            if (!import.meta.env.PROD && apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 429) {
                    // Rate limit - ждем и повторяем
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }

                throw new Error(
                    errorData.error?.message || `Ошибка API: ${response.status} ${response.statusText}`
                );
            }

            const data = await response.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Неожиданный формат ответа от API');
            }

            return data.choices[0].message.content;
        } catch (error) {
            lastError = error as Error;

            if (attempt === retries || (error as Error).message.includes('API ключ')) {
                throw error;
            }

            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError || new Error('Неизвестная ошибка при отправке сообщения');
}
