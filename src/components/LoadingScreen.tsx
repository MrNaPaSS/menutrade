import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  imagePath?: string;
}

const basePath = () => import.meta.env.BASE_URL || '/';

/** Силуэт из файла красим цветом здесь: один файл на любой оттенок */
const maskOf = (file: string) => ({
  WebkitMaskImage: `url(${basePath()}graffiti/${file})`,
  maskImage: `url(${basePath()}graffiti/${file})`,
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
} as const);

/**
 * Искры салюта.
 *
 * Считаются один раз на модуль: пересчёт на каждый кадр дал бы новые
 * углы, и салют распался бы на дрожь. Числа выведены из индекса, а не
 * случайны - тогда картинка одинакова при каждой загрузке и её можно
 * подбирать глазами.
 */
const SPARK_COUNT = 180;
const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const ring = i % 3;                       // три волны на разной глубине
  const jitter = ((i * 37) % 23) - 11;      // ровные лучи читаются как звёздочка

  return {
    id: i,
    angle: (360 / SPARK_COUNT) * i * 3 + jitter,
    from: 70 + ring * 26 + ((i * 13) % 30),
    to: 190 + ring * 40 + ((i * 29) % 130),
    length: 12 + ((i * 17) % 30),
    duration: 1.3 + ((i * 7) % 14) / 10,
    delay: ((i * 23) % 47) / 10,
    peak: 0.55 + ((i * 11) % 40) / 100,
  };
});

/**
 * Молнии.
 *
 * Бьют со всех сторон в центр графити: начало каждой лежит за краем
 * экрана на своём угле, дальше ломаная идёт к центру со сносом поперёк
 * хода - снос гаснет к цели, иначе разряд промахивается мимо логотипа.
 * Изредка отходит короткая ветка.
 *
 * Числа выведены из номера разряда, а не случайны: гроза одинакова при
 * каждой загрузке, и её можно подбирать глазами.
 *
 * Система координат SVG - 400x760, растягивается на экран целиком.
 */
const BOLT_TARGET = { x: 200, y: 330 };
const BOLT_COUNT = 12;
const BOLT_CYCLE = 5.4;

function buildBolt(seed: number, angleDeg: number) {
    let rnd = seed * 9301 + 49297;
    const next = () => {
        rnd = (rnd * 9301 + 49297) % 233280;
        return rnd / 233280;
    };

    const angle = (angleDeg * Math.PI) / 180;
    // Начало за краем кадра: молния должна входить из-за экрана,
    // а не возникать на его границе
    const reach = 470 + next() * 90;
    const sx = BOLT_TARGET.x + Math.cos(angle) * reach;
    const sy = BOLT_TARGET.y + Math.sin(angle) * reach;

    // Единичный вектор поперёк хода - вдоль него и уводим ломаную
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);

    const steps = 10;
    const main: Array<[number, number]> = [[sx, sy]];
    const branches: string[] = [];

    for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        const baseX = sx + (BOLT_TARGET.x - sx) * t;
        const baseY = sy + (BOLT_TARGET.y - sy) * t;
        const drift = (next() - 0.5) * 110 * (1 - t) * (1 - t);
        const x = baseX + nx * drift;
        const y = baseY + ny * drift;
        main.push([x, y]);

        if (i > 2 && i < steps - 1 && next() > 0.7) {
            const len = 40 + next() * 70;
            const side = next() > 0.5 ? 1 : -1;
            const bx = x + nx * len * side - Math.cos(angle) * len * 0.4;
            const by = y + ny * len * side - Math.sin(angle) * len * 0.4;
            branches.push(`M ${x.toFixed(1)} ${y.toFixed(1)} L ${((x + bx) / 2).toFixed(1)} ${((y + by) / 2 - 10).toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)}`);
        }
    }
    main.push([BOLT_TARGET.x, BOLT_TARGET.y]);

    return {
        main: `M ${main.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`,
        branches,
    };
}

const BOLTS = Array.from({ length: BOLT_COUNT }, (_, i) => {
    // Разряды идут не по кругу подряд, а вразнобой: соседние по времени
    // молнии из соседних углов читались бы как бегущая строка
    const order = (i * 5) % BOLT_COUNT;
    const jitter = ((i * 37) % 19) - 9;
    const angleDeg = (360 / BOLT_COUNT) * i + jitter;
    const rad = (angleDeg * Math.PI) / 180;

    return {
        id: i,
        delay: Number(((order * BOLT_CYCLE) / BOLT_COUNT).toFixed(2)),
        // Вспышка приходит со стороны разряда, а не всегда сверху
        flashX: Math.round(50 + Math.cos(rad) * 42),
        flashY: Math.round(50 + Math.sin(rad) * 42),
        ...buildBolt(i + 3, angleDeg),
    };
});

/**
 * Экран загрузки.
 *
 * Открытие показывает графити NMNH и больше ничего: это логотип
 * академии, и никакой другой картинке перед ним появляться не нужно.
 *
 * Раньше экран сразу рисовал значок мозга и только потом вслепую
 * перебирал пути к логотипу, по две секунды таймаута на каждый.
 * Отсюда чужая иконка в начале и логотип спустя пару секунд.
 */
export function LoadingScreen({ message = 'Загрузка...', imagePath }: LoadingScreenProps) {
  const [failed, setFailed] = useState(false);
  const src = imagePath || `${basePath()}nmnh_logo.png`;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden">
      {/* Гроза во весь экран: молния идёт от верхнего края, поэтому
          живёт в корне, а не внутри контейнера логотипа */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 760"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {BOLTS.map(bolt => (
          <g
            key={bolt.id}
            className="bolt"
            style={{ '--delay': `${bolt.delay}s`, '--cycle': `${BOLT_CYCLE}s` } as CSSProperties}
          >
            {/* Свечение отдельным широким штрихом под ядром: один штрих
                с тенью на телефоне размывается в кисель */}
            <path
              d={bolt.main}
              stroke="hsl(142 76% 52%)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.28}
              style={{ filter: 'blur(6px)' }}
            />
            {bolt.branches.map(branch => (
              <path
                key={branch}
                d={branch}
                stroke="hsl(142 70% 70%)"
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={0.75}
              />
            ))}
            <path
              d={bolt.main}
              stroke="hsl(140 90% 88%)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>

      {/* Мерцание экрана в такт разряду */}
      {BOLTS.map(bolt => (
        <span
          key={bolt.id}
          aria-hidden="true"
          className="storm-flash absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${bolt.flashX}% ${bolt.flashY}%, hsl(142 76% 62% / 0.5), transparent 62%)`,
            '--delay': `${bolt.delay}s`,
            '--cycle': `${BOLT_CYCLE}s`,
          } as CSSProperties}
        />
      ))}

      <div className="relative text-center space-y-6">
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Искры от удара: разлетаются из центра тремя волнами.
              Движение задано в CSS, а не в framer-motion - там на
              каждый элемент заводится свой драйвер в JS, и почти две
              сотни драйверов на старте приложения дают рывки */}
          {SPARKS.map(spark => (
            <span
              key={spark.id}
              aria-hidden="true"
              className="spark-ray"
              style={{ transform: `rotate(${spark.angle}deg)` }}
            >
              <i
                style={{
                  width: spark.length,
                  '--from': `${spark.from}px`,
                  '--to': `${spark.to}px`,
                  '--dur': `${spark.duration}s`,
                  '--delay': `${spark.delay}s`,
                  '--peak': spark.peak,
                } as CSSProperties}
              />
            </span>
          ))}

          {/* Матовая плита за графити: тёмно-зелёная подложка, а не
              источник света - иначе она спорит со вспышками грозы */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[128%] aspect-square pointer-events-none"
            style={{
              background: 'hsl(150 34% 7%)',
              ...maskOf('torn-slab.png'),
            }}
          />

          {!failed ? (
            <img
              src={src}
              alt="NO MONEY - NO HONEY"
              // Без появления по прозрачности: логотип и так свой, а
              // лишний переход читается как ещё одно мелькание
              className="relative max-w-[300px] max-h-[300px] md:max-w-[400px] md:max-h-[400px]
                         w-auto h-auto object-contain rounded-2xl block"
              // Картинка не открылась - остаётся простой значок,
              // лишь бы экран не оказался пустым
              onError={() => setFailed(true)}
            />
          ) : (
            <motion.div
              className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20
                         border border-primary/30 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-10 h-10 text-primary" />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground">{message}</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
