import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/types/lesson';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  passingThreshold?: number; // Порог прохождения в процентах (по умолчанию 70%)
}

export function Quiz({ questions, onComplete, passingThreshold = 70 }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const question = questions[currentQuestion];
  const passingScore = Math.ceil(questions.length * (passingThreshold / 100));

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === question.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFinish = () => {
    if (correctAnswers >= passingScore) {
      onComplete();
    } else {
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectAnswers(0);
      setIsCompleted(false);
    }
  };

  if (isCompleted) {
    const passed = correctAnswers >= passingScore;
    return (
      <motion.div className="text-center py-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div 
          className={cn("w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-2",
            passed ? "bg-primary/15 border-primary/50" : "bg-destructive/15 border-destructive/50"
          )}
          animate={passed ? { scale: [1, 1.1, 1] } : {}}
        >
          {passed ? <Trophy className="w-12 h-12 text-primary" /> : <XCircle className="w-12 h-12 text-destructive" />}
        </motion.div>
        <h3 className="font-display text-2xl font-bold mb-2">
          {passed ? <span className="flex items-center justify-center gap-2"><Sparkles className="w-6 h-6 text-accent" />Отлично!<Sparkles className="w-6 h-6 text-accent" /></span> : "Попробуй снова"}
        </h3>
        <p className="text-muted-foreground mb-2">Правильных: <span className="text-primary font-bold">{correctAnswers}</span> из {questions.length}</p>
        <p className="text-sm text-muted-foreground mb-2">
          {passed ? `✅ Пройдено! (${Math.round((correctAnswers / questions.length) * 100)}%)` : `Нужно минимум ${passingThreshold}% (${passingScore} правильных из ${questions.length})`}
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          {passed ? "🐸 Поздравляем!" : `Попробуй еще раз!`}
        </p>
        <Button onClick={handleFinish} size="lg" className={cn("btn-premium", passed ? "bg-primary" : "bg-destructive")}>
          {passed ? "Продолжить" : "Заново"}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-muted-foreground">Вопрос <span className="text-primary font-bold">{currentQuestion + 1}</span> из {questions.length}</span>
        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">✓ {correctAnswers}</span>
      </div>
      <div className="h-1.5 bg-muted/50 rounded-full mb-8 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}>
          <h3 className="font-display text-lg font-semibold mb-6">{question.question}</h3>
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-4 rounded-xl text-left border-2 font-medium text-sm",
                  isAnswered
                    ? index === question.correctAnswer ? "border-primary bg-primary/15"
                      : index === selectedAnswer ? "border-destructive bg-destructive/15"
                      : "border-border/30 bg-muted/20 text-muted-foreground"
                    : "border-border/50 hover:border-primary/50"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!isAnswered ? { scale: 1.02, x: 8 } : undefined}
                whileTap={!isAnswered ? { scale: 0.98 } : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border",
                    isAnswered && index === question.correctAnswer ? "bg-primary text-primary-foreground"
                      : isAnswered && index === selectedAnswer ? "bg-destructive text-destructive-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  )}>
                    {isAnswered ? (index === question.correctAnswer ? <CheckCircle className="w-5 h-5" /> : index === selectedAnswer ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + index)) : String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
          {isAnswered && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Button onClick={handleNext} size="lg" className="w-full bg-primary btn-premium">
                {currentQuestion < questions.length - 1 ? "Следующий вопрос" : "Завершить"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
