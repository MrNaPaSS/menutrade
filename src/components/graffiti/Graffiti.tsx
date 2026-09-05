import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const basePath = () => import.meta.env.BASE_URL || '/';

/**
 * Граффити с лендинга.
 *
 * Одни и те же росчерки в приложении и на сайте - человек узнаёт руку,
 * а не разглядывает две разные марки. Все они декоративные: помечены
 * aria-hidden и не ловят касания, чтобы не мешать тому, что под ними.
 *
 * Оригиналы чёрные, под белый фон сайта. Здесь лежат версии,
 * перекрашенные в наш зелёный прямо в файле - CSS-фильтром такое
 * красится цепочкой invert/sepia/hue-rotate, которую не подогнать
 * точно и больно поддерживать.
 */

interface MarkProps {
    className?: string;
    /** Задержка появления: подстраивается под анимацию списка */
    delay?: number;
}

/** Звезда: отметка о пройденном и о верном ответе */
export function GraffitiStar({ className, delay = 0 }: MarkProps) {
    const reduced = useReducedMotion();

    return (
        <motion.img
            src={`${basePath()}graffiti/star-green.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('object-contain select-none pointer-events-none', className)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -28 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay, duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
        />
    );
}

/** Галочка от руки: там, где обычная иконка выглядит канцелярски */
export function GraffitiCheck({ className, delay = 0 }: MarkProps) {
    const reduced = useReducedMotion();

    return (
        <motion.img
            src={`${basePath()}graffiti/check-green.png`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('object-contain select-none pointer-events-none', className)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        />
    );
}

interface SprayProps {
    className?: string;
    /** Насколько мазок виден. По умолчанию едва заметен */
    opacity?: number;
}

/**
 * Спрей-мазок фоном.
 *
 * Хранится белым силуэтом в градациях серого - цвет задаём здесь, так
 * файл втрое легче цветного. Ставить только за пустотой или за
 * заголовком: под плотным текстом он рушит читаемость.
 */
export function GraffitiSpray({ className, opacity = 0.09 }: SprayProps) {
    return (
        <span
            aria-hidden="true"
            className={cn('absolute pointer-events-none select-none', className)}
            style={{
                opacity,
                background: 'hsl(142 76% 52%)',
                WebkitMaskImage: `url(${basePath()}graffiti/spray-stroke.png)`,
                maskImage: `url(${basePath()}graffiti/spray-stroke.png)`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
            }}
        />
    );
}

/** Три точки: разделитель между секциями вместо линейки */
export function GraffitiDots({ className }: { className?: string }) {
    return (
        <img
            src={`${basePath()}graffiti/dots.svg`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('select-none pointer-events-none', className)}
        />
    );
}

/** Векторный NMNH: водяной знак на том, что сделано нами */
export function GraffitiMark({ className }: { className?: string }) {
    return (
        <img
            src={`${basePath()}graffiti/nmnh-text.svg`}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={cn('select-none pointer-events-none', className)}
        />
    );
}

/**
 * Верхний и нижний фон с рваным краем.
 *
 * Внутри - склейка с мобильной страницы лендинга: тёмное поле с
 * зелёным свечением по краям и размытыми монетами. Обрывается не
 * плавным градиентом, а рваной кромкой - тем же швом, которым на
 * лендинге стыкуются секции. Градиент выглядит как размытая картинка,
 * кромка - как оторванный кусок стены.
 *
 * Кромка хранится маской: белый силуэт с альфой. Так один файл красит
 * что угодно и весит втрое меньше цветного.
 */

const TORN = {
    WebkitMaskImage: `url(${basePath()}graffiti/torn-edge.png)`,
    maskImage: `url(${basePath()}graffiti/torn-edge.png)`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
} as const;

const GLOW = {
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
} as const;

export function GraffitiBackdrop({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'absolute inset-x-0 top-0 z-0 pointer-events-none select-none',
                'h-[min(300px,38vh)]',
                className
            )}
            style={{
                backgroundImage: `url(${basePath()}graffiti/top-glow.jpg)`,
                ...GLOW,
                ...TORN,
            }}
        />
    );
}
