import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// @ts-expect-error - virtual module provided by vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Register service worker silently on application load
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
