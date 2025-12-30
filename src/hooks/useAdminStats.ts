import { useState, useEffect, useCallback } from 'react';

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

interface UseAdminStatsReturn {
    stats: AdminStats | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const EMPTY_STATS: AdminStats = {
    totalUsers: 0,
    verified: 0,
    withPocketOption: 0,
    deposited: 0,
    newToday: 0,
    newThisWeek: 0,
    referrals: {
        totalClicks: 0,
        activatedCount: 0,
        bonusRequests: 0
    }
};

export function useAdminStats(userId: string | null, isAdmin: boolean): UseAdminStatsReturn {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        // Если не админ или нет userId - не загружаем
        if (!isAdmin || !userId) {
            console.log('🚫 useAdminStats: не админ или нет userId', { isAdmin, userId });
            setStats(EMPTY_STATS);
            return;
        }

        console.log('📊 useAdminStats: начинаю загрузку...', { userId, isAdmin });
        setIsLoading(true);
        setError(null);

        try {
            // В DEV режиме используем прокси для обхода CORS
            // В Production используем полный URL
            const startUrl = import.meta.env.DEV ? '/bot-api' : (import.meta.env.VITE_BOT_API_URL || 'http://localhost:8081');
            let users: any = null;

            console.log(`🌐 Fetching admin stats from: ${startUrl}/users`);

            try {
                const response = await fetch(`${startUrl}/users`, {
                    headers: {
                        "ngrok-skip-browser-warning": "true"
                    }
                });
                if (response.ok) {
                    const textData = await response.text();
                    try {
                        users = JSON.parse(textData);
                    } catch (e) {
                        console.error('JSON Parse Error:', textData.substring(0, 100)); // Log first 100 chars
                        throw e;
                    }
                } else {
                    console.error('Bot API returned error:', response.status);
                }
            } catch (err) {
                console.error('❌ Failed to fetch from Bot API:', err);
            }

            // Fallback для локальной разработки (если бота нет, но есть файл)
            if (!users && import.meta.env.DEV) {
                console.log('⚠️ API failed, trying local file fallback...');
                try {
                    const response = await fetch('/info_bot_users.json');
                    if (response.ok) {
                        users = await response.json();
                    }
                } catch (e) {
                    console.error('Local file fallback failed:', e);
                }
            }

            if (!users) {
                throw new Error('Failed to load users data (API unavailable)');
            }

            console.log('📊 Calculating stats for', Object.keys(users).length, 'users');

            // Подсчитываем статистику (клиентская часть)
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

            userIds.forEach(uid => {
                const user = users[uid];
                if (user.verified) verified++;
                if (user.pocket_option_id) withPocketOption++;
                if (user.deposited) deposited++;

                if (user.registered_at) {
                    const registeredAt = new Date(user.registered_at);
                    if (registeredAt >= todayStart) newToday++;
                    if (registeredAt >= weekStart) newThisWeek++;
                }

                if (user.referral) {
                    totalClicks += user.referral.referrals?.length || 0;
                    activatedCount += user.referral.activated_referrals?.length || 0;
                    if (user.referral.pending_bonus_request) bonusRequests++;
                }
            });

            const calculatedStats = {
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

            setStats(calculatedStats);
        } catch (err) {
            console.error('❌ useAdminStats: ошибка', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
            setStats(EMPTY_STATS);
        } finally {
            setIsLoading(false);
        }
    }, [userId, isAdmin]);

    // Загружаем данные при монтировании
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        isLoading,
        error,
        refetch: fetchStats
    };
}
