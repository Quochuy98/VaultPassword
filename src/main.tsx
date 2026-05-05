import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/** Match Vite `base` (e.g. /VaultPassword/ for GitHub project Pages). Router wants no trailing slash. */
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename === '/' ? undefined : routerBasename}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
