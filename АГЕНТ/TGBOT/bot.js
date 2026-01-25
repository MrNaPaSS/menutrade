import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';
import { token, ADMIN_ID } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const escapeHtml = (unsafe) => {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

if (!token) {
    console.error('Ошибка: Токен не найден');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const webAppUrl = 'https://agent-6n7f.onrender.com';
const imagePath = path.join(__dirname, 'photo_2025-12-31_02-07-09.jpg');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const user = msg.from;

    if (text === '/start') {
        // Если пишет сам админ - сразу пускаем
        // Приведение типов к строке/числу для надежного сравнения
        if (String(chatId) === String(ADMIN_ID)) {
            await sendWelcomeMessage(chatId);
            return;
        }

        // Уведомляем пользователя
        await bot.sendMessage(chatId, '✋ <b>Ваш запрос на рассмотрении.</b>\n\nПожалуйста, подождите подтверждения от администратора.', { parse_mode: 'HTML' });

        // Отправляем запрос админу
        const username = user.username ? `@${user.username}` : 'Без юзернейма';
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();

        const adminMsg = `👤 <b>Новый пользователь запросил доступ!</b>\n\n` +
            `🆔 ID: <code>${user.id}</code>\n` +
            `👤 Имя: ${escapeHtml(name)}\n` +
            `🔗 Профиль: ${escapeHtml(username)}`;

        await bot.sendMessage(ADMIN_ID, adminMsg, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ Принять', callback_data: `accept_${chatId}` },
                        { text: '❌ Отклонить', callback_data: `reject_${chatId}` }
                    ]
                ]
            }
        });
    }
});

bot.on('callback_query', async (query) => {
    const { data, message } = query;
    const adminChatId = message.chat.id;
    const messageId = message.message_id;

    // Проверяем, что нажал админ (на всякий случай)
    if (String(adminChatId) !== String(ADMIN_ID)) return;

    if (data.startsWith('accept_')) {
        const userId = data.split('_')[1];

        // 1. Отправляем пользователю приветствие
        await sendWelcomeMessage(userId);

        // 2. Обновляем сообщение у админа
        // 2. Обновляем сообщение у админа
        await bot.editMessageText(`${escapeHtml(message.text)}\n\n✅ <b>Доступ предоставлен.</b>`, {
            chat_id: adminChatId,
            message_id: messageId,
            parse_mode: 'HTML'
        });

    } else if (data.startsWith('reject_')) {
        const userId = data.split('_')[1];

        // 1. Отправляем пользователю отказ
        // 1. Отправляем пользователю отказ
        await bot.sendMessage(userId, '⛔ <b>В доступе отказано.</b>\n\nСвяжитесь с администратором для уточнения деталей.', { parse_mode: 'HTML' });

        // 2. Обновляем сообщение у админа
        await bot.editMessageText(`${escapeHtml(message.text)}\n\n❌ <b>Доступ отклонен.</b>`, {
            chat_id: adminChatId,
            message_id: messageId,
            parse_mode: 'HTML'
        });
    }

    // Убираем часики загрузки с кнопки
    await bot.answerCallbackQuery(query.id);
});

async function sendWelcomeMessage(chatId) {
    try {
        await bot.sendPhoto(chatId, imagePath, {
            caption: '🎓 <b>Добро пожаловать в Академию Здравого Трейдера!</b>\n\n' +
                'Твой личный AI-агент готов к работе.\n' +
                'Здесь нет места эмоциям - только холодный расчет и профит. 🧠\n\n' +
                'Помни правило: <b>No Money - No Honey</b>. 💸\n\n' +
                'Жми кнопку ниже для запуска 👇',
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть', web_app: { url: webAppUrl } }]
                ]
            }
        });
    } catch (error) {
        console.error('Ошибка при отправке фото:', error);
        // Fallback
        await bot.sendMessage(chatId, 'Привет! 👋\n\nНажми на кнопку ниже, чтобы запустить приложение.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Открыть', web_app: { url: webAppUrl } }]
                ]
            }
        });
    }
}

console.log('Бот запущен с системой администрирования...');
