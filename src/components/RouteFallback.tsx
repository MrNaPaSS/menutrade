/**
 * Заглушка на время загрузки экрана.
 *
 * Экраны приходят отдельными кусками, и между нажатием и первым кадром
 * есть доля секунды. Пустой белый лист в этот момент читается как
 * зависание, поэтому держим фон и спокойный индикатор - без текста и
 * без прыжков разметки.
 */
export function RouteFallback() {
    return (
        <div
            className="min-h-[100dvh] flex items-center justify-center bg-background"
            role="status"
            aria-label="Загрузка"
        >
            <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
        </div>
    );
}
