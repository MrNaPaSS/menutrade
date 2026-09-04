import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

type BackHandler = () => void;

interface BackNavigation {
    /** Ставит обработчик поверх остальных, снимает при уходе экрана */
    push: (handler: BackHandler) => () => void;
    /** Что делать по жесту сейчас */
    run: () => void;
}

const BackNavigationContext = createContext<BackNavigation | null>(null);

interface ProviderProps {
    /** Куда возвращаться, когда экран ничего своего не зарегистрировал */
    fallback: BackHandler;
    children: React.ReactNode;
}

/**
 * Кто отвечает за возврат назад.
 *
 * Раньше каждый экран вешал свой обработчик свайпа, а вложенные виды -
 * ещё по одному сверху: на уроке слушателей было три, и какой сработает
 * первым, зависело от порядка монтирования. Здесь обработчики лежат
 * стопкой, и жест всегда обращается к верхнему - то есть к самому
 * глубокому открытому виду.
 *
 * Экран, которому нечего добавить, не регистрирует ничего, и работает
 * запасной вариант - шаг назад по истории.
 */
export function BackNavigationProvider({ fallback, children }: ProviderProps) {
    const stack = useRef<BackHandler[]>([]);
    const fallbackRef = useRef(fallback);
    fallbackRef.current = fallback;

    const push = useCallback((handler: BackHandler) => {
        stack.current.push(handler);
        return () => {
            const index = stack.current.lastIndexOf(handler);
            if (index >= 0) stack.current.splice(index, 1);
        };
    }, []);

    const run = useCallback(() => {
        const top = stack.current[stack.current.length - 1];
        (top ?? fallbackRef.current)();
    }, []);

    return (
        <BackNavigationContext.Provider value={{ push, run }}>
            {children}
        </BackNavigationContext.Provider>
    );
}

export function useBackNavigation(): BackNavigation {
    const value = useContext(BackNavigationContext);
    if (!value) {
        throw new Error('useBackNavigation вызван вне BackNavigationProvider');
    }
    return value;
}

/**
 * Объявляет, что значит «назад» на этом экране.
 *
 * Вызывать там, где возврат ведёт не в историю браузера, а во
 * внутренний вид: из урока к списку уроков, из списка к модулям.
 */
export function useBackAction(handler: BackHandler, enabled = true): void {
    const { push } = useBackNavigation();
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return;
        return push(() => handlerRef.current());
    }, [push, enabled]);
}
