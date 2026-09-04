import { strategyModules } from '@/data/strategies';
import { ModalWindow } from '@/components/ui/modal-window';
import { ModalCard } from '@/components/trader-menu/ModalCard';

interface StrategiesModalProps {
    open: boolean;
    onClose: () => void;
    /** Открыть конкретный блок разборов */
    onSelect: (moduleId: string) => void;
}

const TOTAL = strategyModules.reduce((sum, m) => sum + m.lessons.length, 0);

function plural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}

/**
 * Блоки торговых стратегий.
 *
 * Открывается тем же окном, что и направления обучения: одинаковая
 * постановка важнее разнообразия - человек узнаёт движение, а не
 * разгадывает его заново.
 *
 * Прогресса здесь нет: стратегии это справочник, а не последовательный
 * курс, и читать их можно в любом порядке.
 */
export function StrategiesModal({ open, onClose, onSelect }: StrategiesModalProps) {
    return (
        <ModalWindow
            open={open}
            onClose={onClose}
            title="Стратегии"
            subtitle={`${TOTAL} ${plural(TOTAL, 'разбор', 'разбора', 'разборов')} в ${strategyModules.length} блоках. Читать можно в любом порядке`}
        >
            {strategyModules.map((module, index) => (
                <ModalCard
                    key={module.id}
                    index={index}
                    icon={module.icon}
                    title={module.title}
                    description={module.description}
                    footnote={`${module.lessons.length} ${plural(module.lessons.length, 'разбор', 'разбора', 'разборов')}`}
                    action="Открыть"
                    onClick={() => onSelect(module.id)}
                />
            ))}
        </ModalWindow>
    );
}
