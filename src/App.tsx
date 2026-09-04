import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuessChart from "./pages/GuessChart";
import Home from "./pages/Home";
import Live from "./pages/Live";
import Index from "./pages/Index";
import Strategies from "./pages/Strategies";
import Referral from "./pages/Referral";
import News from "./pages/News";
import Software from "./pages/Software";
import Settings from "./pages/Settings";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import TraderMenu from "./pages/TraderMenu";
import UserProfile from "./pages/UserProfile";
import { AIAgentButton } from "./components/AIAgentButton";
import { AppInitializer } from "./components/AppInitializer";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { CoinToast } from "./components/CoinToast";
import { TelegramProvider } from "./contexts/TelegramContext";
import { UserAccessProvider } from "./contexts/UserAccessContext";
import { TelegramDebug } from "./components/TelegramDebug";
import { DebugLogin } from "./components/DebugLogin";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const AppContent = () => {
  // Убираем trailing slash из basename для правильной работы роутинга
  const basename = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/live" element={<Live />} />
        <Route path="/learning" element={<Index />} />
        <Route path="/strategies" element={<Strategies />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/news" element={<News />} />
        <Route path="/software" element={<Software />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/trader-menu" element={<TraderMenu />} />
        <Route path="/guess-chart" element={<GuessChart />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIAgentButton />
      <OnboardingTutorial />
      <CoinToast />
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
