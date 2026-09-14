/**
 * Задания за партнёрок: зарегистрироваться и завести депозит.
 *
 * Список и награды приходят от бота, а не хранятся здесь: монеты
 * назначает сервер, и подставить своё число из браузера нельзя.
 * Отметку «выполнено» ставит админ, подтверждая депозит.
 */

import { postSigned } from '@/lib/botApi';
import { platformLinks } from '@/data/traderMenu';
import { exchangeByCode, type ExchangeCode } from '@/data/exchanges';

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

/** Форекс-площадки задания: у каждой одна ссылка */
const FOREX_QUEST_LINKS: Record<'forex' | 'fxpro', string> = {
    forex: platformLinks.pocketOptions,
    fxpro: platformLinks.fxPro,
};

/**
 * Куда ведём человека по заданию.
 *
 * Крипто-задание одно на весь рынок, а бирж пять - и монеты платятся за
 * первую подтверждённую, какую бы человек ни выбрал. По умолчанию WEEX:
 * у неё самый большой возврат комиссии.
 */
export function questLink(market: QuestMarket, exchange: ExchangeCode = 'weex'): string {
    return market === 'crypto' ? exchangeByCode(exchange).link : FOREX_QUEST_LINKS[market];
}

export async function fetchQuests(): Promise<PartnerQuest[] | null> {
    const data = await postSigned<{ quests: PartnerQuest[] }>('/quests');
    return data?.quests ?? null;
}
