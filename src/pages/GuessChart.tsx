
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Clock, ArrowRight, ArrowLeft, RefreshCw, Trophy, Play } from 'lucide-react';
import { MatrixRain } from '@/components/MatrixRain';
import { SimpleMenu } from '@/components/SimpleMenu';
import { useProgress } from '@/hooks/useProgress';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { chartScenarios, ChartScenario, ChartDataPoint } from '@/data/chartGameData';
import { toast } from "@/components/ui/sonner";
import { CandlestickChart } from '@/components/lesson-visuals/CandlestickChart';
import type { CandlestickData } from '@/components/lesson-visuals/types';

// Хук для определения размера экрана
function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768,
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

const GAME_DURATION = 10;

// Кэш для предгенерированных данных свечей для всех сценариев
const scenarioCandlesCache = new Map<number, CandlestickData[]>();

// Простой seed-based генератор для детерминированных случайных чисел
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Функция преобразования ChartDataPoint[] в CandlestickData[] с детерминированной генерацией
function convertToCandlestickData(dataPoints: ChartDataPoint[]): CandlestickData[] {
    if (dataPoints.length === 0) return [];

    const candles: CandlestickData[] = [];

    // Используем хэш от всех точек данных как seed для детерминированности
    // Это гарантирует, что одни и те же данные всегда дают одинаковый результат
    const dataHash = dataPoints.reduce((acc, point, idx) => {
        return acc + point.time.charCodeAt(0) * (idx + 1) + point.value * 1000;
    }, 0);
    const seed = Math.abs(dataHash) % 1000000;
    let seedValue = seed;

    for (let i = 0; i < dataPoints.length; i++) {
        const point = dataPoints[i];
        const value = point.value;

        // open берём из close предыдущей свечи, или из текущего value для первой свечи
        const open = i === 0 ? value : candles[i - 1].close;

        // close - это текущее value
        const close = value;

        // Вычисляем диапазон движения для тени
        const priceRange = Math.abs(close - open);
        const avgRange = dataPoints.length > 1
            ? Math.abs(dataPoints[1].value - dataPoints[0].value)
            : priceRange;

        // Генерируем детерминированные тени на основе seed
        const shadowMultiplier = Math.max(0.3, Math.min(1.5, avgRange / (Math.abs(close - open) || 0.001)));
        seedValue = seedValue * 9301 + 49297;
        const upperShadow = seededRandom(seedValue + i) * avgRange * shadowMultiplier * 0.5;
        seedValue = seedValue * 9301 + 49297;
        const lowerShadow = seededRandom(seedValue + i * 2) * avgRange * shadowMultiplier * 0.5;

        const high = Math.max(open, close) + upperShadow;
        const low = Math.min(open, close) - lowerShadow;

        // Детерминированный объём
        const bodySize = Math.abs(close - open);
        const volumeMultiplier = 1 + (bodySize / (avgRange || 1)) * 2;
        seedValue = seedValue * 9301 + 49297;
        const volume = Math.floor((seededRandom(seedValue + i * 3) * 500 + 300) * volumeMultiplier);

        candles.push({
            time: point.time,
            open,
            high,
            low,
            close,
            volume,
        });
    }

    return candles;
}

// Функция получения данных свечей для сценария (с кэшированием)
function getCandlestickDataForScenario(scenarioId: number, dataPoints: ChartDataPoint[]): CandlestickData[] {
    // Проверяем кэш
    if (scenarioCandlesCache.has(scenarioId)) {
        return scenarioCandlesCache.get(scenarioId)!;
    }

    // Генерируем данные один раз и сохраняем в кэш
    const candles = convertToCandlestickData(dataPoints);
    scenarioCandlesCache.set(scenarioId, candles);

    return candles;
}

const GuessChart = () => {
    const navigate = useNavigate();
    const { getProgress } = useProgress();
    const progress = getProgress();
    const { width } = useWindowSize();

    useSwipeBack({
        onSwipeBack: () => navigate('/home'),
        enabled: true
    });

    // Адаптивная высота графика в зависимости от размера экрана
    const chartHeight = useMemo(() => {
        if (width < 640) return 250; // мобильные
        if (width < 768) return 300; // планшеты
        return 400; // десктоп
    }, [width]);

    const [currentScenario, setCurrentScenario] = useState<ChartScenario | null>(null);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameState, setGameState] = useState<'NOT_STARTED' | 'PLAYING' | 'RESULT'>('NOT_STARTED');
    const [result, setResult] = useState<'CORRECT' | 'WRONG' | 'TIMEOUT' | null>(null);
    const [showingFullChart, setShowingFullChart] = useState(false);
    const [animatedCandlesCount, setAnimatedCandlesCount] = useState(0);
    const [isFirstRound, setIsFirstRound] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initialCandlesRef = useRef<CandlestickData[]>([]);
    const fullCandlesRef = useRef<CandlestickData[]>([]);
    const splitIndexRef = useRef<number>(0);

    const startNewRound = useCallback(() => {
        if (chartScenarios.length === 0) {
            console.error('chartScenarios is empty!');
            return;
        }
        const randomIndex = Math.floor(Math.random() * chartScenarios.length);
        setCurrentScenario(chartScenarios[randomIndex]);
        setTimeLeft(GAME_DURATION);
        // Если это не первый раунд, сразу начинаем игру, иначе показываем кнопку Старт
        setGameState(isFirstRound ? 'NOT_STARTED' : 'PLAYING');
        setIsFirstRound(false);
        setResult(null);
        setShowingFullChart(false);
        setAnimatedCandlesCount(0);
        // Очищаем все таймеры
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current);
            animationTimerRef.current = null;
        }
        if (delayTimeoutRef.current) {
            clearTimeout(delayTimeoutRef.current);
            delayTimeoutRef.current = null;
        }
        initialCandlesRef.current = [];
        fullCandlesRef.current = [];
        splitIndexRef.current = 0;
    }, [isFirstRound]);

    const handleStart = useCallback(() => {
        setGameState('PLAYING');
    }, []);

    const handleTimeout = useCallback(() => {
        setGameState('RESULT');
        setResult('TIMEOUT');
        setShowingFullChart(true);
        toast.error("Время вышло! Попробуйте еще раз.");
    }, []);

    // Initialization - только выбираем сценарий, не стартуем игру
    useEffect(() => {
        if (!currentScenario) {
            startNewRound();
        }
    }, [startNewRound, currentScenario]);

    // Timer Logic - используем useRef для хранения timer ID, чтобы можно было остановить при ответе
    useEffect(() => {
        // Очищаем предыдущий таймер при изменении состояния
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (gameState !== 'PLAYING' || !currentScenario) {
            return;
        }

        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    handleTimeout();
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [timeLeft, gameState, currentScenario, handleTimeout]);

    const handleGuess = (direction: 'UP' | 'DOWN') => {
        if (gameState !== 'PLAYING' || !currentScenario) return;

        // Останавливаем все таймеры при ответе
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (delayTimeoutRef.current) {
            clearTimeout(delayTimeoutRef.current);
            delayTimeoutRef.current = null;
        }

        setGameState('RESULT');
        setShowingFullChart(true);

        // Устанавливаем начальное значение для анимации (точно совпадает с начальными свечами)
        const initialCount = splitIndexRef.current + 1;
        setAnimatedCandlesCount(initialCount);

        // Запускаем анимацию дорисовки
        const remainingCandles = currentScenario.data.length - initialCount;
        let currentAnimated = initialCount;

        if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current);
            animationTimerRef.current = null;
        }
        if (delayTimeoutRef.current) {
            clearTimeout(delayTimeoutRef.current);
        }

        // Небольшая задержка перед началом анимации, чтобы начальные свечи отобразились стабильно
        delayTimeoutRef.current = setTimeout(() => {
            animationTimerRef.current = setInterval(() => {
                currentAnimated++;
                setAnimatedCandlesCount(currentAnimated);

                if (currentAnimated >= currentScenario.data.length) {
                    if (animationTimerRef.current) {
                        clearInterval(animationTimerRef.current);
                        animationTimerRef.current = null;
                    }
                }
            }, 150); // Добавляем свечу каждые 150мс
        }, 50);

        if (direction === currentScenario.correctAnswer) {
            setResult('CORRECT');
            toast.success("Правильно! Отличная интуиция!");
        } else {
            setResult('WRONG');
            toast.error("Неверно. Смотри объяснение.");
        }
    };

    // Сохраняем полные данные свечей в ref при загрузке сценария (один раз, используем кэш)
    useEffect(() => {
        if (currentScenario) {
            // Получаем данные из кэша (генерируются один раз при первом обращении)
            const fullData = getCandlestickDataForScenario(currentScenario.id, currentScenario.data);
            fullCandlesRef.current = fullData;
            // Сохраняем ссылки на те же объекты, а не создаем новые
            initialCandlesRef.current = fullData.slice(0, currentScenario.splitIndex + 1);
            splitIndexRef.current = currentScenario.splitIndex;
        }
    }, [currentScenario]);

    // Преобразуем данные в формат японских свечей с анимацией
    // Используем useMemo с правильными зависимостями, чтобы избежать пересчета
    const candlestickData = useMemo(() => {
        if (!currentScenario || fullCandlesRef.current.length === 0) {
            return [];
        }

        // До ответа - показываем только начальные свечи (стабильная ссылка на массив)
        if (!showingFullChart) {
            return initialCandlesRef.current;
        }

        // После ответа - показываем полный график, но используем стабильные начальные свечи
        if (animatedCandlesCount > splitIndexRef.current) {
            // Анимация идет: используем начальные свечи (те же объекты) + новые анимируемые
            const newCandles = fullCandlesRef.current.slice(splitIndexRef.current + 1, animatedCandlesCount);
            return [...initialCandlesRef.current, ...newCandles];
        }

        // Если анимация еще не началась, показываем только начальные свечи (не полный график сразу)
        return initialCandlesRef.current;
    }, [currentScenario, showingFullChart, animatedCandlesCount]);

    // Очистка анимации при размонтировании
    useEffect(() => {
        return () => {
            if (animationTimerRef.current) {
                clearInterval(animationTimerRef.current);
            }
            if (delayTimeoutRef.current) {
                clearTimeout(delayTimeoutRef.current);
                delayTimeoutRef.current = null;
            }
        };
    }, []);

    if (!currentScenario) {
        return null;
    }

    return (
        <div className={`min-h-[100dvh] scanline ${gameState === 'PLAYING' ? 'pb-20 md:pb-16' : 'pb-16 md:pb-16'} bg-background flex flex-col`}>
            <MatrixRain />
            <div className="relative z-10 flex-1 flex flex-col">
                <SimpleMenu />
                {/* Top Bar - фиксирован сверху */}
                <div className="flex-shrink-0 px-4 md:px-5 pt-4 md:pt-5">
                    <div className="container max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-2">
                            <Button variant="ghost" size="sm" className="text-xs md:text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-0" onClick={() => navigate('/home')}>
                                <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">На главную</span>
                            </Button>
                            {gameState === 'PLAYING' && (
                                <div className="flex items-center gap-1 md:gap-2 font-mono text-lg md:text-xl">
                                    <Clock className={`h-4 w-4 md:h-5 md:w-5 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                                    <span className={timeLeft <= 3 ? 'text-red-500' : 'text-foreground'}>
                                        {timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-center mb-2 md:mb-4">
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold font-display neon-text mb-1 md:mb-2">
                                Куда пойдёт график
                            </h1>
                            <p className="text-muted-foreground text-xs md:text-sm lg:text-base px-2">
                                Тренируй насмотренность и анализируй куда пойдёт цена
                            </p>
                        </div>
                    </div>
                </div>

                {/* Центральный контент - график по центру экрана */}
                <main className="flex-1 flex items-center justify-center px-4 md:px-5">
                    <div className="container max-w-4xl mx-auto w-full">
                        <div className="flex flex-col items-center gap-3 md:gap-6">
                            {/* Chart Area - центрирован */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="w-full max-w-2xl"
                            >
                                <Card className="w-full p-3 md:p-6 glass-card neon-border relative overflow-hidden">
                                    <div className="mb-2 md:mb-4 flex justify-between items-center">
                                        <h2 className="text-base md:text-xl font-bold font-display">Куда пойдет цена?</h2>
                                        {gameState === 'RESULT' && (
                                            <span className="text-muted-foreground text-xs md:text-sm font-mono">
                                                {currentScenario.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="h-[35vh] sm:h-[40vh] md:h-[400px] max-h-[400px] w-full flex items-center justify-center">
                                        <div className="w-full h-full">
                                            <CandlestickChart
                                                data={candlestickData}
                                                height={chartHeight}
                                                interactive={false}
                                                showLevels={false}
                                                showVolume={false}
                                                showPatterns={false}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Controls & Result Area - центрированы */}
                            <div className="w-full max-w-2xl space-y-3 md:space-y-4">
                                <AnimatePresence mode="wait">
                                    {gameState === 'NOT_STARTED' ? (
                                        <motion.div
                                            key="not-started"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="space-y-3 md:space-y-4"
                                        >
                                            <Card className="p-4 md:p-6 glass-card neon-border">
                                                <div className="text-center mb-3 md:mb-4">
                                                    <h3 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                                                        Готовы начать?
                                                    </h3>
                                                    <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                                                        Изучите график японских свечей и угадайте направление цены
                                                    </p>
                                                </div>
                                                <Button
                                                    className="w-full h-16 md:h-24 text-lg md:text-xl font-bold bg-primary/20 hover:bg-primary/30 text-primary border-primary/50"
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={handleStart}
                                                >
                                                    <Play className="mr-2 h-6 w-6 md:h-8 md:w-8" /> Старт
                                                </Button>
                                            </Card>
                                        </motion.div>
                                    ) : gameState === 'PLAYING' ? (
                                        <motion.div
                                            key="playing"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-3 md:space-y-4"
                                        >
                                            <Button
                                                className="w-full h-16 md:h-20 lg:h-24 text-lg md:text-xl font-bold bg-green-500/10 hover:bg-green-500/20 active:bg-green-500/30 text-green-500 border-green-500/50 touch-manipulation hidden md:flex"
                                                variant="outline"
                                                onClick={() => handleGuess('UP')}
                                            >
                                                <ArrowUpCircle className="mr-2 h-6 w-6 md:h-8 md:w-8" /> UP
                                            </Button>
                                            <Button
                                                className="w-full h-16 md:h-20 lg:h-24 text-lg md:text-xl font-bold bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-500 border-red-500/50 touch-manipulation hidden md:flex"
                                                variant="outline"
                                                onClick={() => handleGuess('DOWN')}
                                            >
                                                <ArrowDownCircle className="mr-2 h-6 w-6 md:h-8 md:w-8" /> DOWN
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="space-y-3 md:space-y-4"
                                        >
                                            <Card className={`p-4 md:p-6 border-2 ${result === 'CORRECT' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                                                <div className="text-center mb-3 md:mb-4">
                                                    {result === 'CORRECT' && <Trophy className="h-8 w-8 md:h-12 md:w-12 text-green-500 mx-auto mb-2" />}
                                                    <h3 className={`text-lg md:text-2xl font-bold ${result === 'CORRECT' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {result === 'CORRECT' ? 'Правильно!' : result === 'TIMEOUT' ? 'Время вышло' : 'Ошибка'}
                                                    </h3>
                                                </div>

                                                <div className="text-xs md:text-sm rounded-lg bg-background/50 p-2 md:p-3 mb-3 md:mb-4">
                                                    <p className="font-semibold mb-1">Анализ:</p>
                                                    <p className="text-muted-foreground">{currentScenario.explanation}</p>
                                                </div>

                                                <Button className="w-full" size="lg" onClick={startNewRound}>
                                                    <RefreshCw className="mr-2 h-4 w-4" /> Следующий график
                                                </Button>
                                            </Card>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    className="glass-card p-3 md:p-4 rounded-xl text-xs text-muted-foreground"
                                >
                                    <p>Подсказка: Анализируйте тренд и свечные паттерны. У вас всего {GAME_DURATION} секунд на решение!</p>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Fixed Mobile Buttons - только на мобильных устройствах во время игры */}
            {gameState === 'PLAYING' && (
                <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                    <div className="container max-w-4xl mx-auto grid grid-cols-2 gap-3">
                        <Button
                            className="w-full h-16 text-lg font-bold bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-500 border-2 border-green-500/50 touch-manipulation transition-all duration-150"
                            variant="outline"
                            onClick={() => handleGuess('UP')}
                        >
                            <ArrowUpCircle className="mr-2 h-7 w-7" /> UP
                        </Button>
                        <Button
                            className="w-full h-16 text-lg font-bold bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-500 border-2 border-red-500/50 touch-manipulation transition-all duration-150"
                            variant="outline"
                            onClick={() => handleGuess('DOWN')}
                        >
                            <ArrowDownCircle className="mr-2 h-7 w-7" /> DOWN
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuessChart;
