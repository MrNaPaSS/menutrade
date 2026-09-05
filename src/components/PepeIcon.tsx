import { motion, useReducedMotion } from 'framer-motion';

interface PepeIconProps {
  size?: number;
  className?: string;
}

/**
 * Логотип NMNH.
 *
 * Раньше здесь была нарисованная SVG-заглушка - заменена на настоящий
 * логотип из public/. Имя компонента оставлено, чтобы не трогать вызовы.
 */
export function PepeIcon({ size = 56, className = '' }: PepeIconProps) {
  const reducedMotion = useReducedMotion();
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
    >
      {/* Мягкое свечение под логотипом */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
        animate={reducedMotion ? undefined : {
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      <img
        src={`${basePath}nmnh_graffiti.png`}
        alt="NMNH"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className="relative z-10 h-full w-full object-contain"
        style={{ filter: 'drop-shadow(0 0 10px hsl(142, 76%, 52%, 0.55))' }}
      />
    </motion.div>
  );
}
