import { motion } from 'framer-motion';
import { BookOpen, Send, Target, TrendingUp, BarChart3, Zap, HelpCircle, CheckCircle } from 'lucide-react';
import { AIMode } from '@/config/prompts';

interface QuickTemplatesProps {
    onSelect: (text: string) => void;
    mode: AIMode;
}

// Шаблоны для режима МЕНТОР
const TEACHER_TEMPLATES = [
    { icon: BookOpen, text: '🎓 Начать обучение', message: 'Начать обучение работе с Black Mirror Ultra с нуля' },
    { icon: Target, text: '📝 Продолжить урок', message: 'Продолжить обучение, дай следующее задание' },
    { icon: HelpCircle, text: '❓ Как читать сигналы?', message: 'Объясни как правильно читать сигналы BM↑ и BM↓' },
    { icon: CheckCircle, text: '✅ Проверить работу', message: 'Проверь мою работу и дай обратную связь' },
    { icon: Zap, text: '⚡ Что такое Score?', message: 'Объясни что такое BM Score и как его использовать' },
    { icon: TrendingUp, text: '📈 Про время экспирации', message: 'Научи выбирать правильное время экспирации' },
];

// Шаблоны для режима АНАЛИТИК
const ANALYST_TEMPLATES = [
    { icon: BarChart3, text: '📊 Анализ графика', message: 'Прикрепи скриншот графика для анализа' },
    { icon: TrendingUp, text: '📈 Куда пойдёт цена?', message: 'Оцени текущую ситуацию на рынке' },
    { icon: Target, text: '🎯 Точка входа', message: 'Найди оптимальную точку входа на графике' },
    { icon: Zap, text: '⚡ Сигнал BM', message: 'Какой сейчас сигнал Black Mirror?' },
    { icon: Send, text: '💹 CALL или PUT?', message: 'Что лучше: CALL или PUT в текущей ситуации?' },
    { icon: HelpCircle, text: '🔍 Уровни', message: 'Покажи ключевые уровни поддержки и сопротивления' },
];

export function QuickTemplates({ onSelect, mode }: QuickTemplatesProps) {
    const templates = mode === 'teacher' ? TEACHER_TEMPLATES : ANALYST_TEMPLATES;

    return (
        <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground px-1 mb-2">
                {mode === 'teacher' ? '📚 Режим Ментора' : '📊 Режим Аналитика'} — выберите действие:
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {templates.map((template, index) => {
                    const Icon = template.icon;
                    return (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(template.message)}
                            className="group relative overflow-hidden rounded-xl p-2.5 sm:p-3 text-left transition-all duration-300 glass-card hover:bg-white/10 border border-white/10 hover:border-primary/30 touch-feedback"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-medium text-foreground/90 group-hover:text-foreground leading-tight">
                                    {template.text}
                                </span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
