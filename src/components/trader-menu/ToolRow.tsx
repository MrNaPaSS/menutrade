import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolRowProps {
    title: string;
    /** Что внутри, цифрами: «51 книга в 8 разделах» */
    meta: string;
    /** Значок из набора - для инструментов */
    icon?: LucideIcon;
    /** Или эмодзи - у модулей курса он свой */
    emoji?: string;
    onClick: () => void;
}

/**
 * Строка списка инструментов.
 *
 * Раньше каждый раздел был отдельной карточкой с кнопкой внутри - две
 * цели нажатия на одно и то же действие, и полтора экрана прокрутки на
 * пять пунктов. Теперь строка сама и есть кнопка, а разделы собраны в
 * один список: меньше рамок, меньше размытий, всё помещается разом.
 */
export const ToolRow = memo(function ToolRow({ title, meta, icon: Icon, emoji, onClick }: ToolRowProps) {
    return (
        <button
            onClick={onClick}
            className="group w-full text-left flex items-center gap-3 px-4 py-3 min-h-[60px]
                       transition-colors duration-200 hover:bg-white/[0.04] active:bg-white/[0.07]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset"
        >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                             bg-white/[0.04] border border-white/10
                             transition-colors duration-200
                             group-hover:border-primary/30 group-hover:text-primary
                             text-muted-foreground">
                {Icon ? <Icon className="w-[18px] h-[18px]" /> : <span className="text-base">{emoji}</span>}
            </span>

            <span className="flex-1 min-w-0">
                <span className="block font-display font-semibold text-sm tracking-wide
                                 transition-colors duration-200 group-hover:text-primary">
                    {title}
                </span>
                <span className="block text-xs text-muted-foreground truncate">
                    {meta}
                </span>
            </span>

            <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0
                                     transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
    );
});
