import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Coins, Target } from 'lucide-react';
import { fetchQuests, questLink, type PartnerQuest } from '@/lib/quests';
import { EXCHANGES, cashbackLabel, exchangeByCode, type ExchangeCode } from '@/data/exchanges';
import { cn } from '@/lib/utils';

function openLink(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

/**
 * Задания за партнёрок.
 *
 * Каждая площадка приносит монеты один раз: чем выше порог входа, тем
 * дороже награда. Галочку ставит бот после того, как админ подтвердит
 * депозит, - нажатием в браузере задание не закрыть.
 *
 * Крипто-задание одно на весь рынок, а бирж пять. Выбор биржи стоит прямо
 * в задании: по умолчанию WEEX с самым большим возвратом комиссии, но
 * человек может уйти на любую другую - монеты платятся за ту, которую
 * подтвердят.
 */
export function PartnerQuests() {
    const [quests, setQuests] = useState<PartnerQuest[] | null>(null);
    const [exchange, setExchange] = useState<ExchangeCode>('weex');

    useEffect(() => {
        let cancelled = false;
        fetchQuests().then(data => {
            if (!cancelled) setQuests(data);
        });
        return () => { cancelled = true; };
    }, []);

    if (!quests || quests.length === 0) return null;

    const left = quests.filter(q => !q.done).reduce((sum, q) => sum + q.coins, 0);
    const chosen = exchangeByCode(exchange);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[18px] border border-[hsl(142_26%_15%)] p-4 sm:p-5"
            style={{ background: 'hsl(140 26% 8%)' }}
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                bg-primary/15 border border-primary/25 text-primary flex-shrink-0">
                    <Target className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">Задания</h3>
                    <p className="text-xs text-muted-foreground">
                        {left > 0
                            ? `Регистрация с депозитом на площадке. Можно забрать ещё ${left} монет`
                            : 'Все площадки пройдены'}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {quests.map(quest => {
                    // У крипты название и ссылка зависят от выбранной биржи:
                    // задание одно, а бирж пять
                    const isCrypto = quest.market === 'crypto';
                    const pickable = isCrypto && !quest.done;

                    return (
                        <div
                            key={quest.market}
                            className={cn(
                                'rounded-xl border p-3 transition-colors',
                                quest.done
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-muted/20 border-border/40'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border',
                                    quest.done
                                        ? 'bg-primary/20 border-primary/40 text-primary'
                                        : 'bg-muted/30 border-border/40 text-muted-foreground'
                                )}>
                                    {quest.done ? <Check className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                        {pickable ? chosen.label : quest.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {pickable
                                            ? `${cashbackLabel(chosen)} · депозит от $${quest.min_deposit}`
                                            : `Регистрация + депозит от $${quest.min_deposit}`}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className={cn(
                                        'text-sm font-bold tabular-nums',
                                        quest.done ? 'text-primary' : 'text-foreground'
                                    )}>
                                        +{quest.coins}
                                    </span>
                                    {quest.done ? (
                                        <span className="text-[10px] text-primary">Выполнено</span>
                                    ) : (
                                        <button
                                            onClick={() => openLink(questLink(quest.market, exchange))}
                                            className="text-[11px] text-primary flex items-center gap-0.5
                                                       hover:underline min-h-[24px]"
                                        >
                                            Начать
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {pickable && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {EXCHANGES.map(item => (
                                        <button
                                            key={item.code}
                                            onClick={() => setExchange(item.code)}
                                            className={cn(
                                                'px-2.5 h-7 rounded-lg text-[11px] font-medium border transition-colors',
                                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                                item.code === exchange
                                                    ? 'bg-primary/12 border-primary/35 text-primary'
                                                    : 'bg-white/[0.025] border-white/[0.06] text-muted-foreground hover:bg-white/[0.05]'
                                            )}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {left > 0 && (
                <p className="text-[11px] text-muted-foreground mt-3">
                    После депозита отправь ID счёта боту. Админ подтвердит - монеты придут сами.
                </p>
            )}
        </motion.div>
    );
}
