import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { User, LogOut, CheckCircle, XCircle, Shield } from 'lucide-react';

interface DebugUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    verified: boolean;
    deposited: boolean;
    description: string;
}

const DEBUG_USERS: DebugUser[] = [
    {
        id: 511442168,
        first_name: 'Admin',
        last_name: 'User',
        username: 'NMNH_MANAGER',
        verified: true,
        deposited: true,
        description: 'Администратор (полный доступ + админ-панель)'
    },
    {
        id: 999000001,
        first_name: 'VIP',
        last_name: 'User',
        username: 'vip_user',
        verified: true,
        deposited: true,
        description: 'Полный доступ ко всем функциям'
    },
    {
        id: 999000002,
        first_name: 'Guest',
        last_name: 'User',
        username: 'guest_user',
        verified: false,
        deposited: false,
        description: 'Ограниченный доступ (3 сообщения AI)'
    }
];

export function DebugLogin() {
    // Показываем только в режиме разработки
    if (!import.meta.env.DEV) {
        return null;
    }

    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<DebugUser | null>(() => {
        const stored = localStorage.getItem('debug_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    });

    const handleLogin = (user: DebugUser) => {
        // Очищаем все кэши пользователя перед входом
        const userId = user.id.toString();

        // Очищаем кэш UserAccessContext для всех пользователей
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('user_access_')) {
                localStorage.removeItem(key);
            }
        });

        // Сохраняем нового дебаг-пользователя
        // Флаги доступа сохраняем тоже: в dev бот недоступен,
        // и брать статус больше неоткуда
        localStorage.setItem('debug_user', JSON.stringify({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            verified: user.verified,
            deposited: user.deposited
        }));

        setCurrentUser(user);
        setOpen(false);
        // Перезагружаем страницу для применения изменений
        window.location.reload();
    };

    const handleLogout = () => {
        // Очищаем все кэши
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('user_access_') || key === 'debug_user' || key === 'telegram_test_user') {
                localStorage.removeItem(key);
            }
        });

        setCurrentUser(null);
        // Перезагружаем страницу
        window.location.reload();
    };

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 shadow-lg backdrop-blur-sm"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Debug
                        {currentUser && (
                            <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">
                                {currentUser.first_name}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            🐛 Дебаг Вход
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                        {DEBUG_USERS.map((user) => (
                            <div
                                key={user.id}
                                className="p-4 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-sm text-gray-400">@{user.username}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Статусы */}
                                <div className="flex gap-2 mb-3">
                                    <Badge
                                        variant={user.verified ? "default" : "secondary"}
                                        className={user.verified
                                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                                            : "bg-red-500/20 text-red-300 border-red-500/30"
                                        }
                                    >
                                        {user.verified ? (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                        ) : (
                                            <XCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {user.verified ? 'Верифицирован' : 'Не верифицирован'}
                                    </Badge>
                                    <Badge
                                        variant={user.deposited ? "default" : "secondary"}
                                        className={user.deposited
                                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                        }
                                    >
                                        {user.deposited ? (
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                        ) : (
                                            <XCircle className="w-3 h-3 mr-1" />
                                        )}
                                        {user.deposited ? 'Депозит' : 'Без депозита'}
                                    </Badge>
                                </div>

                                <p className="text-sm text-gray-400 mb-3">{user.description}</p>

                                <Button
                                    onClick={() => handleLogin(user)}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                    disabled={currentUser?.id === user.id}
                                >
                                    {currentUser?.id === user.id ? 'Текущий пользователь' : 'Войти'}
                                </Button>
                            </div>
                        ))}

                        {/* Кнопка выхода */}
                        {currentUser && (
                            <div className="pt-3 border-t border-purple-500/20">
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="w-full border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Выйти из дебаг-режима
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
