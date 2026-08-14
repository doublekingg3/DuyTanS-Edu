import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Bootloader from './Bootloader.tsx';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <Bootloader />
    </AlertProvider>
  </StrictMode>,
);
