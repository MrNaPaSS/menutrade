import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { BADGE_LABEL, type SoftwareItem } from '@/data/software';
import { cn } from '@/lib/utils';

interface SoftwareDrawerProps {
    item: SoftwareItem | null;
    onOpenChange: (open: boolean) => void;
}

function openLink(url: string): void {
    const tg = (window as { Telegram?: { WebApp?: { openLink?: (u: string) => void } } }).Telegram?.WebApp;
    if (tg?.openLink) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank', 'noopener');
    }
}

const BADGE_STYLE: Record<string, string> = {
    free: 'bg-primary/15 text-primary border-primary/30',
    pro: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    crypto: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

/**
 * Карточка продукта.
 *
 * Раскрывается по нажатию на строку списка: в самом списке остаётся
 * только название и вид, а подробности - что умеет, как получить и
 * куда идти - приходят сюда. Так четыре продукта помещаются на экран,
 * и человек читает про один, а не пролистывает четыре простыни.
 */
export function SoftwareDrawer({ item, onOpenChange }: SoftwareDrawerProps) {
    return (
        <Drawer open={!!item} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[88dvh]">
                {item && (
                    <>
                        <DrawerHeader className="text-left pb-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <DrawerTitle className="font-display text-lg tracking-wide">
                                        {item.name}
                                    </DrawerTitle>
                                    <DrawerDescription className="text-xs text-muted-foreground mt-0.5">
                                        {item.kind}
                                    </DrawerDescription>
                                </div>
                                <span className={cn(
                                    'text-[11px] px-2 py-1 rounded-full border flex-shrink-0',
                                    BADGE_STYLE[item.badge]
                                )}>
                                    {BADGE_LABEL[item.badge]}
                                </span>
                            </div>
                        </DrawerHeader>

                        <div className="px-4 pb-6 overflow-y-auto">
                            <p className="text-sm text-foreground/90 mb-4">
                                {item.summary}
                            </p>

                            {item.facts.length > 0 && (
                                <ul className="space-y-2 mb-5">
                                    {item.facts.map((fact, i) => (
                                        <motion.li
                                            key={fact}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 + i * 0.05, duration: 0.2 }}
                                            className="flex items-start gap-2 text-sm text-muted-foreground"
                                        >
                                            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            <span>{fact}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}

                            {item.steps.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="text-xs text-muted-foreground mb-2">Как получить доступ</h4>
                                    {/* Нумерация здесь по делу: это порядок действий,
                                        а не украшение списка */}
                                    <ol className="space-y-2">
                                        {item.steps.map((step, i) => (
                                            <li key={step} className="flex items-start gap-2.5 text-sm">
                                                <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/10
                                                                 flex items-center justify-center flex-shrink-0
                                                                 font-mono text-[11px] text-muted-foreground tabular-nums">
                                                    {i + 1}
                                                </span>
                                                <span className="text-muted-foreground">{step}</span>
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
                                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                                    {item.note}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
}
