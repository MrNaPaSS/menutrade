import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface UserData {
    username: string;
    registered_at: string;
    status: string;
    pocket_option_id: string | null;
    verified: boolean;
    deposited: boolean;
    language?: string;
    referral: {
        code: string;
        invited_by: string | null;
        referrals: string[];
        activated_referrals: string[];
        bonuses_claimed: any[];
        tradingview_username: string | null;
        pending_bonus_request: any | null;
        bonus_requests_history: any[];
    };
}

interface UsersDatabase {
    [userId: string]: UserData;
}

interface AdminStats {
    totalUsers: number;
    verified: number;
    withPocketOption: number;
    deposited: number;
    newToday: number;
    newThisWeek: number;
    referrals: {
        totalClicks: number;
        activatedCount: number;
        bonusRequests: number;
    };
}

// Кэш для хранения данных (1 минута)
let cache: { data: AdminStats | null; timestamp: number } = {
    data: null,
    timestamp: 0
};

const CACHE_DURATION = 60 * 1000; // 1 минута
const ADMIN_USER_ID = '511442168';

function calculateStats(users: UsersDatabase): AdminStats {
    const userIds = Object.keys(users);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalUsers = userIds.length;
    let verified = 0;
    let withPocketOption = 0;
    let deposited = 0;
    let newToday = 0;
    let newThisWeek = 0;
    let totalClicks = 0;
    let activatedCount = 0;
    let bonusRequests = 0;

    userIds.forEach(userId => {
        const user = users[userId];

        // Статистика пользователей
        if (user.verified) verified++;
        if (user.pocket_option_id) withPocketOption++;
        if (user.deposited) deposited++;

        // Новые пользователи
        const registeredAt = new Date(user.registered_at);
        if (registeredAt >= todayStart) newToday++;
        if (registeredAt >= weekStart) newThisWeek++;

        // Реферальная статистика
        if (user.referral) {
            totalClicks += user.referral.referrals?.length || 0;
            activatedCount += user.referral.activated_referrals?.length || 0;
            if (user.referral.pending_bonus_request) bonusRequests++;
        }
    });

    return {
        totalUsers,
        verified,
        withPocketOption,
        deposited,
        newToday,
        newThisWeek,
        referrals: {
            totalClicks,
            activatedCount,
            bonusRequests
        }
    };
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        // Проверка прав администратора
        if (userId !== ADMIN_USER_ID) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin rights required.'
            });
        }

        // Проверяем кэш
        if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
            return res.status(200).json({
                success: true,
                stats: cache.data,
                cached: true
            });
        }

        // Получаем URL API бота из переменных окружения
        const botApiUrl = process.env.BOT_API_URL;
        let users: UsersDatabase;

        if (botApiUrl) {
            console.log(`🌐 Fetching users from remote bot API: ${botApiUrl}/users`);
            try {
                const apiResponse = await fetch(`${botApiUrl}/users`);
                if (!apiResponse.ok) {
                    throw new Error(`Failed to fetch from bot API: ${apiResponse.statusText}`);
                }
                const textData = await apiResponse.text();
                users = JSON.parse(textData);
            } catch (fetchError) {
                console.error('❌ Error fetching from bot API:', fetchError);
                // Если не удалось получить данные с API, пробуем локальный файл как резерв
                console.log('⚠️ Falling back to local file...');
                const usersFilePath = path.join(process.cwd(), 'InfoBot_Standalone', 'info_bot_users.json');
                if (!fs.existsSync(usersFilePath)) {
                    throw new Error('Users database file not found (and API failed)');
                }
                const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
                users = JSON.parse(fileContent);
            }
        } else {
            // Путь к файлу с данными пользователей (локальный режим)
            const usersFilePath = path.join(process.cwd(), 'InfoBot_Standalone', 'info_bot_users.json');

            // Проверяем существование файла
            if (!fs.existsSync(usersFilePath)) {
                return res.status(500).json({
                    success: false,
                    error: 'Users database file not found'
                });
            }

            // Чтение файла
            const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
            users = JSON.parse(fileContent);
        }

        // Подсчет статистики
        const stats = calculateStats(users);

        // Сохраняем в кэш
        cache.data = stats;
        cache.timestamp = Date.now();

        return res.status(200).json({
            success: true,
            stats,
            cached: false
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
}
