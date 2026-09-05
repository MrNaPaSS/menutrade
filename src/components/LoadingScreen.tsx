import { motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  imagePath?: string;
}

const basePath = () => import.meta.env.BASE_URL || '/';

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
          {/* Салют позади графити.
              Искры разлетаются из центра тремя волнами - у каждой свои
              угол, длина, скорость и задержка, поэтому вспышка идёт
              непрерывно, а не одним хлопком.

              Движение задано в CSS, а не в framer-motion: на каждый
              элемент там заводится свой драйвер в JS, и почти две сотни
              драйверов на старте приложения - ровно тот случай, когда
              загрузка начинает дёргаться */}
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
