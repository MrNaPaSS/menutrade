import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const chars = '01アイウエオカキクケコサシスセソタチツテト🐸💚📈📉💰₿Ξ';
    const charArray = chars.split('');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
          opacity: 0.1 + Math.random() * 0.5,
          size: 12 + Math.random() * 6
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(8, 15, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Gradient color based on position
        const gradient = ctx.createLinearGradient(
          particle.x, 
          particle.y - 20, 
          particle.x, 
          particle.y
        );
        gradient.addColorStop(0, `rgba(34, 197, 94, 0)`);
        gradient.addColorStop(0.5, `rgba(34, 197, 94, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(74, 222, 128, ${particle.opacity})`);

        ctx.fillStyle = gradient;
        ctx.font = `${particle.size}px "JetBrains Mono", monospace`;
        
        // Draw main character
        ctx.fillText(particle.char, particle.x, particle.y);
        
        // Draw glow for some characters
        if (Math.random() > 0.97) {
          ctx.shadowColor = 'rgba(34, 197, 94, 0.8)';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(134, 239, 172, 0.9)';
          ctx.fillText(particle.char, particle.x, particle.y);
          ctx.shadowBlur = 0;
        }

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
            opacity: 0.1 + Math.random() * 0.5,
            size: 12 + Math.random() * 6
          };
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
