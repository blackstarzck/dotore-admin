import React, { createContext } from 'react';
import { useTheme, useColorScheme } from '@mui/material/styles';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorMode = () => {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const currentMode = (mode || theme.palette.mode || 'light') as ColorMode;

  const toggleColorMode = () => {
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  return {
    mode: currentMode,
    toggleColorMode
  };
};

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColorModeContext.Provider value={{ mode: 'light', toggleColorMode: () => {} }}>
      {children}
    </ColorModeContext.Provider>
  );
};
