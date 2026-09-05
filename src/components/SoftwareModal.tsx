import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    MODAL_CAPTION,
    MODAL_EASE,
    MODAL_TITLE,
    ModalWindow,
} from '@/components/ui/modal-window';
import { GraffitiMark } from '@/components/graffiti/Graffiti';
import { BADGE_LABEL, type SoftwareItem } from '@/data/software';
import { cn } from '@/lib/utils';

interface SoftwareModalProps {
    item: SoftwareItem | null;
    onClose: () => void;
}

const BADGE_STYLE: Record<string, string> = {
    free: 'bg-primary/15 text-primary border-primary/30',
    pro: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    crypto: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

function openLink(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

/**
 * Карточка продукта.
 *
 * Открывается тем же окном, что направления и стратегии: раньше здесь
 * поднималась шторка снизу, и раздел выбивался из остальных.
 */
export function SoftwareModal({ item, onClose }: SoftwareModalProps) {
    return (
        <ModalWindow
            open={!!item}
            onClose={onClose}
            title={item?.name ?? ''}
            subtitle={item?.kind}
        >
            {item && (
                <>
                    {/* Водяной знак: софт написан нами, и на карточке это
                        видно без отдельной подписи */}
                    <GraffitiMark className="absolute right-3 bottom-2 w-16 h-auto opacity-[0.07]" />

                    <div className="relative flex items-center justify-between gap-3 -mt-1">
                        <p className="text-[13px] leading-snug" style={{ color: MODAL_TITLE }}>
                            {item.summary}
                        </p>
                        <span className={cn(
                            'text-[11px] px-2 py-1 rounded-full border flex-shrink-0 self-start',
                            BADGE_STYLE[item.badge]
                        )}>
                            {BADGE_LABEL[item.badge]}
                        </span>
                    </div>

                    {item.facts.length > 0 && (
                        <ul className="space-y-2 pt-1">
                            {item.facts.map((fact, i) => (
                                <motion.li
                                    key={fact}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 + i * 0.06, duration: 0.24, ease: MODAL_EASE }}
                                    className="flex items-start gap-2 text-[12.5px]"
                                    style={{ color: MODAL_CAPTION }}
                                >
                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>{fact}</span>
                                </motion.li>
                            ))}
                        </ul>
                    )}

                    {item.steps.length > 0 && (
                        <div
                            className="rounded-[16px] p-3.5 border border-[hsl(142_22%_16%)]"
                            style={{ background: 'hsl(140 26% 8%)' }}
                        >
                            <h3 className="text-[11px] uppercase tracking-[0.09em] mb-2.5"
                                style={{ color: MODAL_CAPTION }}>
                                Как получить доступ
                            </h3>
                            {/* Нумерация по делу: это порядок действий, а не
                                украшение списка */}
                            <ol className="space-y-2">
                                {item.steps.map((step, i) => (
                                    <li key={step} className="flex items-start gap-2.5 text-[12.5px]">
                                        <span className="w-5 h-5 rounded-full flex items-center justify-center
                                                         flex-shrink-0 font-mono text-[11px] tabular-nums
                                                         border border-white/10"
                                            style={{ background: 'hsl(142 25% 13%)', color: MODAL_CAPTION }}>
                                            {i + 1}
                                        </span>
                                        <span style={{ color: MODAL_CAPTION }}>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div className="space-y-2">
                        {item.links.map(link => (
                            <Button
                                key={link.url}
                                variant={link.kind === 'primary' ? 'default' : 'outline'}
                                className="w-full justify-between min-h-[44px]"
                                onClick={() => openLink(link.url)}
                            >
                                <span className="font-semibold">{link.label}</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        ))}
                    </div>

                    {item.note && (
                        <p className="text-[11.5px] leading-relaxed" style={{ color: MODAL_CAPTION }}>
                            {item.note}
                        </p>
                    )}
                </>
            )}
        </ModalWindow>
    );
}
