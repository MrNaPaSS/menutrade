import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { GraffitiBackdrop } from '@/components/graffiti/Graffiti';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { AdminStatsView } from '@/components/AdminStatsView';
import { ArrowLeft, Settings as SettingsIcon, RotateCcw, Globe, Bell, Info, Trash2, AlertTriangle, Shield, BarChart3, Users, FileDown, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const navigate = useNavigate();
  const { getProgress, resetProgress } = useProgress();
  const { isAdmin, user, userId } = useTelegramContext();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats(userId, isAdmin);
  const progress = getProgress();

  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [adminView, setAdminView] = useState<'stats' | 'referrals' | 'events' | 'export'>('stats');

  const handleHomeClick = () => {
    navigate('/home');
  };

  // Хук для свайпа назад

  const handleResetProgress = () => {
    resetProgress();
    setShowResetDialog(false);
    // Можно добавить toast уведомление
  };

  const settingsSections = [
    {
      id: 'general',
      title: 'Общие',
      items: [
        {
          id: 'language',
          label: 'Язык интерфейса',
          description: 'Выберите язык приложения',
          type: 'select',
          value: language,
          onChange: setLanguage,
          options: [
            { value: 'ru', label: 'Русский' },
            { value: 'en', label: 'English' }
          ]
        },
        {
          id: 'notifications',
          label: 'Уведомления',
          description: 'Получать уведомления о новых уроках и обновлениях',
          type: 'switch',
          value: notifications,
          onChange: setNotifications
        }
      ]
    },
    {
      id: 'progress',
      title: 'Прогресс обучения',
      items: [
        {
          id: 'reset',
          label: 'Сброс прогресса',
          description: 'Удалить весь прогресс обучения и начать заново',
          type: 'button',
          variant: 'destructive' as const,
          onClick: () => setShowResetDialog(true)
        }
      ]
    },
    {
      id: 'about',
      title: 'О приложении',
      items: [
        {
          id: 'version',
          label: 'Версия',
          description: '1.0.0',
          type: 'info'
        },
        {
          id: 'progress-info',
          label: 'Текущий прогресс',
          description: `${progress}% завершено`,
          type: 'info'
        }
      ]
    }
  ];

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <GraffitiBackdrop />
      <div className="relative z-10">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 -mx-4 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-display font-bold text-lg sm:text-xl">Настройки</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Настройки приложения и профиля
              </p>
            </div>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-5 md:p-6 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            {user && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Авторизован как:</p>
                <p className="text-xs sm:text-sm font-semibold break-words">
                  {user.first_name} {user.last_name || ''} {user.username && `(@${user.username})`}
                </p>
              </div>
            )}

            {/* Админ-панель */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="mb-6"
              >
                <div className="glass-card rounded-xl p-3 sm:p-4 md:p-6 neon-border">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg">Админ-панель</h3>
                        <p className="text-xs text-muted-foreground">Управление системой</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refetchStats}
                      disabled={statsLoading}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>

                  {/* Вкладки админ-панели */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {[
                      { id: 'stats', label: 'Статистика', icon: BarChart3 },
                      { id: 'referrals', label: 'Рефералы', icon: Users },
                      { id: 'events', label: 'События', icon: History },
                      { id: 'export', label: 'Экспорт', icon: FileDown }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setAdminView(tab.id as typeof adminView)}
                          className={`p-1.5 sm:p-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all touch-manipulation ${adminView === tab.id
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-muted/20 text-muted-foreground active:bg-muted/30'
                            }`}
                        >
                          <Icon className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-0.5 sm:mb-1" />
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Контент админ-панели */}
                  <div className="mt-4">
                    {adminView === 'stats' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">Общая статистика</h4>
                        {statsLoading ? (
                          <div className="text-center text-sm text-muted-foreground py-4">Загрузка...</div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.totalUsers || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">Всего пользователей</div>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.verified || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">Верифицированные</div>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.withPocketOption || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">С PO ID</div>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.deposited || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">С депозитом</div>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.newToday || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">Новых сегодня</div>
                            </div>
                            <div className="p-2 sm:p-3 rounded-lg bg-muted/20">
                              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats?.newThisWeek || 0}</div>
                              <div className="text-[10px] sm:text-xs text-muted-foreground">Новых за неделю</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {adminView === 'referrals' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">Реферальная система</h4>
                        {statsLoading ? (
                          <div className="text-center text-sm text-muted-foreground py-4">Загрузка...</div>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-muted/20">
                                <div className="text-lg font-bold text-primary mb-1">{stats?.referrals.totalClicks || 0}</div>
                                <div className="text-xs text-muted-foreground">Всего переходов</div>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/20">
                                <div className="text-lg font-bold text-primary mb-1">{stats?.referrals.activatedCount || 0}</div>
                                <div className="text-xs text-muted-foreground">Активированных рефералов</div>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/20">
                                <div className="text-lg font-bold text-primary mb-1">{stats?.referrals.bonusRequests || 0}</div>
                                <div className="text-xs text-muted-foreground">Заявок на бонусы</div>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4" disabled>
                              Просмотр заявок
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {adminView === 'events' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">История событий</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          <div className="p-3 rounded-lg bg-muted/10 text-xs text-muted-foreground text-center">
                            История событий пуста
                          </div>
                        </div>
                      </div>
                    )}

                    {adminView === 'export' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">Экспорт данных</h4>
                        <Button variant="outline" className="w-full" disabled>
                          <FileDown className="w-4 h-4 mr-2" />
                          Экспорт CSV
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Экспорт базы пользователей в CSV-файл
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}


            <div className="space-y-6">
              {settingsSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <div className="glass-card rounded-xl p-6 neon-border">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                      {section.id === 'general' && <SettingsIcon className="w-5 h-5 text-primary" />}
                      {section.id === 'progress' && <RotateCcw className="w-5 h-5 text-primary" />}
                      {section.id === 'about' && <Info className="w-5 h-5 text-primary" />}
                      {section.title}
                    </h3>

                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={item.id}>
                          {itemIndex > 0 && <Separator className="my-4" />}

                          {item.type === 'switch' && (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Label htmlFor={item.id} className="font-semibold">
                                  {item.label}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </div>
                              <Switch
                                id={item.id}
                                checked={item.value as boolean}
                                onCheckedChange={item.onChange as (checked: boolean) => void}
                              />
                            </div>
                          )}

                          {item.type === 'select' && (
                            <div className="space-y-2">
                              <Label htmlFor={item.id} className="font-semibold">
                                {item.label}
                              </Label>
                              <p className="text-xs text-muted-foreground mb-2">
                                {item.description}
                              </p>
                              <Select
                                value={item.value as string}
                                onValueChange={item.onChange as (value: string) => void}
                              >
                                <SelectTrigger id={item.id}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {item.type === 'button' && (
                            <div className="space-y-2">
                              <div>
                                <Label className="font-semibold">{item.label}</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </div>
                              <Button
                                variant={item.variant}
                                onClick={item.onClick}
                                className="w-full"
                              >
                                {item.variant === 'destructive' && (
                                  <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                {item.label}
                              </Button>
                            </div>
                          )}

                          {item.type === 'info' && (
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="font-semibold">{item.label}</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                🐸 Built with 💚 for Академия здравого трейдера
              </p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav onHomeClick={handleHomeClick} />

      {/* Диалог подтверждения сброса прогресса */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Сброс прогресса
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите сбросить весь прогресс обучения? Это действие нельзя отменить.
              Все пройденные уроки и модули будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Сбросить прогресс
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
