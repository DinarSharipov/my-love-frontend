import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app';
import { initializeTheme } from '@/shared/lib/theme';
import '@/shared/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found');
}

initializeTheme();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
