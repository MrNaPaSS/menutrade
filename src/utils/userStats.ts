/**
 * Утилиты для работы со статистикой пользователей
 */

export interface UserStats {
  userId: string;
  lastActivity: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  registeredAt?: string;
  completedModules?: number;
  totalModules?: number;
  masterTestCompleted?: boolean;
}

/**
 * Получает статистику конкретного пользователя
 */
export function getUserStats(userId: string): UserStats | null {
  try {
    const stats = localStorage.getItem(`pepe-trader-stats-${userId}`);
    if (stats) {
      return JSON.parse(stats);
    }
  } catch (error) {
    console.error('Ошибка получения статистики пользователя:', error);
  }
  return null;
}

/**
 * Получает статистику всех пользователей
 */
export function getAllUsersStats(): UserStats[] {
  const stats: UserStats[] = [];
  
  try {
    // Проходим по всем ключам localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pepe-trader-stats-')) {
        const userId = key.replace('pepe-trader-stats-', '');
        const userStats = getUserStats(userId);
        if (userStats) {
          stats.push(userStats);
        }
      }
    }
  } catch (error) {
    console.error('Ошибка получения статистики всех пользователей:', error);
  }
  
  return stats;
}

/**
 * Получает общую статистику по всем пользователям
 */
export function getGlobalStats() {
  const allStats = getAllUsersStats();
  
  return {
    totalUsers: allStats.length,
    verifiedUsers: allStats.filter(s => s.userId && s.userId !== 'anonymous').length,
    usersWithProgress: allStats.filter(s => s.progress > 0).length,
    usersWithDeposit: 0, // Будет заполняться из бэкенда
    newUsersToday: allStats.filter(s => {
      if (!s.registeredAt) return false;
      const registered = new Date(s.registeredAt);
      const today = new Date();
      return registered.toDateString() === today.toDateString();
    }).length,
    newUsersThisWeek: allStats.filter(s => {
      if (!s.registeredAt) return false;
      const registered = new Date(s.registeredAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return registered >= weekAgo;
    }).length,
    averageProgress: allStats.length > 0
      ? Math.round(allStats.reduce((acc, s) => acc + s.progress, 0) / allStats.length)
      : 0,
    totalCompletedLessons: allStats.reduce((acc, s) => acc + s.completedLessons, 0)
  };
}

/**
 * Обновляет статистику пользователя
 */
export function updateUserStats(userId: string, updates: Partial<UserStats>) {
  try {
    const currentStats = getUserStats(userId) || {
      userId,
      lastActivity: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      totalLessons: 0
    };
    
    const updatedStats: UserStats = {
      ...currentStats,
      ...updates,
      lastActivity: new Date().toISOString()
    };
    
    localStorage.setItem(`pepe-trader-stats-${userId}`, JSON.stringify(updatedStats));
    return updatedStats;
  } catch (error) {
    console.error('Ошибка обновления статистики пользователя:', error);
    return null;
  }
}

/**
 * Регистрирует нового пользователя
 */
export function registerUser(userId: string, userData?: { firstName?: string; username?: string }) {
  const existingStats = getUserStats(userId);
  
  if (!existingStats) {
    updateUserStats(userId, {
      registeredAt: new Date().toISOString(),
      progress: 0,
      completedLessons: 0,
      totalLessons: 0
    });
  }
}

