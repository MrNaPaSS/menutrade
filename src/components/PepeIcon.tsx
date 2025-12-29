import { motion } from 'framer-motion';

interface PepeIconProps {
  size?: number;
  className?: string;
}

export function PepeIcon({ size = 56, className = '' }: PepeIconProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="relative z-10"
        style={{ 
          filter: 'drop-shadow(0 0 10px hsl(142, 76%, 52%))',
          overflow: 'visible'
        }}
      >
        <defs>
          <radialGradient id="pepeGradient" cx="50%" cy="40%" r="80%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.7" />
          </radialGradient>
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="1" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Pepe Head Shape - квадратная форма с закругленными углами */}
        <rect
          x="12"
          y="28"
          width="76"
          height="64"
          rx="10"
          fill="#22c55e"
          opacity="0.85"
          filter="url(#glow)"
        />
        
        {/* Неоновая академическая шапочка (mortarboard) - квадратная доска сверху */}
        {/* Квадратная доска шапочки - неоновая зеленая */}
        <rect
          x="20"
          y="5"
          width="60"
          height="60"
          rx="3"
          fill="#4ade80"
          opacity="0.95"
          filter="url(#neonGlow)"
          transform="rotate(-12 50 35)"
        />
        
        {/* Обводка доски для неонового эффекта */}
        <rect
          x="20"
          y="5"
          width="60"
          height="60"
          rx="3"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          opacity="1"
          filter="url(#neonGlow)"
          transform="rotate(-12 50 35)"
        />
        
        {/* Основание шапочки (под доской) - неоновая зеленая */}
        <ellipse
          cx="50"
          cy="30"
          rx="38"
          ry="10"
          fill="#22c55e"
          opacity="0.9"
          filter="url(#glow)"
        />
        
        {/* Кисточка шапочки - неоновая золотая, справа */}
        <circle
          cx="75"
          cy="15"
          r="4"
          fill="#fbbf24"
          filter="url(#neonGlow)"
          opacity="1"
        />
        {/* Шнур кисточки */}
        <line
          x1="75"
          y1="15"
          x2="75"
          y2="32"
          stroke="#fbbf24"
          strokeWidth="2.5"
          opacity="1"
          filter="url(#glow)"
        />
        {/* Нити кисточки */}
        <line
          x1="73"
          y1="15"
          x2="73"
          y2="30"
          stroke="#fbbf24"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <line
          x1="77"
          y1="15"
          x2="77"
          y2="30"
          stroke="#fbbf24"
          strokeWidth="1.5"
          opacity="0.9"
        />
        
        {/* Очки - темная область */}
        <rect
          x="28"
          y="52"
          width="44"
          height="20"
          rx="3"
          fill="#0a0a0a"
          opacity="0.85"
        />
        
        {/* Рамка очков - неоновая */}
        <rect
          x="26"
          y="50"
          width="48"
          height="24"
          rx="4"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          opacity="0.95"
          filter="url(#glow)"
        />
        
        {/* Левый объектив - ++ */}
        <text
          x="38"
          y="64"
          fontSize="14"
          fill="#4ade80"
          fontWeight="900"
          opacity="1"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          filter="url(#glow)"
        >
          ++
        </text>
        
        {/* Правый объектив - + */}
        <text
          x="62"
          y="64"
          fontSize="14"
          fill="#4ade80"
          fontWeight="900"
          opacity="1"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          filter="url(#glow)"
        >
          +
        </text>
        
        {/* Рот */}
        <path
          d="M 32 78 Q 50 83 68 78"
          stroke="#22c55e"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
}

