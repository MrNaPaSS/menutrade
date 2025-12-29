import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Telegram Web App configuration
const tg = (window as any).Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Set header color to match background (hsl(140, 35%, 4%) -> #070e0b)
  tg.setHeaderColor('#070e0b');
  // Enable closing confirmation if needed, or other settings
}

try {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  throw error;
}
