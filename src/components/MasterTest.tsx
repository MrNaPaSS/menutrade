import { Quiz } from './Quiz';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/lesson';

interface MasterTestProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  onBack: () => void;
  passingThreshold: number;
}

export function MasterTest({ questions, onComplete, onBack, passingThreshold }: MasterTestProps) {
  return (
    <div className="min-h-screen p-4 pb-20 animate-fade-in">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад</span>
        </button>

        <motion.div 
          className="glass-card rounded-xl p-6 neon-border-intense mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center text-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              🏆
            </motion.div>
            <div>
              <h2 className="font-display font-bold text-xl neon-text-subtle">Тест: Здоровый трейдер</h2>
              <p className="text-xs text-muted-foreground">Финальная проверка знаний</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground mb-2">
              <strong>Порог прохождения:</strong> {passingThreshold}%
            </p>
            <p className="text-xs text-muted-foreground">
              Этот тест проверяет ваше понимание ключевых принципов успешного трейдинга. 
              Убедитесь, что вы готовы пройти его!
            </p>
          </div>
        </motion.div>

        <div className="glass-card rounded-xl p-6 neon-border">
          <Quiz 
            questions={questions} 
            onComplete={onComplete}
            passingThreshold={passingThreshold}
          />
        </div>
      </div>
    </div>
  );
}

