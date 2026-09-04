import { useEffect } from 'react';

/**
 * Догружает экраны, пока человек смотрит на главную.
 *
 * Разбиение на куски ускорило запуск, но первый переход по каждой
 * вкладке ждал бы своей загрузки - и вместо экрана человек видел бы
 * заглушку. Поэтому сразу после первого кадра, в свободное время,
 * докачиваем то, куда ведёт нижняя панель. К моменту нажатия кусок
 * уже лежит в кэше, и переход происходит мгновенно.
 *
 * Порядок - по частоте: сперва то, что открывают чаще.
 */
const ROUTES = [
    () => import('@/pages/Referral'),
    () => import('@/pages/Index'),
    () => import('@/pages/News'),
    () => import('@/pages/TraderMenu'),
    () => import('@/pages/Live'),
];

type IdleWindow = Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
};

export function usePrefetchRoutes(): void {
    useEffect(() => {
        let cancelled = false;

        const run = () => {
            // По одному, а не пачкой: пачка займёт сеть и процессор
            // ровно тогда, когда человек начал листать главную
            ROUTES.reduce(
                (chain, load) => chain.then(() => (cancelled ? undefined : load().then(() => undefined))),
                Promise.resolve<void>(undefined),
            ).catch(() => {
                /* не догрузилось - экран возьмёт своё при переходе */
            });
        };

        const idle = (window as IdleWindow).requestIdleCallback;
        if (idle) {
            idle(run, { timeout: 3000 });
        } else {
            // Safari и webview Telegram: ждём, пока уляжется первый кадр
            const timer = setTimeout(run, 1500);
            return () => { cancelled = true; clearTimeout(timer); };
        }

        return () => { cancelled = true; };
    }, []);
}
