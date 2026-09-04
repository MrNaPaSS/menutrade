/**
 * Задания за партнёрок: зарегистрироваться и завести депозит.
 *
 * Список и награды приходят от бота, а не хранятся здесь: монеты
 * назначает сервер, и подставить своё число из браузера нельзя.
 * Отметку «выполнено» ставит админ, подтверждая депозит.
 */

import { postSigned } from '@/lib/botApi';
import { platformLinks } from '@/data/traderMenu';

/** Рынки те же, что человек выбирает в боте после отправки ID. */
export type QuestMarket = 'forex' | 'crypto' | 'fxpro';

export interface PartnerQuest {
    market: QuestMarket;
    name: string;
    /** Порог входа в долларах */
    min_deposit: number;
    coins: number;
    done: boolean;
}

/** Куда ведём человека по каждому заданию. */
export const QUEST_LINKS: Record<QuestMarket, string> = {
    forex: platformLinks.pocketOptions,
    crypto: platformLinks.weexExchange,
    fxpro: platformLinks.fxPro,
};

export async function fetchQuests(): Promise<PartnerQuest[] | null> {
    const data = await postSigned<{ quests: PartnerQuest[] }>('/quests');
    return data?.quests ?? null;
}
