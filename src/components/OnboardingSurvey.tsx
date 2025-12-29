import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface UserSurveyData {
  age: string;
  tradingExperience: string;
  timeAvailable: string;
  goals: string;
  completed: boolean;
  completedAt: string;
}

const STORAGE_KEY = 'user-survey-data';

export function getSurveyData(): UserSurveyData | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveSurveyData(data: Omit<UserSurveyData, 'completed' | 'completedAt'>): void {
  const surveyData: UserSurveyData = {
    ...data,
    completed: true,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(surveyData));
}

interface OnboardingSurveyProps {
  onComplete: () => void;
}

export function OnboardingSurvey({ onComplete }: OnboardingSurveyProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    tradingExperience: '',
    timeAvailable: '',
    goals: ''
  });

  const steps = [
    {
      title: 'Добро пожаловать!',
      content: (
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-4"
          >
            <Brain className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-display font-bold mb-2">
            <span className="neon-text-subtle">NO MONEY</span>
            <span className="text-foreground mx-2">-</span>
            <span className="neon-text-subtle">NO HONEY</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Академия здравого трейдера
          </p>
          <div className="text-left space-y-3 bg-card/50 p-4 rounded-lg border border-border/30">
            <p className="text-sm">
              Добро пожаловать в нашу академию! Мы поможем вам стать успешным трейдером.
            </p>
            <p className="text-sm text-muted-foreground">
              Перед началом обучения ответьте на несколько вопросов, чтобы мы могли подобрать для вас оптимальную программу.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Сколько вам лет?',
      content: (
        <div className="space-y-4">
          <Label htmlFor="age">Ваш возраст</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            placeholder="Введите ваш возраст"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="text-lg"
          />
        </div>
      )
    },
    {
      title: 'Опыт в трейдинге',
      content: (
        <div className="space-y-4">
          <Label>Какой у вас опыт в трейдинге?</Label>
          <RadioGroup
            value={formData.tradingExperience}
            onValueChange={(value) => setFormData({ ...formData, tradingExperience: value })}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="beginner" id="exp-beginner" />
                <Label htmlFor="exp-beginner" className="cursor-pointer flex-1">
                  Новичок (менее 6 месяцев)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="intermediate" id="exp-intermediate" />
                <Label htmlFor="exp-intermediate" className="cursor-pointer flex-1">
                  Средний (6 месяцев - 2 года)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="advanced" id="exp-advanced" />
                <Label htmlFor="exp-advanced" className="cursor-pointer flex-1">
                  Продвинутый (более 2 лет)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )
    },
    {
      title: 'Время для обучения',
      content: (
        <div className="space-y-4">
          <Label>Сколько времени вы готовы уделять обучению?</Label>
          <Select
            value={formData.timeAvailable}
            onValueChange={(value) => {
              console.log('Выбрано значение:', value);
              setFormData({ ...formData, timeAvailable: value });
            }}
          >
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Выберите вариант" />
            </SelectTrigger>
            <SelectContent 
              className="z-[10001]" 
              style={{ zIndex: 10001 }}
              position="popper"
            >
              <SelectItem value="15min">15-30 минут в день</SelectItem>
              <SelectItem value="1hour">1-2 часа в день</SelectItem>
              <SelectItem value="2hours">2-4 часа в день</SelectItem>
              <SelectItem value="4hours">Более 4 часов в день</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      title: 'Ваши цели',
      content: (
        <div className="space-y-4">
          <Label>Какова ваша основная цель?</Label>
          <RadioGroup
            value={formData.goals}
            onValueChange={(value) => setFormData({ ...formData, goals: value })}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="income" id="goal-income" />
                <Label htmlFor="goal-income" className="cursor-pointer flex-1">
                  Дополнительный доход
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="main-income" id="goal-main" />
                <Label htmlFor="goal-main" className="cursor-pointer flex-1">
                  Основной источник дохода
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="hobby" id="goal-hobby" />
                <Label htmlFor="goal-hobby" className="cursor-pointer flex-1">
                  Хобби и интерес
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="knowledge" id="goal-knowledge" />
                <Label htmlFor="goal-knowledge" className="cursor-pointer flex-1">
                  Получить знания
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return formData.age !== '' && parseInt(formData.age) >= 18;
    if (step === 2) return formData.tradingExperience !== '';
    if (step === 3) return formData.timeAvailable !== '';
    if (step === 4) return formData.goals !== '';
    return false;
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Сохраняем данные и завершаем опрос
      saveSurveyData(formData);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4" style={{ isolation: 'isolate' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card border border-border/30 rounded-2xl p-6 space-y-6"
      >
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Шаг {step + 1} из {steps.length}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[300px]"
          >
            <h2 className="text-xl font-display font-bold mb-4">
              {steps[step].title}
            </h2>
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === steps.length - 1 ? 'Завершить' : 'Далее'}
            {step < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

