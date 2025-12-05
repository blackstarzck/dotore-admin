import { DarkMode, Email, ExpandLess, ExpandMore, Fullscreen, FullscreenExit, GridView, LightMode, Notifications } from '@mui/icons-material';
import { Badge, Box, IconButton, Menu, MenuItem, Tooltip, Typography, useColorScheme } from '@mui/material';
import * as React from 'react';
import { useColorMode } from '../../../context/ColorModeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { getCommonText } from '../../../utils/pageTexts';

export default function HeaderContent() {
  const { mode, toggleColorMode } = useColorMode();
  const { mode: colorSchemeMode } = useColorScheme();
  const { language, setLanguage, t } = useLanguage();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [exploreAnchorEl, setExploreAnchorEl] = React.useState<null | HTMLElement>(null);
  const exploreMenuOpen = Boolean(exploreAnchorEl);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  const languageMenuOpen = Boolean(languageAnchorEl);

  const languages = [
    { code: 'ko' as const, name: '한국', flag: '/flags/KR.png' },
    { code: 'en' as const, name: 'English', flag: '/flags/US.png' },
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '/flags/VN.png' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleExploreClick = (event: React.MouseEvent<HTMLElement>) => {
    setExploreAnchorEl(event.currentTarget);
  };

  const handleExploreClose = () => {
    setExploreAnchorEl(null);
  };

  const handleExploreMenuItemClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    handleExploreClose();
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (langCode: 'ko' | 'en' | 'vi') => {
    setLanguage(langCode);
    handleLanguageClose();
  };

  return (
    <>
      {/* 언어 선택 메뉴 */}
      <Tooltip title={getCommonText('languageSelect', language)}>
        <IconButton
          color="inherit"
          onClick={handleLanguageClick}
          aria-controls={languageMenuOpen ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={languageMenuOpen ? 'true' : undefined}
          sx={{
            borderRadius: 1,
            px: 1.5,
            py: 1,
            width: 'auto',
            minWidth: 'auto',
            minHeight: 40,
            height: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
            <Box
              component="img"
              src={currentLanguage.flag}
              alt={currentLanguage.name}
              sx={{
                width: 24,
                objectFit: 'cover',
                borderRadius: 0.5,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {currentLanguage.name}
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={languageAnchorEl}
        open={languageMenuOpen}
        onClose={handleLanguageClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
          sx: { py: 0.5 },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={language === lang.code}
            sx={{ py: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 120 }}>
              <Box
                component="img"
                src={lang.flag}
                alt={lang.name}
                sx={{
                  width: 24,
                  objectFit: 'contain',
                  borderRadius: 0.5,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2">{lang.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Tooltip title={t('tooltip.explore')}>
        <IconButton
          color="inherit"
          sx={{ borderRadius: 1 }}
          onClick={handleExploreClick}
          aria-controls={exploreMenuOpen ? 'explore-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={exploreMenuOpen ? 'true' : undefined}
        >
          <GridView fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        id="explore-menu"
        anchorEl={exploreAnchorEl}
        open={exploreMenuOpen}
        onClose={handleExploreClose}
        MenuListProps={{
          'aria-labelledby': 'explore-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleExploreMenuItemClick('https://www.naver.com')}>네이버</MenuItem>
        <MenuItem onClick={() => handleExploreMenuItemClick('https://www.google.com')}>구글</MenuItem>
      </Menu>

      <Tooltip title={mode === 'dark' ? t('tooltip.lightMode') : t('tooltip.darkMode')}>
        <IconButton color="inherit" onClick={toggleColorMode} sx={{ borderRadius: 1 }}>
          {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title={t('tooltip.fullscreen')}>
        <IconButton color="inherit" onClick={handleFullScreen} sx={{ borderRadius: 1 }}>
          {isFullScreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title={t('tooltip.notifications')}>
        <IconButton color="inherit" sx={{ borderRadius: 1 }}>
          <Badge badgeContent={4} color="primary">
            <Notifications fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>
    </>
  );
}
