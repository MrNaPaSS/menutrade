import { motion } from 'framer-motion';
import { useState } from 'react';
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
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Рваное солнце позади графити.
              Раньше здесь дышал размытый прямоугольник - он повторял
              форму контейнера, и на экране двигался зелёный квадрат.
              Солнце нарисовано тем же рваным краем, что и кромки полос,
              и хранится маской: цвет задаётся здесь */}
          {/* Деньги пылью: сильно размытые $ и zł на 7%. Именно
              размытыми - читаемые значки валют превращают экран в
              обещание лёгких денег, а у нас академия про обратное */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 w-[190%] aspect-square pointer-events-none"
            style={{
              background: 'hsl(142 76% 52%)',
              ...maskOf('money-dust.png'),
            }}
            initial={{ x: '-50%', y: '-50%', opacity: 0 }}
            animate={{ x: '-50%', y: '-50%', opacity: [0.05, 0.09, 0.05] }}
            transition={{ opacity: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
          />

          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 w-[135%] aspect-square pointer-events-none"
            style={{
              background: 'hsl(142 76% 52%)',
              ...maskOf('torn-sun.png'),
            }}
            /* Смещение к центру задаём через x/y самого motion, а не
               классами -translate-*: motion собирает transform сам и
               затирает классы - солнце уезжало вправо вниз */
            initial={{ x: '-50%', y: '-50%' }}
            animate={{
              x: '-50%',
              y: '-50%',
              scale: [1, 1.06, 1],
              opacity: [0.2, 0.32, 0.2],
              rotate: [0, 360],
            }}
            transition={{
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              // Оборот медленный: солнце должно теплиться, а не крутиться
              rotate: { duration: 90, repeat: Infinity, ease: 'linear' },
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
