/**
 * Оформление разделов профиля трейдера: рамки и открытие ссылок.
 *
 * Лежит отдельно от компонентов намеренно. Рамка и фон одни на пять
 * разделов, и когда они объявлены внутри файла с компонентами, любая
 * правка стиля перерисовывает при разработке весь раздел целиком.
 */

import { cn } from '@/lib/utils';

export const PANEL = 'rounded-[18px] border border-[hsl(142_26%_15%)]';
export const PANEL_BG = { background: 'hsl(140 26% 8%)' } as const;
export const LIST = cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)]');

/**
 * Открыть внешнюю ссылку.
 *
 * Внутри Telegram - его же браузером: обычный переход уводит человека
 * из мини-аппа, и возвращаться ему придётся через список чатов.
 */
export function openLink(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}
