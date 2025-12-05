import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - ACCORDION ||============================== //

export default function Accordion(theme: Theme) {
  return {
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          '&::before': {
            display: 'none',
          },
        },
      },
    },
  };
}
