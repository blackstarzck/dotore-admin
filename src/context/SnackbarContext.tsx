import { AlertColor } from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';
import GlobalSnackbar from '../components/GlobalSnackbar';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration?: number;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export const SnackbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
    duration: 5000,
  });

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'success', duration: number = 5000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      duration: duration > 0 ? duration : 5000,
    });
  }, []);

  const handleClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        autoHideDuration={snackbar.duration}
        onClose={handleClose}
      />
    </SnackbarContext.Provider>
  );
};
