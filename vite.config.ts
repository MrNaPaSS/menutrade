import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_PUBLIC_PATH || (mode === 'production' ? "/menutrade/" : "/"),
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/bot-api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bot-api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Отдельно выносим только то, что нужно каждому экрану: сам
        // React и анимации. Библиотеки графиков и markdown в списке
        // быть не должны - перечисление имени тянет в кусок и все его
        // зависимости, а через общую из них кусок становится нужен
        // главному экрану, где графиков нет. Rollup сам положит их
        // в тот кусок, который их просит.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|react-router|react-router-dom)\//.test(id)) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion/')) return 'motion';
        },
      },
    },
    // Куски стали мельче, прежний порог только шумит в выводе
    chunkSizeWarningLimit: 900,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
