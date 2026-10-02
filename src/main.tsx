import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Bootloader from './Bootloader.tsx';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';
import { LanguageProvider } from './contexts/LanguageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <LanguageProvider>
        <Bootloader />
      </LanguageProvider>
    </AlertProvider>
  </StrictMode>,
);
