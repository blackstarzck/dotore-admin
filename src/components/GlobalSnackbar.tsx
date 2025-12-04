import { Alert, AlertColor, Snackbar, SnackbarProps } from '@mui/material';
import React from 'react';

export interface GlobalSnackbarProps extends Omit<SnackbarProps, 'onClose'> {
  onClose?: () => void;
  message?: React.ReactNode;
  severity?: AlertColor;
  alertAction?: React.ReactNode;
  alertIcon?: React.ReactNode;
}

const GlobalSnackbar = ({
  open,
  message,
  severity = 'success',
  autoHideDuration = 5000,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
  alertAction,
  alertIcon,
  sx,
  ...props
}: GlobalSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      key={anchorOrigin}
      {...props}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        action={alertAction}
        icon={alertIcon}
        sx={{
          width: '100%',
          // 모든 severity에 대해 진한 색상 적용 (배경색이 밝을 때도 잘 보이도록)
          ...(severity === 'success' && {
            bgcolor: 'success.main',
            color: 'success.contrastText',
            '& .MuiAlert-icon': {
              color: 'success.contrastText',
            },
          }),
          ...(severity === 'error' && {
            bgcolor: 'error.main',
            color: 'error.contrastText',
            '& .MuiAlert-icon': {
              color: 'error.contrastText',
            },
          }),
          ...(severity === 'warning' && {
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            '& .MuiAlert-icon': {
              color: 'warning.contrastText',
            },
          }),
          ...(severity === 'info' && {
            bgcolor: 'info.main',
            color: 'info.contrastText',
            '& .MuiAlert-icon': {
              color: 'info.contrastText',
            },
          }),
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
