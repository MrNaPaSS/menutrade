/**
 * Видимая часть экрана при открытой клавиатуре.
 *
 * Telegram сообщает высоту окна событием viewportChanged, но клавиатуру
 * он на части платформ не учитывает: высота остаётся прежней, а
 * фактически видно вдвое меньше. Окна с полями ввода при этом
 * центрируются по невидимой области и уезжают под клавиатуру.
 *
 * Единственный надёжный источник - visualViewport: он и есть та часть
 * страницы, которую человек сейчас видит. Пишем её в переменные, и
 * разметка опирается на них, а не на высоту окна.
 *
 *   --app-vh      высота видимой области
 *   --app-vtop    насколько она смещена сверху
 *   --app-vbottom сколько закрыто снизу
 *   --app-kb      высота клавиатуры, ноль когда её нет
 */

export function installViewportVars(): () => void {
    const root = document.documentElement;
    const vv = window.visualViewport;

    const apply = () => {
        const height = vv?.height ?? window.innerHeight;
        const offset = vv?.offsetTop ?? 0;
        // Разницу ниже сотни пикселей клавиатурой не считаем: столько
        // занимает панель адреса в браузере, и на неё дёргаться не надо
        const keyboard = Math.max(0, window.innerHeight - height - offset);

        root.style.setProperty('--app-vh', `${Math.round(height)}px`);
        root.style.setProperty('--app-vtop', `${Math.round(offset)}px`);
        root.style.setProperty('--app-vbottom', `${Math.round(Math.max(0, keyboard))}px`);
        root.style.setProperty('--app-kb', `${keyboard > 100 ? Math.round(keyboard) : 0}px`);
    };

    apply();

    /**
     * Клавиатура уходит раньше, чем браузер сообщает новый размер: между
     * снятием фокуса и событием resize проходит до трети секунды, и всё
     * это время разметка считает, что видно только половину экрана.
     *
     * Поэтому на снятии фокуса сразу считаем экран целым. Если окажется,
     * что клавиатура осталась (человек перешёл в соседнее поле), resize
     * тут же поправит - лишний кадр во всю высоту незаметен, а
     * подпрыгивающая разметка заметна очень.
     */
    const onBlur = () => {
        root.style.setProperty('--app-vh', `${Math.round(window.innerHeight)}px`);
        root.style.setProperty('--app-vtop', '0px');
        root.style.setProperty('--app-vbottom', '0px');
        root.style.setProperty('--app-kb', '0px');
    };

    document.addEventListener('focusout', onBlur);

    /**
     * Догоняем размер несколько кадров подряд.
     *
     * visualViewport сообщает о клавиатуре один раз, а Telegram на Android
     * доводит высоту анимацией уже после этого события. Одного замера мало:
     * он приходится на середину движения. Полсекунды опроса стоят дёшево и
     * снимают вопрос на всех платформах сразу.
     */
    let chase = 0;
    const applySoon = () => {
        cancelAnimationFrame(chase);
        const until = Date.now() + 500;
        const step = () => {
            apply();
            if (Date.now() < until) chase = requestAnimationFrame(step);
        };
        chase = requestAnimationFrame(step);
    };

    // Telegram узнаёт о клавиатуре раньше браузера и говорит об этом сам
    const tg = (window as unknown as {
        Telegram?: { WebApp?: { onEvent?: (e: string, h: () => void) => void;
                                offEvent?: (e: string, h: () => void) => void } };
    }).Telegram?.WebApp;
    tg?.onEvent?.('viewportChanged', applySoon);

    if (!vv) {
        window.addEventListener('resize', applySoon);
        return () => {
            cancelAnimationFrame(chase);
            window.removeEventListener('resize', applySoon);
            document.removeEventListener('focusout', onBlur);
            tg?.offEvent?.('viewportChanged', applySoon);
        };
    }

    vv.addEventListener('resize', applySoon);
    vv.addEventListener('scroll', apply);
    window.addEventListener('orientationchange', applySoon);

    return () => {
        cancelAnimationFrame(chase);
        vv.removeEventListener('resize', applySoon);
        vv.removeEventListener('scroll', apply);
        window.removeEventListener('orientationchange', applySoon);
        document.removeEventListener('focusout', onBlur);
        tg?.offEvent?.('viewportChanged', applySoon);
    };
}

/**
 * Подтягивает поле под курсором в видимую часть.
 *
 * Клавиатура появляется не мгновенно, и сразу после фокуса видимая
 * область ещё прежняя - поэтому ждём кадр после её изменения, а не
 * прокручиваем сразу.
 */
export function installFocusScroll(): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onFocus = (event: Event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (!target.matches('input, textarea, [contenteditable="true"]')) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
            target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 250);
    };

    document.addEventListener('focusin', onFocus);
    return () => {
        clearTimeout(timer);
        document.removeEventListener('focusin', onFocus);
    };
}
