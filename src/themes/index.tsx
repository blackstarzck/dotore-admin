import React, { useMemo } from 'react';

// material-ui
import { createTheme, StyledEngineProvider, ThemeProvider, Direction } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// project imports
import CustomShadows from './custom-shadows';
import componentsOverride from './overrides';
import { buildPalette } from './palette';
import Typography from './typography';

// ==============================|| DEFAULT THEME - MAIN ||============================== //

interface ThemeCustomizationProps {
  children: React.ReactNode;
}

export default function ThemeCustomization({ children }: ThemeCustomizationProps) {
  const fontFamily = `'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif`;
  const presetColor = 'default';

  const themeTypography = useMemo(() => Typography(fontFamily), [fontFamily]);

  const palette = useMemo(() => buildPalette(presetColor), [presetColor]);

  const themeOptions = useMemo(
    () => ({
      breakpoints: {
        values: {
          xs: 0,
          sm: 768,
          md: 1024,
          lg: 1266,
          xl: 1440
        }
      },
      direction: 'ltr' as Direction,
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8
        }
      },
      typography: themeTypography,
      colorSchemes: {
        light: {
          palette: palette.light,
          customShadows: CustomShadows(palette.light as any)
        },
        dark: {
          palette: palette.dark,
          customShadows: CustomShadows(palette.dark as any)
        }
      },
      cssVariables: {
        cssVarPrefix: '',
        colorSchemeSelector: 'data-color-scheme'
      }
    }),
    [themeTypography, palette]
  );

  const themes = createTheme(themeOptions);
  themes.components = componentsOverride(themes);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider disableTransitionOnChange theme={themes} modeStorageKey="theme-mode" defaultMode="light">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
