import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Load using Vite's loadEnv. This automatically loads .env, .env.local, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '');
  // Merge process.env for Vercel support (loadEnv only reads files)
  const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const viteGeminiKey = env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  console.log("DEBUG: VITE ENV LOADED:", {
    geminiKey: !!geminiKey,
    viteGeminiKey: !!viteGeminiKey
  });

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Polyfill process.env for compatibility
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      // Ensure VITE_ var is available
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteGeminiKey || geminiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
