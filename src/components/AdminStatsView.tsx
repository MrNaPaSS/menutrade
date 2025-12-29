import { useEffect, useState } from 'react';
import { getGlobalStats, getAllUsersStats } from '@/utils/userStats';

export function AdminStatsView() {
  const [globalStats, setGlobalStats] = useState(getGlobalStats());
  const [allUsers, setAllUsers] = useState(getAllUsersStats());

  useEffect(() => {
    // Обновляем статистику при монтировании
    setGlobalStats(getGlobalStats());
    setAllUsers(getAllUsersStats());
  }, []);

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm mb-3">Общая статистика</h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.totalUsers}</div>
          <div className="text-xs text-muted-foreground">Всего пользователей</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.verifiedUsers}</div>
          <div className="text-xs text-muted-foreground">Верифицированные</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.usersWithProgress}</div>
          <div className="text-xs text-muted-foreground">С прогрессом</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.usersWithDeposit}</div>
          <div className="text-xs text-muted-foreground">С депозитом</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.newUsersToday}</div>
          <div className="text-xs text-muted-foreground">Новых сегодня</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.newUsersThisWeek}</div>
          <div className="text-xs text-muted-foreground">Новых за неделю</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/20 col-span-2">
          <div className="text-2xl font-bold text-primary mb-1">{globalStats.averageProgress}%</div>
          <div className="text-xs text-muted-foreground">Средний прогресс</div>
        </div>
      </div>

      {allUsers.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-3">Последние пользователи</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {allUsers
              .sort((a, b) => {
                const dateA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
                const dateB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 10)
              .map((user) => (
                <div key={user.userId} className="p-2 rounded-lg bg-muted/10 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">ID: {user.userId.slice(0, 8)}...</div>
                      <div className="text-muted-foreground">
                        Прогресс: {user.progress}% ({user.completedLessons}/{user.totalLessons})
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {user.lastActivity
                        ? new Date(user.lastActivity).toLocaleDateString('ru-RU')
                        : '—'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

