/**
 * Вибро-отклик Telegram.
 *
 * Отдаётся на нажатие по всему приложению одним обработчиком на
 * документе, а не вызовом в каждой кнопке: кнопок под сотню, и вписать
 * вызов в каждую значит гарантированно забыть про часть из них и про
 * все будущие.
 */

type Impact = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type Notification = 'error' | 'success' | 'warning';

interface Haptics {
    impactOccurred?: (style: Impact) => void;
    notificationOccurred?: (type: Notification) => void;
    selectionChanged?: () => void;
}

function haptics(): Haptics | undefined {
    return (window as { Telegram?: { WebApp?: { HapticFeedback?: Haptics } } })
        .Telegram?.WebApp?.HapticFeedback;
}

/** Короткий отклик на нажатие */
export function tapHaptic(style: Impact = 'light'): void {
    try {
        haptics()?.impactOccurred?.(style);
    } catch {
        /* вне Telegram или клиент без вибро - молча */
    }
}

/** Отклик на исход действия: забрали монеты, отправили заявку, ошибка */
export function resultHaptic(type: Notification): void {
    try {
        haptics()?.notificationOccurred?.(type);
    } catch {
        /* вне Telegram или клиент без вибро - молча */
    }
}

/**
 * Отклик на нажатие по всему приложению.
 *
 * Вешается один раз на документ. Ловим pointerdown, а не click: отклик
 * должен совпадать с касанием, а не приходить после того, как палец
 * уже оторвали.
 *
 * Отдаём только по тому, что и вправду нажимается: кнопки, ссылки,
 * поля выбора и элементы с role="button". По пустому месту экрана
 * вибрации быть не должно.
 */
const PRESSABLE = 'button, a, [role="button"], [role="tab"], [role="menuitem"], summary, label[for]';

export function installTapHaptics(): () => void {
    const onPointerDown = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const pressable = target.closest(PRESSABLE);
        if (!pressable) return;
        // Выключенная кнопка ничего не делает - и отклика на неё быть
        // не должно, иначе он читается как «сработало»
        if (pressable.matches(':disabled, [aria-disabled="true"]')) return;

        tapHaptic('light');
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
}
