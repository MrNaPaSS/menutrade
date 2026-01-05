import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
        >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl glass-card border border-primary/30 flex items-center justify-center flex-shrink-0 neon-border">
                <Brain className="w-4 h-4 text-primary" />
            </div>

            {/* Typing Bubble */}
            <div className="glass-card message-assistant rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {[0, 1, 2].map((index) => (
                            <motion.div
                                key={index}
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: index * 0.15,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">Ментор печатает...</span>
                </div>
            </div>
        </motion.div>
    );
}
