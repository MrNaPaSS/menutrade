import { Award, ClipboardCheck } from 'lucide-react';
import { PANEL, PANEL_BG } from '@/lib/tradingUi';
import { maybeNumber, percent, tradeWord, type TradingStats } from '@/lib/tradingStats';
import { cn } from '@/lib/utils';

/** Строка будущего документа: что в него попадёт и с каким значением. */
function Line({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 px-3.5 py-2">
            <span className="text-[13px] text-muted-foreground truncate">{label}</span>
            <span className="font-mono text-[13px] tabular-nums text-foreground whitespace-nowrap">
                {value}
            </span>
        </div>
    );
}

/**
 * Сертификат и чек-лист: то, чего ещё нет.
 *
 * Раздел показывает не заглушку, а состав будущего документа с уже
 * посчитанными числами. Человек видит, что именно про него напишут, и
 * раздел работает как повод торговать ровнее до того, как его выдадут.
 */
export function CertificateTab({ stats }: { stats: TradingStats | null }) {
    const summary = stats?.summary;
    const decided = summary ? summary.wins + summary.losses : 0;

    return (
        <>
            <div className={cn(PANEL, 'p-5 text-center')} style={PANEL_BG}>
                <span
                    className="inline-flex w-10 h-10 rounded-[13px] items-center justify-center mb-3"
                    style={{ background: 'hsl(265 38% 18%)', color: 'hsl(265 75% 74%)' }}
                >
                    <Award className="w-5 h-5" />
                </span>
                <p className="text-[15px] font-semibold text-foreground">Сертификат трейдера</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">
                    Документ со статистикой за период - подтверждение того, как вы торговали,
                    а не того, что вы прослушали курс. Готовим.
                </p>
            </div>

            {summary && (
                <div>
                    <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground mb-2 px-1">
                        Что в нём будет
                    </p>
                    <div
                        className={cn(PANEL, 'overflow-hidden divide-y divide-[hsl(142_22%_13%)] py-1')}
                        style={PANEL_BG}
                    >
                        <Line label="Период" value={`${stats?.days} дней`} />
                        <Line label="Сделок" value={`${summary.trades} ${tradeWord(summary.trades)}`} />
                        <Line
                            label="Доля прибыльных"
                            value={decided > 0 ? percent(summary.win_rate) : '--'}
                        />
                        <Line label="Профит-фактор" value={maybeNumber(summary.profit_factor)} />
                        <Line label="Средний R" value={maybeNumber(summary.avg_r, 2, 'R')} />
                    </div>
                </div>
            )}

            <div className={cn(PANEL, 'p-5 text-center')} style={PANEL_BG}>
                <span
                    className="inline-flex w-10 h-10 rounded-[13px] items-center justify-center mb-3"
                    style={{ background: 'hsl(142 20% 14%)', color: 'hsl(142 20% 55%)' }}
                >
                    <ClipboardCheck className="w-5 h-5" />
                </span>
                <p className="text-[15px] font-semibold text-foreground">Чек-лист перед входом</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">
                    Несколько вопросов, на которые стоит ответить до сделки. Скоро.
                </p>
            </div>
        </>
    );
}
