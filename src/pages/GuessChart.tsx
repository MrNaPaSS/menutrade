import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUpCircle, ArrowDownCircle, Clock, ArrowLeft, RefreshCw, Trophy, Play, XCircle, TimerOff } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';
import { TradingChart } from '@/components/TradingChart';
import { generatePattern, type GeneratedPattern, type ChartPoint } from '@/data/patternGenerator';
import { useUserAccess } from '@/contexts/UserAccessContext';
import { useTelegram } from '@/hooks/useTelegram';
import { useDailyAttempts } from '@/hooks/useDailyAttempts';
import { reportPaywallHit } from '@/lib/paywall';
import { RegistrationGate } from '@/components/RegistrationGate';
import { Lock } from 'lucide-react';

const GAME_DURATION = 15;
// Без депозита - три графика в сутки: попробовать хватает, привыкнуть нет
const FREE_ROUNDS_PER_DAY = 3;
const REVEAL_STEP_MS = 130;

type GameState = 'NOT_STARTED' | 'PLAYING' | 'RESULT';
type Result = 'CORRECT' | 'WRONG' | 'TIMEOUT';

const GuessChart = () => {
  const navigate = useNavigate();


  const { hasFullAccess } = useUserAccess();
  const { userId } = useTelegram();
  const attempts = useDailyAttempts(userId, 'guess_chart', FREE_ROUNDS_PER_DAY);
  const [showGate, setShowGate] = useState(false);

  const [pattern, setPattern] = useState<GeneratedPattern | null>(null);
  const [gameState, setGameState] = useState<GameState>('NOT_STARTED');
  const [result, setResult] = useState<Result | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [revealCount, setRevealCount] = useState(0);
  const isFirstRound = useRef(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
  }, []);

  const startNewRound = useCallback(() => {
    clearTimers();
    const p = generatePattern();
    setPattern(p);
    setRevealCount(p.splitIndex + 1);
    setResult(null);
    setTimeLeft(GAME_DURATION);
    setGameState(isFirstRound.current ? 'NOT_STARTED' : 'PLAYING');
    isFirstRound.current = false;
  }, [clearTimers]);

  useEffect(() => {
    if (!pattern) startNewRound();
  }, [pattern, startNewRound]);

  // Один сигнал боту на исчерпанный лимит - он ведёт цепочку дожима
  useEffect(() => {
    if (!hasFullAccess && attempts.exhausted) {
      reportPaywallHit(userId, 'тренажёр графиков');
    }
  }, [hasFullAccess, attempts.exhausted, userId]);

  // Дорисовка скрытой части графика после ответа
  const startReveal = useCallback((p: GeneratedPattern) => {
    if (animRef.current) clearInterval(animRef.current);
    const total = p.candles.length;
    animRef.current = setInterval(() => {
      setRevealCount((prev) => {
        if (prev >= total) {
          if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
          return total;
        }
        return prev + 1;
      });
    }, REVEAL_STEP_MS);
  }, []);

  const handleStart = useCallback(() => setGameState('PLAYING'), []);

  const finishRound = useCallback((res: Result) => {
    if (!pattern) return;
    clearTimers();
    setResult(res);
    setGameState('RESULT');
    startReveal(pattern);
    // Считаем только доигранные раунды: брошенный на середине не тратит попытку
    if (!hasFullAccess) attempts.spend();
  }, [pattern, clearTimers, startReveal, hasFullAccess, attempts]);

  const handleGuess = (dir: 'UP' | 'DOWN') => {
    if (gameState !== 'PLAYING' || !pattern) return;
    const ok = dir === pattern.direction;
    finishRound(ok ? 'CORRECT' : 'WRONG');
  };

  const handleTimeout = useCallback(() => {
    finishRound('TIMEOUT');
  }, [finishRound]);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [gameState, timeLeft, handleTimeout]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Данные для графика: реальные свечи + whitespace для скрытой части (фиксирует ось X)
  const display = useMemo<ChartPoint[]>(() => {
    if (!pattern) return [];
    const real: ChartPoint[] = pattern.candles.slice(0, revealCount);
    const hidden: ChartPoint[] = pattern.candles.slice(revealCount).map((c) => ({ time: c.time }));
    return [...real, ...hidden];
  }, [pattern, revealCount]);

  if (showGate) {
    return <RegistrationGate onBack={() => setShowGate(false)} />;
  }

  if (!pattern) return null;

  const isPlaying = gameState === 'PLAYING';
  const limitReached = !hasFullAccess && attempts.exhausted;

  return (
    <div className="min-h-[100dvh] bg-background relative">
      <MatrixRain />
      <div className="relative z-10 w-full max-w-3xl mx-auto px-3 sm:px-5 pb-6 pt-[calc(env(safe-area-inset-top)+var(--tg-content-top,0.75rem))]">
        {/* Шапка */}
        <div className="flex items-center justify-between pb-1">
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm -ml-2" onClick={() => navigate('/home')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> На главную
          </Button>
          {isPlaying && (
            <div className={`flex items-center gap-1.5 font-mono text-lg sm:text-xl ${timeLeft <= 3 ? 'text-red-400' : 'text-primary'}`}>
              <Clock className={`h-5 w-5 ${timeLeft <= 3 ? 'animate-pulse' : ''}`} />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        <div className="text-center pb-2 sm:pb-3">
          <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground neon-text-subtle">Куда пойдёт график</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Тренируй насмотренность: определи направление цены</p>
          {!hasFullAccess && (
            <p className="text-[11px] text-muted-foreground/80 mt-1 font-mono">
              Осталось графиков сегодня: <span className="text-primary">{attempts.left}</span> из {FREE_ROUNDS_PER_DAY}
            </p>
          )}
        </div>

        {/* График - конкретная высота (vh), canvas синхронизируется ResizeObserver-ом */}
        <div className="glass-card neon-border rounded-2xl p-2 sm:p-3 flex flex-col">
          <div className="flex items-center justify-between px-1.5 pb-1.5">
            <span className="text-xs sm:text-sm font-mono text-muted-foreground">EUR/USD · 5m</span>
            {gameState === 'RESULT' && (
              <span className="text-xs sm:text-sm font-display font-bold text-primary">{pattern.name}</span>
            )}
          </div>
          <div className="h-[46vh] min-h-[300px] sm:h-[50vh] md:h-[460px] w-full overflow-hidden rounded-lg">
            <TradingChart data={display} />
          </div>
        </div>

        {/* Управление / результат */}
        <div className="pt-3">
          <AnimatePresence mode="wait">
            {limitReached ? (
              <motion.div key="limit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <LimitCard onOpenGate={() => setShowGate(true)} />
              </motion.div>
            ) : gameState === 'NOT_STARTED' ? (
              <motion.div key="start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <Button
                  className="w-full h-16 sm:h-18 text-lg font-display font-bold neon-glow"
                  onClick={handleStart}
                >
                  <Play className="mr-2 h-6 w-6" /> Старт
                </Button>
                <p className="text-center text-[11px] text-muted-foreground mt-2">
                  {GAME_DURATION} секунд на решение. Анализируй тренд и свечные паттерны.
                </p>
              </motion.div>
            ) : gameState === 'PLAYING' ? (
              <motion.div key="play" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess('UP')}
                  className="h-16 sm:h-18 rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 active:bg-emerald-500/25 transition-colors touch-manipulation"
                >
                  <ArrowUpCircle className="h-7 w-7" /> ВВЕРХ
                </button>
                <button
                  onClick={() => handleGuess('DOWN')}
                  className="h-16 sm:h-18 rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border border-red-500/40 active:bg-red-500/25 transition-colors touch-manipulation"
                >
                  <ArrowDownCircle className="h-7 w-7" /> ВНИЗ
                </button>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <ResultCard result={result} pattern={pattern} />

                {limitReached ? (
                  <LimitCard onOpenGate={() => setShowGate(true)} />
                ) : (
                  <Button className="w-full h-14 font-display font-bold" onClick={startNewRound}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Следующий график
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

function LimitCard({ onOpenGate }: { onOpenGate: () => void }) {
  return (
    <div className="glass-card neon-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-bold text-sm mb-1">
            Бесплатные графики на сегодня закончились
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Полный доступ снимает лимит: тренажёр без ограничений,
            48 уроков, стратегии и закрытый форум.
          </p>
        </div>
      </div>
      <Button className="w-full h-12 font-display font-bold" onClick={onOpenGate}>
        Открыть полный доступ
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        Или возвращайся завтра - счётчик обнулится
      </p>
    </div>
  );
}

interface ResultCardProps {
  result: Result | null;
  pattern: GeneratedPattern;
}

function ResultCard({ result, pattern }: ResultCardProps) {
  const ok = result === 'CORRECT';
  const tone = ok
    ? 'border-emerald-500/50 bg-emerald-500/10'
    : result === 'TIMEOUT'
      ? 'border-yellow-500/50 bg-yellow-500/10'
      : 'border-red-500/50 bg-red-500/10';

  const Icon = ok ? Trophy : result === 'TIMEOUT' ? TimerOff : XCircle;
  const iconColor = ok ? 'text-emerald-400' : result === 'TIMEOUT' ? 'text-yellow-400' : 'text-red-400';
  const title = ok ? 'Верно!' : result === 'TIMEOUT' ? 'Время вышло' : 'Мимо';
  const dirLabel = pattern.direction === 'UP' ? 'вверх ▲' : 'вниз ▼';

  return (
    <div className={`rounded-xl border p-3.5 ${tone}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <Icon className={`h-7 w-7 ${iconColor}`} />
        <div>
          <div className={`font-display font-bold text-lg ${iconColor}`}>{title}</div>
          <div className="text-xs text-muted-foreground">
            {pattern.name} · цена пошла <span className="text-foreground font-semibold">{dirLabel}</span>
          </div>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pattern.explanation}</p>
    </div>
  );
}

export default GuessChart;
