import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Bootloader from './Bootloader.tsx';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Đăng ký Service Worker hỗ trợ cài đặt Shortcut PWA trên iOS và Android
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <LanguageProvider>
        <Bootloader />
      </LanguageProvider>
    </AlertProvider>
  </StrictMode>,
);

