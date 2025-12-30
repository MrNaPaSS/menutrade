import { readFileSync } from 'fs';
import { join } from 'path';

// Интерфейсы данных
interface UserData {
    username?: string;
    registered_at?: string;
    status?: string;
    pocket_option_id?: string | null;
    verified?: boolean;
    deposited?: boolean;
    language?: string;
}

interface UsersDatabase {
    [userId: string]: UserData;
}

interface UserAccessResponse {
    success: boolean;
    userId?: string;
    verified: boolean;
    deposited: boolean;
    hasFullAccess: boolean;
    error?: string;
}

/**
 * API endpoint для получения статуса доступа пользователя
 * GET /api/user-access?userId=123456789
 */
export default async function handler(req: any, res: any) {
    // Разрешаем CORS для работы с фронтендом
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId parameter is required'
            });
        }

        // Путь к файлу базы данных бота
        const dbPath = join(process.cwd(), 'InfoBot_Standalone', 'info_bot_users.json');
        const botApiUrl = process.env.BOT_API_URL;

        let usersDb: UsersDatabase = {};

        if (botApiUrl) {
            try {
                const apiResponse = await fetch(`${botApiUrl}/users`);
                if (apiResponse.ok) {
                    const textData = await apiResponse.text();
                    usersDb = JSON.parse(textData);
                } else {
                    throw new Error(`Bot API returned ${apiResponse.status}`);
                }
            } catch (e) {
                console.error('Failed to fetch from Bot API:', e);
                // Fallback to local file if API fails
                try {
                    const fileContent = readFileSync(dbPath, 'utf-8');
                    usersDb = JSON.parse(fileContent);
                } catch (readError) {
                    console.error('Error reading local users database as fallback:', readError);
                }
            }
        } else {
            try {
                const fileContent = readFileSync(dbPath, 'utf-8');
                usersDb = JSON.parse(fileContent);
            } catch (error) {
                console.error('Error reading users database:', error);
                // Если файл не найден, возвращаем пользователя без доступа
                return res.status(200).json({
                    success: true,
                    userId: userId.toString(),
                    verified: false,
                    deposited: false,
                    hasFullAccess: false
                });
            }
        }

        // Получаем данные пользователя
        const userData = usersDb[userId.toString()];

        if (!userData) {
            // Пользователь не найден в базе - нет доступа
            return res.status(200).json({
                success: true,
                userId: userId.toString(),
                verified: false,
                deposited: false,
                hasFullAccess: false
            });
        }

        // Проверяем статус пользователя
        const verified = userData.verified === true;
        const deposited = userData.deposited === true;
        const hasFullAccess = verified && deposited;

        const response: UserAccessResponse = {
            success: true,
            userId: userId.toString(),
            verified,
            deposited,
            hasFullAccess
        };

        // Кэшируем ответ на 5 минут
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

        return res.status(200).json(response);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
