import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
  size: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // При "уменьшить движение" фон остаётся статичным: падающие символы
    // - чистая декорация, без них ничего не теряется.
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    // Какой шрифт сейчас стоит в контексте. -1 значит «неизвестно»
    let currentSize = -1;

    const chars = '01アイウエオカキクケコサシスセソタチツテト🐸💚📈📉💰₿Ξ';
    const charArray = chars.split('');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Смена размера обнуляет состояние контекста вместе со шрифтом
      currentSize = -1;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const columns = Math.floor(canvas.width / 20);
      
      for (let i = 0; i < columns; i++) {
        particles.push({
          x: i * 20,
          y: Math.random() * canvas.height * -1,
          speed: 1 + Math.random() * 3,
          char: charArray[Math.floor(Math.random() * charArray.length)],
          opacity: 0.25 + Math.random() * 0.6,
          size: 12 + Math.floor(Math.random() * 7)
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Фон декоративный: 30 кадров в секунду визуально неотличимы от 60,
    // но вдвое дешевле для батареи и оставляют главный поток интерфейсу.
    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;

    // Строки шрифта и цвета считаем один раз: в кадре они повторяются
    // сотню раз, а различаются десятком значений
    const fontCache = new Map<number, string>();
    const fontFor = (size: number) => {
      let font = fontCache.get(size);
      if (!font) {
        font = `${size}px "JetBrains Mono", monospace`;
        fontCache.set(size, font);
      }
      return font;
    };

    const fillCache = new Map<number, string>();
    const fillFor = (opacity: number) => {
      const step = Math.round(opacity * 20); // шаг прозрачности незаметен глазу
      let fill = fillCache.get(step);
      if (!fill) {
        fill = `rgba(154, 255, 190, ${(step / 20).toFixed(2)})`;
        fillCache.set(step, fill);
      }
      return fill;
    };


    const draw = (now = 0) => {
      animationId = requestAnimationFrame(draw);

      if (now - lastFrame < FRAME_MS) return;
      lastFrame = now;

      // Кадр стираем начисто. Раньше сверху заливался полупрозрачный
      // тёмный прямоугольник - от него у символов оставался шлейф,
      // который не исчезал, а холст постепенно затягивало тёмной
      // плёнкой и она глушила фон под ним
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Свечение задаём один раз на кадр, а не на каждый символ: цвет
      // и радиус у всех одинаковые, а смена состояния контекста сотню
      // раз в кадр стоит дороже самой отрисовки
      ctx.shadowColor = 'rgba(74, 222, 128, 0.9)';
      ctx.shadowBlur = 7;

      particles.forEach((particle, index) => {
        // Символ рисуется сплошным цветом. Прежде под каждый создавался
        // отдельный градиент - сотня объектов в кадре, тридцать раз в
        // секунду, ради перехода высотой в двадцать точек.
        ctx.fillStyle = fillFor(particle.opacity);

        // Разбор строки шрифта дорог, а размеров у нас всего семь:
        // ставим шрифт только когда он вправду меняется
        if (particle.size !== currentSize) {
          currentSize = particle.size;
          ctx.font = fontFor(particle.size);
        }

        ctx.fillText(particle.char, particle.x, particle.y);

        // Update particle
        particle.y += particle.speed;
        
        // Random character change
        if (Math.random() > 0.98) {
          particle.char = charArray[Math.floor(Math.random() * charArray.length)];
        }

        // Reset when out of screen
        if (particle.y > canvas.height) {
          particles[index] = {
            x: particle.x,
            y: -20,
            speed: 1 + Math.random() * 3,
            char: charArray[Math.floor(Math.random() * charArray.length)],
            opacity: 0.25 + Math.random() * 0.6,
            size: 12 + Math.floor(Math.random() * 7)
          };
        }
      });
    };

    // Пока вкладка скрыта, браузер всё равно душит rAF, но мы
    // останавливаемся явно - иначе при возврате копится очередь кадров.
    const handleVisibility = () => {
      cancelAnimationFrame(animationId);
      if (!document.hidden) {
        lastFrame = 0;
        draw();
      }
    };

    draw();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.55 }}
    />
  );
}
