import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Bot, Code, LineChart, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SoftwareModal } from '@/components/SoftwareModal';
import { TerminalRow, type RowTone } from '@/components/trader-menu/TerminalRow';
import { BADGE_LABEL, softwareItems, type SoftwareItem } from '@/data/software';

/** Значок и тон под каждый продукт: четыре одинаковых значка сливаются. */
const ICONS: Record<string, JSX.Element> = {
  'market-assistant': <Bot className="w-[18px] h-[18px]" />,
  'nmnh-trade': <LineChart className="w-[18px] h-[18px]" />,
  'black-mirror': <Signal className="w-[18px] h-[18px]" />,
  'forex-signals': <Code className="w-[18px] h-[18px]" />,
};

const TONES: Record<string, RowTone> = {
  'market-assistant': 'green',
  'nmnh-trade': 'cyan',
  'black-mirror': 'amber',
  'forex-signals': 'violet',
};

const PANEL_STYLE = {
  background: 'linear-gradient(180deg, hsl(142 20% 10%) 0%, hsl(140 27% 6.5%) 100%)',
  boxShadow: '0 12px 32px -22px hsl(0 0% 0%), inset 0 1px 0 hsl(142 42% 38% / 0.12)',
} as const;

const PANEL_CLASS =
  'rounded-[18px] border border-[hsl(142_26%_15%)] overflow-hidden divide-y divide-[hsl(142_22%_13%)]';

const Software = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SoftwareItem | null>(null);

  const handleHomeClick = () => navigate('/home');

  return (
    <div className="min-h-[100dvh] scanline pb-16">
      <MatrixRain />
      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm pb-2 px-4">
          <div className="relative flex items-center justify-center py-2 sm:py-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm
                           focus:outline-none focus-visible:outline-none focus-visible:ring-0"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">На главную</span>
              </Button>
            </div>
            <h1 className="font-display font-bold text-lg tracking-tight">Наш софт</h1>
            <div className="absolute right-4 -top-3">
              <SimpleMenu />
            </div>
          </div>
        </div>

        <main className="px-4 pb-8 flex justify-center">
          <div className="max-w-lg w-full mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-2 px-1"
              style={{ color: 'hsl(142 16% 48%)' }}
            >
              {softwareItems.length} инструмента
            </p>

            {/* Список, а не четыре простыни подряд: подробности по каждому
                продукту приходят в окне по нажатию */}
            <div className={PANEL_CLASS} style={PANEL_STYLE}>
              {softwareItems.map((item, index) => (
                <TerminalRow
                  key={item.id}
                  index={index}
                  icon={ICONS[item.id] ?? <Code className="w-[18px] h-[18px]" />}
                  tone={TONES[item.id] ?? 'violet'}
                  title={item.name}
                  caption={item.kind}
                  badge={{
                    text: BADGE_LABEL[item.badge],
                    tone: item.badge === 'free' ? 'green' : item.badge === 'pro' ? 'amber' : 'sky',
                  }}
                  onClick={() => setSelected(item)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      <SoftwareModal item={selected} onClose={() => setSelected(null)} />
      <BottomNav onHomeClick={handleHomeClick} />
    </div>
  );
};

export default Software;
