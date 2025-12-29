import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, showLabel = true }: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Твой прогресс
          </span>
          <motion.span 
            className="text-sm font-bold text-primary font-display"
            key={progress}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {progress}%
          </motion.span>
        </div>
      )}
      
      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden border border-border/30">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        
        {/* Progress bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 1, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2 
          }}
        >
          {/* Shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 1 
            }}
          />
          
          {/* Glow at the end */}
          <motion.div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/80 blur-sm"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
