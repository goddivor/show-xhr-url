import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * Paints the stored theme before React mounts. Deferring this to a hook would show one
 * frame of the wrong palette on every open, which is very visible in a docked panel.
 */
function applyStoredTheme(): void {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (stored === 'dark' || (stored !== 'light' && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
}

applyStoredTheme();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root in the side panel document.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
