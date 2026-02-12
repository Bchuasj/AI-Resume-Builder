import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load using Vite's loadEnv. This automatically loads .env, .env.local, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '');

  console.log("DEBUG: VITE ENV LOADED:", {
    HAS_GEMINI: !!env.GEMINI_API_KEY,
    HAS_VITE_GEMINI: !!env.VITE_GEMINI_API_KEY
  });

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Polyfill process.env for compatibility
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Also ensure VITE_ var is available if loaded from standard env file
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
