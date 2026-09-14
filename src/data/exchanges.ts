/**
 * Криптобиржи академии: ссылка, кэшбэк и ставки комиссии.
 *
 * Счёт, открытый не по нашей ссылке, к академии не привяжется, поэтому
 * ссылка у каждой биржи своя и берётся только отсюда.
 *
 * Кэшбэк возвращается ученику на счёт: часть комиссии, которую биржа платит
 * академии, уходит обратно тому, кто торгует. Условие - регистрация через
 * академию и торговля в терминале NMNH.TRADE.
 *
 * Тот же список живёт в боте, в `exchange_accounts.py` (EXCHANGES, OFFERED,
 * REGISTRATION_LINKS, COMMISSION_DISCOUNTS, NO_CASHBACK). Браузеру нельзя
 * доверить ни ссылку, ни процент: заявку всё равно принимает и проверяет бот.
 * Здесь копия - чтобы показать условия до отправки заявки. Меняется процент
 * или ссылка - правим оба места.
 */

/** Код биржи. Совпадает с кодом бота и платформы терминала */
export type ExchangeCode = 'weex' | 'okx' | 'bingx' | 'mexc' | 'binance';

export interface Exchange {
    code: ExchangeCode;
    label: string;
    /** Партнёрская ссылка академии */
    link: string;
    /** Сколько комиссии возвращается ученику, в процентах. null - биржа запрещает делиться комиссией */
    cashback: number | null;
    /** Ставка тейкера, в процентах */
    taker: string;
    /** Ставка мейкера, в процентах */
    maker: string;
    /** Чем биржа хороша - строкой под названием */
    tagline: string;
}

export const EXCHANGES: readonly Exchange[] = [
    {
        code: 'weex',
        label: 'WEEX',
        link: 'https://www.weex.com/ru/register?vipCode=kaktotakxme',
        cashback: 15,
        taker: '0.08',
        maker: '0.02',
        tagline: 'Самый большой возврат комиссии',
    },
    {
        code: 'okx',
        label: 'OKX',
        link: 'https://okx.com/join/NMNHTRADE',
        cashback: 10,
        taker: '0.05',
        maker: '0.02',
        tagline: 'Крупная биржа, глубокий стакан',
    },
    {
        code: 'bingx',
        label: 'BingX',
        link: 'https://bingx.com/partner/kaktotakxm/0Q55KY',
        cashback: 10,
        taker: '0.05',
        maker: '0.02',
        tagline: 'Фьючерсы и копи-трейдинг',
    },
    {
        code: 'mexc',
        label: 'MEXC',
        link: 'https://promote.mexc.com/b/NMNH',
        cashback: 10,
        taker: '0.02',
        maker: '0',
        tagline: 'Самые низкие комиссии из пяти',
    },
    {
        code: 'binance',
        label: 'Binance',
        link: 'https://www.binance.com/register?ref=NMNHTRADE',
        // Binance запрещает партнёрам делиться комиссией. Молчать об этом
        // нельзя: увидев биржу в списке под заголовком о возврате, человек
        // ждёт возврат
        cashback: null,
        taker: '0.05',
        maker: '0.02',
        tagline: 'Крупнейшая биржа, без возврата комиссии',
    },
];

/** Биржа по её коду. Неизвестный код - первая в списке */
export function exchangeByCode(code: ExchangeCode | null | undefined): Exchange {
    return EXCHANGES.find(item => item.code === code) ?? EXCHANGES[0];
}

/** «Возврат 15%» или «Без возврата» - подпись для карточки */
export function cashbackLabel(exchange: Exchange): string {
    return exchange.cashback === null ? 'Без возврата' : `Возврат ${exchange.cashback}%`;
}

/** «тейкер 0.08% · мейкер 0.02%» */
export function feesLabel(exchange: Exchange): string {
    return `тейкер ${exchange.taker}% · мейкер ${exchange.maker}%`;
}

/** Минимальный депозит для доступа к академии. Один на все биржи */
export const CRYPTO_MIN_DEPOSIT = '$100';
