import { Bot, Code, LineChart, Signal } from 'lucide-react';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';
import { softwareItems, type SoftwareItem } from '@/data/software';

interface SoftwareListModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (item: SoftwareItem) => void;
}

/** Свой значок каждому продукту: четыре одинаковых сливаются в один блок. */
const ICONS: Record<string, JSX.Element> = {
    'market-assistant': <Bot className="w-5 h-5" />,
    'nmnh-trade': <LineChart className="w-5 h-5" />,
    'black-mirror': <Signal className="w-5 h-5" />,
    'forex-signals': <Code className="w-5 h-5" />,
};

/**
 * Список продуктов окном.
 *
 * Тем же окном, что направления и стратегии. Выбор продукта открывает
 * его карточку - с фактами, шагами до доступа и ссылками.
 */
export function SoftwareListModal({ open, onClose, onSelect }: SoftwareListModalProps) {
    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Наш софт"
            subtitle="Расширение, индикатор, платформа и веб-приложение"
        >
            {softwareItems.map((item, index) => (
                <ModalCard
                    key={item.id}
                    index={index}
                    icon={ICONS[item.id] ?? <Code className="w-5 h-5" />}
                    title={item.name}
                    description={item.summary}
                    // Только вид продукта: вместе с меткой доступа строка
                    // не помещалась и обрезалась на полуслове
                    footnote={item.kind}
                    action="Подробнее"
                    onClick={() => onSelect(item)}
                />
            ))}
        </ModalWindow>
    );
}
