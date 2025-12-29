import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, BookOpen, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickTemplate {
  id: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

const templates: QuickTemplate[] = [
  {
    id: 'strategy',
    text: 'Объясни стратегию торговли на новостях',
    icon: TrendingUp
  },
  {
    id: 'risk',
    text: 'Как правильно управлять рисками?',
    icon: Shield
  },
  {
    id: 'analysis',
    text: 'Помоги проанализировать график',
    icon: BarChart
  },
  {
    id: 'lesson',
    text: 'Объясни текущий урок подробнее',
    icon: BookOpen
  }
];

interface QuickTemplatesProps {
  onSelect: (text: string) => void;
  className?: string;
}

export function QuickTemplates({ onSelect, className }: QuickTemplatesProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {templates.map((template, index) => {
        const Icon = template.icon;
        return (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(template.text)}
              className="w-full justify-start glass-card border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all"
            >
              <Icon className="w-3 h-3" />
              <span className="text-xs">{template.text}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}

