import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabaseClient';
import { MissingSupabaseConfig } from './MissingSupabaseConfig.tsx';
import './index.css';

/** Match Vite `base` (e.g. /VaultPassword/ for GitHub project Pages). Router wants no trailing slash. */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const rootEl = document.getElementById('root')!;

if (!isSupabaseConfigured()) {
  createRoot(rootEl).render(
    <StrictMode>
      <MissingSupabaseConfig />
    </StrictMode>,
  );
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <BrowserRouter basename={routerBasename === '/' ? undefined : routerBasename}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}
