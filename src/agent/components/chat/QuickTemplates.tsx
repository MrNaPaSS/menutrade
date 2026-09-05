import { motion } from 'framer-motion';
import { BookOpen, Send, Target, TrendingUp, BarChart3, Zap, HelpCircle, CheckCircle, Shield } from 'lucide-react';
import { AIMode } from '@/agent/config/prompts';
import type { MarketChoice, TradingMarket } from '@/agent/config/markets';

interface QuickTemplatesProps {
    onSelect: (text: string) => void;
    mode: AIMode;
    market: MarketChoice;
}

interface Template {
    icon: typeof BookOpen;
    text: string;
    message: string;
}

// Общие шаблоны: работают на любом рынке
const TEACHER_TEMPLATES: Template[] = [
    { icon: BookOpen, text: '🎓 Начать обучение', message: 'Начать обучение работе с Black Mirror Ultra с нуля' },
    { icon: Target, text: '📝 Продолжить урок', message: 'Продолжить обучение, дай следующее задание' },
    { icon: HelpCircle, text: '❓ Как читать сигналы?', message: 'Объясни как правильно читать сигналы BM↑ и BM↓' },
    { icon: CheckCircle, text: '✅ Проверить работу', message: 'Проверь мою работу и дай обратную связь' },
    { icon: Zap, text: '⚡ Что такое Score?', message: 'Объясни что такое BM Score и как его использовать' },
];

const ANALYST_TEMPLATES: Template[] = [
    { icon: BarChart3, text: '📊 Анализ графика', message: 'Прикрепи скриншот графика для анализа' },
    { icon: TrendingUp, text: '📈 Куда пойдёт цена?', message: 'Оцени текущую ситуацию на рынке' },
    { icon: Target, text: '🎯 Точка входа', message: 'Найди оптимальную точку входа на графике' },
    { icon: Zap, text: '⚡ Сигнал BM', message: 'Какой сейчас сигнал Black Mirror?' },
    { icon: HelpCircle, text: '🔍 Уровни', message: 'Покажи ключевые уровни поддержки и сопротивления' },
];

// Шестой шаблон свой у каждого рынка: вопрос про экспирацию бессмыслен
// на форексе, а вопрос про плечо - на бинарках
const TEACHER_BY_MARKET: Record<TradingMarket, Template> = {
    binary: { icon: TrendingUp, text: '📈 Про время экспирации', message: 'Научи выбирать правильное время экспирации' },
    forex: { icon: Shield, text: '🛡 Стоп и размер лота', message: 'Научи ставить стоп-лосс и считать объём позиции от риска' },
    crypto: { icon: Shield, text: '🛡 Плечо и ликвидация', message: 'Объясни, как выбирать плечо и где будет цена ликвидации' },
};

const ANALYST_BY_MARKET: Record<TradingMarket, Template> = {
    binary: { icon: Send, text: '💹 CALL или PUT?', message: 'Что лучше: CALL или PUT в текущей ситуации?' },
    forex: { icon: Send, text: '💹 Сделка с уровнями', message: 'Дай сделку: вход, стоп-лосс, тейк-профит и риск/прибыль' },
    crypto: { icon: Send, text: '💹 Лонг или шорт?', message: 'Лонг или шорт? Дай вход, стоп, цели и разумное плечо' },
};

export function QuickTemplates({ onSelect, mode, market }: QuickTemplatesProps) {
    const base = mode === 'teacher' ? TEACHER_TEMPLATES : ANALYST_TEMPLATES;
    const byMarket = mode === 'teacher' ? TEACHER_BY_MARKET : ANALYST_BY_MARKET;
    // Рынок не выбран - показываем бинарки: с них академия начинается,
    // а сменить рынок можно в меню режимов
    const templates = [...base, byMarket[market === 'auto' ? 'binary' : market]];

    return (
        <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-muted-foreground px-1 mb-2">
                {mode === 'teacher' ? '📚 Режим Ментора' : '📊 Режим Аналитика'} - выберите действие:
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
                            /* Сплошная подложка, а не glass-card: у того
                               backdrop-filter, и шесть таких кнопок внутри
                               окна, которое въезжает с масштабированием,
                               перерисовываются рывками - это и мерцало */
                            className="group relative overflow-hidden rounded-xl p-2.5 sm:p-3 text-left
                                       border border-[hsl(142_26%_16%)] bg-[hsl(140_26%_9%)]
                                       transition-colors duration-200
                                       hover:bg-[hsl(142_28%_12%)] hover:border-primary/30
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                                       touch-feedback"
                        >
                            <div className="relative flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center
                                                flex-shrink-0 border border-white/[0.07]"
                                    style={{ background: 'linear-gradient(160deg, hsl(142 55% 20%), hsl(142 50% 13%))' }}>
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
