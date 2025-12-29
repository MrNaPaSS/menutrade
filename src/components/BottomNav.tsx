import { motion } from 'framer-motion';
import { Home, MessageCircle, Target, ExternalLink, HeadphonesIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onHomeClick?: () => void;
  platformUrl?: string;
  supportUrl?: string;
  channelUrl?: string;
}

const navItemVariants = {
  initial: { scale: 1 },
  tap: { scale: 0.92 },
  hover: { scale: 1.05 }
};

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  tap: { scale: 0.9 },
  hover: { scale: 1.15, rotate: 3 }
};

const mainButtonVariants = {
  initial: { scale: 1, y: 0 },
  tap: { scale: 0.95, y: 2 },
  hover: { scale: 1.08, y: -4 }
};

export function BottomNav({ 
  onHomeClick,
  platformUrl = "https://u3.shortink.io/register?utm_campaign=827841&utm_source=affiliate&utm_medium=sr&a=CQQJpdvm2ya9dU&ac=min&code=WELCOME50",
  supportUrl = "https://t.me/kaktotakxm",
  channelUrl = "https://t.me/+avD8ncMHBp4zMzhi"
}: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/home');
    }
  };

  const handleStrategiesClick = () => {
    navigate('/strategies');
  };

  const navItems = [
    {
      icon: MessageCircle,
      label: "Канал",
      onClick: () => window.open(channelUrl, '_blank'),
    },
    {
      icon: Target,
      label: "Стратегии",
      onClick: handleStrategiesClick,
      isActive: location.pathname === '/strategies',
    },
    {
      icon: Home,
      label: "Домой",
      onClick: handleHomeClick,
      isMain: true,
      isActive: location.pathname === '/home',
    },
    {
      icon: ExternalLink,
      label: "Торгуем здесь",
      onClick: () => window.open(platformUrl, '_blank'),
    },
    {
      icon: HeadphonesIcon,
      label: "Поддержка",
      onClick: () => window.open(supportUrl, '_blank'),
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Gradient fade effect */}
      <div className="absolute inset-x-0 -top-4 h-4 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      
      {/* Main nav container */}
      <div className="relative bg-background/60 backdrop-blur-2xl border-t border-border/30">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-lg mx-auto px-2 py-1.5 safe-area-pb">
          <div className="flex items-end justify-around">
            {navItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={item.onClick}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl touch-feedback min-h-[44px] min-w-[44px]",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50",
                  item.isMain ? "px-3" : ""
                )}
                variants={item.isMain ? mainButtonVariants : navItemVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {item.isMain ? (
                  <>
                    {/* Main button with enhanced glow */}
                    <motion.div 
                      className="relative -mt-4 mb-0.5"
                      layoutId="main-nav-button"
                    >
                      {/* Outer glow ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-primary/30 blur-lg"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5] 
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                      />
                      
                      {/* Main button */}
                      <motion.div 
                        className={cn(
                          "relative w-7 h-7 rounded-full flex items-center justify-center",
                          "bg-gradient-to-br from-primary via-primary to-secondary",
                          "shadow-[0_0_15px_-3px_hsl(142,76%,52%,0.6)]"
                        )}
                        variants={iconVariants}
                      >
                        {/* Inner shine */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />
                        
                        <item.icon className="w-3.5 h-3.5 text-primary-foreground relative z-10" strokeWidth={2.5} />
                      </motion.div>
                    </motion.div>
                    
                    <motion.span 
                      className="text-[9px] font-semibold text-primary tracking-wide"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {item.label}
                    </motion.span>
                  </>
                ) : (
                  <>
                    <motion.div 
                      className={cn(
                        "w-5 h-5 rounded-lg flex items-center justify-center backdrop-blur-sm border",
                        item.isActive
                          ? "bg-primary/20 border-primary/30"
                          : "bg-muted/30 border-border/30"
                      )}
                      variants={iconVariants}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <item.icon 
                        className={cn(
                          "w-2.5 h-2.5",
                          item.isActive ? "text-primary" : "text-muted-foreground"
                        )} 
                        strokeWidth={2} 
                      />
                    </motion.div>
                    
                    <motion.span 
                      className={cn(
                        "text-[8px] font-medium tracking-wide",
                        item.isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1, color: item.isActive ? undefined : "hsl(142, 76%, 52%)" }}
                    >
                      {item.label}
                    </motion.span>
                  </>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
