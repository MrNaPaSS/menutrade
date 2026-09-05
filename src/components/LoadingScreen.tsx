import { motion } from 'framer-motion';
import { useState } from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  imagePath?: string;
}

const basePath = () => import.meta.env.BASE_URL || '/';

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
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[135%] aspect-square pointer-events-none"
            style={{
              background: 'hsl(142 76% 52%)',
              WebkitMaskImage: `url(${basePath()}graffiti/torn-sun.png)`,
              maskImage: `url(${basePath()}graffiti/torn-sun.png)`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.26, 0.4, 0.26], rotate: [0, 360] }}
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
