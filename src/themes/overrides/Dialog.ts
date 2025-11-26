import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - DIALOG ||============================== //

export default function Dialog(_theme: Theme) {
  return {
    MuiDialog: {
      styleOverrides: {
        paper: {
          minWidth: '600px',
        },
      },
    },
  };
}
