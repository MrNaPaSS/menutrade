import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useProgress } from '@/hooks/useProgress';
import { useTelegramContext } from '@/contexts/TelegramContext';
import { AdminStatsView } from '@/components/AdminStatsView';
import { ArrowLeft, Settings as SettingsIcon, RotateCcw, Globe, Bell, Info, Trash2, AlertTriangle, Shield, BarChart3, Users, FileDown, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const navigate = useNavigate();
  const { getProgress, resetProgress } = useProgress();
  const { isAdmin, user } = useTelegramContext();
  const progress = getProgress();
  
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [adminView, setAdminView] = useState<'stats' | 'referrals' | 'events' | 'export'>('stats');

  const handleHomeClick = () => {
    navigate('/home');
  };

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
    <div className="min-h-screen scanline pb-24">
      <MatrixRain />
      <div className="relative z-10">
        <Header progress={progress} />
        
        <main className="p-4 pb-24">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm">На главную</span>
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="font-display font-bold text-2xl mb-2">Настройки</h2>
              <p className="text-sm text-muted-foreground">
                Настройки приложения и профиля
              </p>
              {user && (
                <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Авторизован как:</p>
                  <p className="text-sm font-semibold">
                    {user.first_name} {user.last_name || ''} {user.username && `(@${user.username})`}
                  </p>
                </div>
              )}
            </div>

            {/* Админ-панель */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="mb-6"
              >
                <div className="glass-card rounded-xl p-6 neon-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg">Админ-панель</h3>
                        <p className="text-xs text-muted-foreground">Управление системой</p>
                      </div>
                    </div>
                  </div>

                  {/* Вкладки админ-панели */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
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
                          className={`p-2 rounded-lg text-xs font-medium transition-all ${
                            adminView === tab.id
                              ? 'bg-primary/20 text-primary border border-primary/30'
                              : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Контент админ-панели */}
                  <div className="mt-4">
                    {adminView === 'stats' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">Общая статистика</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Всего пользователей</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Верифицированные</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">С PO ID</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">С депозитом</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Новых сегодня</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-2xl font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Новых за неделю</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {adminView === 'referrals' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm mb-3">Реферальная система</h4>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-lg font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Всего переходов</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-lg font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Активированных рефералов</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/20">
                            <div className="text-lg font-bold text-primary mb-1">0</div>
                            <div className="text-xs text-muted-foreground">Заявок на бонусы</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4" disabled>
                          Просмотр заявок
                        </Button>
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
