import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

/** Public path for built assets. Trailing slash required by Vite. */
function viteBaseFromEnv(raw: string | undefined): string {
  if (raw == null || raw === '') {
    return '/VaultPassword/';
  }
  const t = raw.trim();
  if (t === '/' || t === '') return '/';
  return t.endsWith('/') ? t : `${t}/`;
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // CI (e.g. GitHub Actions) sets env on the process; loadEnv only reads .env files
  const base = viteBaseFromEnv(env.VITE_BASE_PATH ?? process.env.VITE_BASE_PATH);
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    // Custom domain at site root (e.g. p.quochuy.me): set VITE_BASE_PATH=/ in CI (.env).
    // GitHub project Pages only: https://USER.github.io/Repo/ → VITE_BASE_PATH=/Repo/
    base,
  };
});
