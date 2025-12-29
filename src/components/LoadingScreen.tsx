import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  imagePath?: string;
}

export function LoadingScreen({ message = 'Загрузка...', imagePath }: LoadingScreenProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);

  // Пробуем найти изображение (GIF, PNG, JPG) по разным путям
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    const pathsToTry = imagePath
      ? [imagePath]
      : [
        `${basePath}ultra_trader_logo.gif`
      ];

    const checkImage = (path: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            console.log('⏱️ Таймаут загрузки:', path);
            resolved = true;
            resolve(false);
          }
        }, 2000); // Таймаут 2 секунды

        img.onload = () => {
          if (!resolved) {
            console.log('✅ GIF найден:', path);
            setCurrentImagePath(path);
            resolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        };
        img.onerror = () => {
          if (!resolved) {
            console.log('❌ Файл не найден:', path);
            resolved = true;
            clearTimeout(timeout);
            resolve(false);
          }
        };
        img.src = path;
      });
    };

    const tryPaths = async () => {
      console.log('🔍 Поиск GIF файла...');
      for (const path of pathsToTry) {
        const exists = await checkImage(path);
        if (exists) {
          console.log('✅ Используется:', path);
          return;
        }
      }
      // Если ни одно изображение не найдено
      console.warn('⚠️ GIF не найден, используется fallback');
      setImageError(true);
    };

    tryPaths();
  }, [imagePath]);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Logo Image */}
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {currentImagePath && !imageError ? (
            <motion.img
              src={currentImagePath}
              alt="NO MONEY - NO HONEY"
              className="relative max-w-[300px] max-h-[300px] md:max-w-[400px] md:max-h-[400px] w-auto h-auto object-contain rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                imageRendering: 'auto',
                display: 'block'
              }}
            />
          ) : (
            // Fallback - иконка Brain
            <motion.div
              className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Brain className="w-10 h-10 text-primary" />
            </motion.div>
          )}
        </motion.div>

        {/* Title - скрыт, так как уже есть на изображении */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden"
        >
          <h1 className="font-display font-bold text-2xl tracking-wider mb-2">
            <span className="neon-text-subtle">NO MONEY</span>
            <span className="text-foreground mx-2">-</span>
            <span className="neon-text-subtle">NO HONEY</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Академия здравого трейдера
          </p>
        </motion.div>

        {/* Loading message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground">{message}</p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

