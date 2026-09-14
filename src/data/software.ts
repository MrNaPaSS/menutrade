/**
 * Наш софт.
 *
 * Раньше четыре продукта были написаны руками прямо в разметке -
 * почти одинаковый JSX по девяносто строк на каждый. Поменять подпись
 * значило поправить её в четырёх местах и не забыть ни одного.
 * Теперь содержимое здесь, а разметка одна.
 */

export type SoftwareBadge = 'free' | 'pro' | 'crypto';

export interface SoftwareLink {
    label: string;
    url: string;
    /** primary - главное действие карточки, оно одно */
    kind?: 'primary' | 'secondary';
}

export interface SoftwareItem {
    id: string;
    name: string;
    /** Что это: расширение, индикатор, платформа */
    kind: string;
    badge: SoftwareBadge;
    summary: string;
    /** Короткие факты о продукте - по одной строке */
    facts: string[];
    /** Шаги до доступа. Пусто, если доступ открыт сразу */
    steps: string[];
    links: SoftwareLink[];
    /** Одно предупреждение или уточнение под кнопками */
    note?: string;
}

const MANAGER = 'https://t.me/NMNH_MANAGER';

export const softwareItems: SoftwareItem[] = [
    {
        id: 'nmnh-trade',
        name: 'NMNH.TRADE',
        kind: 'Торговый терминал, крипта',
        badge: 'crypto',
        summary: 'Это не сигналы, а профессиональный торговый терминал',
        facts: [
            'Стакан, лента сделок и скринер бирж в одном окне',
            'Сервер ведёт позицию: стоп переносится в безубыток сам',
            'С телефона доступен просмотр, торговля - с компьютера',
        ],
        steps: [
            'Зарегистрируйтесь на бирже по ссылке академии',
            'Отправьте UID счёта в бота и дождитесь подтверждения',
            'Подключите ключи API в терминале и торгуйте',
        ],
        links: [
            { label: 'Открыть NMNH.TRADE', url: 'https://www.nmnh.trade', kind: 'primary' },
        ],
        note: 'Пять бирж на выбор: WEEX, OKX, BingX, MEXC и Binance. Часть комиссии возвращается на ваш счёт - на всех, кроме Binance',
    },
    {
        id: 'market-assistant',
        name: 'NMNH Market Assistant',
        kind: 'Расширение для Chrome',
        badge: 'free',
        summary: 'ИИ-ассистент внутри терминала: видит тот же график, что и вы, и считает быстрее',
        facts: [
            'Работает внутри PoTrade, переключаться никуда не нужно',
            'Пока вы принимаете решение, он уже разобрал ситуацию',
        ],
        steps: [],
        links: [
            {
                label: 'Установить из Chrome Store',
                url: 'https://chromewebstore.google.com/detail/nmnh-market-assistant/ejecbofgkmnbkfklojagiopfcjnogdhj?authuser=3&hl=ru',
                kind: 'primary',
            },
        ],
        note: 'Это не бот с сигналами, а помощник за терминалом. Ставится бесплатно',
    },
    {
        id: 'black-mirror',
        name: 'Black Mirror Predictor',
        kind: 'Индикатор TradingView',
        badge: 'pro',
        summary: 'Прогноз движения цены по алгоритмическому разбору рынка',
        facts: [
            'Скрипт по приглашению: доступ выдаёт автор',
            'Обновляется, на TradingView всегда последняя версия',
        ],
        steps: [
            'Напишите автору в Telegram: @KAKTOTAKXM',
            'Прочтите инструкцию по скриптам, доступным только по приглашению',
            'Получите доступ после выполнения условий автора',
        ],
        links: [
            {
                label: 'Открыть на TradingView',
                url: 'https://ru.tradingview.com/script/3eVmzktt-black-mirror-predictor/',
                kind: 'primary',
            },
            { label: 'Посмотреть в действии', url: 'https://t.me/NeKnopkaBabl0/a/5' },
            { label: 'Написать менеджеру', url: MANAGER },
        ],
        note: 'Скрипт из закрытого доступа. Обычно такие продаются помесячно, как указано на TradingView',
    },
    {
        id: 'forex-signals',
        name: 'Forex Signals Pro',
        kind: 'Веб-приложение',
        badge: 'free',
        summary: 'Разбор рынка обученными моделями машинного обучения',
        facts: [
            'Открывается после регистрации на платформе',
        ],
        steps: [
            'Зарегистрируйтесь на Pocket Option',
            'Доступ к приложению откроется после регистрации',
            'Разбирайте рынок моделями машинного обучения',
        ],
        links: [
            {
                label: 'Зарегистрироваться',
                url: 'https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50',
                kind: 'primary',
            },
            { label: 'Посмотреть в действии', url: 'https://t.me/NeKnopkaBabl0/a/6' },
            { label: 'Написать менеджеру', url: MANAGER },
        ],
    },
];

export const BADGE_LABEL: Record<SoftwareBadge, string> = {
    free: 'Бесплатно',
    pro: 'По приглашению',
    crypto: 'Крипта',
};
