import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import AlertModal, { AlertType } from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; type: AlertType }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const [resolveConfirm, setResolveConfirm] = useState<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    setAlertState({ isOpen: true, message, type });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback((message: string) => {
    setConfirmState({ isOpen: true, message });
    return new Promise<boolean>((resolve) => {
      setResolveConfirm(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveConfirm) resolveConfirm(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    setResolveConfirm(null);
  }, [resolveConfirm]);

  const handleCancel = useCallback(() => {
    if (resolveConfirm) resolveConfirm(false);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    setResolveConfirm(null);
  }, [resolveConfirm]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        type={alertState.type} 
        onClose={closeAlert} 
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
