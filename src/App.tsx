import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import { RouteFallback } from "./components/RouteFallback";
import { AIAgentButton } from "./components/AIAgentButton";
import { AppInitializer } from "./components/AppInitializer";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { CoinToast } from "./components/CoinToast";
import { TelegramProvider } from "./contexts/TelegramContext";
import { UserAccessProvider } from "./contexts/UserAccessContext";
import { TelegramDebug } from "./components/TelegramDebug";
import { DebugLogin } from "./components/DebugLogin";
import { ScrollToTop } from "./components/ScrollToTop";
import { usePrefetchRoutes } from "./hooks/usePrefetchRoutes";
import { BackNavigationProvider } from "./contexts/BackNavigationContext";
import { SwipeBackGesture } from "./components/SwipeBackGesture";

// Экраны грузятся по требованию. Раньше приложение одним куском
// тянуло все страницы разом - вместе с данными курса, стратегиями и
// двумя библиотеками графиков. На телефоне это секунды до первого
// кадра, хотя человек открывает один экран.
const GuessChart = lazy(() => import("./pages/GuessChart"));
const Live = lazy(() => import("./pages/Live"));
const Index = lazy(() => import("./pages/Index"));
const Referral = lazy(() => import("./pages/Referral"));
const News = lazy(() => import("./pages/News"));
const Settings = lazy(() => import("./pages/Settings"));
const Library = lazy(() => import("./pages/Library"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TraderMenu = lazy(() => import("./pages/TraderMenu"));

const queryClient = new QueryClient();

/**
 * Что значит «назад» по умолчанию.
 *
 * Шаг по истории, а с главной уходить некуда - там жест ничего не
 * делает, чтобы человек не вываливался из приложения случайным
 * движением у края.
 */
const RoutedContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.pathname === '/home' || location.pathname === '/') return;
    navigate(-1);
  };

  return (
    <BackNavigationProvider fallback={goBack}>
      <ScrollToTop />
      <SwipeBackGesture />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/live" element={<Live />} />
        <Route path="/learning" element={<Index />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/news" element={<News />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/trader-menu" element={<TraderMenu />} />
        <Route path="/guess-chart" element={<GuessChart />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <AIAgentButton />
      <OnboardingTutorial />
      <CoinToast />
    </BackNavigationProvider>
  );
};

const AppContent = () => {
  // Убираем trailing slash из basename для правильной работы роутинга
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  // Пока человек на главной, в свободное время докачиваем остальные
  // экраны: тогда нажатие в нижней панели открывает их сразу
  usePrefetchRoutes();

  return (
    <BrowserRouter basename={basename}>
      <RoutedContent />
    </BrowserRouter>
  );
};

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <TelegramProvider>
            <UserAccessProvider>
              <Toaster />
              <Sonner />
              <AppInitializer>
                <AppContent />
              </AppInitializer>
              <TelegramDebug />
              <DebugLogin />
            </UserAccessProvider>
          </TelegramProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App render failed:', error);
    throw error;
  }
};

export default App;
