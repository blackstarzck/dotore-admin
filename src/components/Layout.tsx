import { DarkMode, Email, ExpandLess, ExpandMore, Fullscreen, FullscreenExit, GridView, LightMode, Logout, Notifications, SupportAgent } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import LinkMaterial from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { CSSObject, styled, Theme, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useColorMode } from '../context/ColorModeContext';
import { useLanguage } from '../context/LanguageContext';
import { autoMailGroups, manualMailGroups } from '../data/mockMailData';
import { removeAuthToken } from '../utils/storage';
import { getCommonText } from '../utils/pageTexts';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Layout = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [inquiryOpen, setInquiryOpen] = React.useState(true);
  const [mailOpen, setMailOpen] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [exploreAnchorEl, setExploreAnchorEl] = React.useState<null | HTMLElement>(null);
  const exploreMenuOpen = Boolean(exploreAnchorEl);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  const languageMenuOpen = Boolean(languageAnchorEl);
  const [popoverAnchor, setPopoverAnchor] = React.useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = React.useState<'inquiry' | 'mail' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'ko' as const, name: '한국', flag: '/flags/KR.png' },
    { code: 'en' as const, name: 'English', flag: '/flags/US.png' },
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '/flags/VN.png' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const handleInquiryClick = () => {
    if (open) {
      setInquiryOpen(!inquiryOpen);
    } else {
      // 접혀있을 때는 사이드바를 열기
      setOpen(true);
    }
  };

  const popoverTimeoutRef = React.useRef<number | null>(null);

  const handleInquiryMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (!open) {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
      setPopoverAnchor(event.currentTarget);
      setActiveMenu('inquiry');
    }
  };

  const handleInquiryMouseLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setPopoverAnchor(null);
      setActiveMenu(null);
    }, 100);
  };

  const handlePopoverEnter = () => {
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }
  };

  const handlePopoverLeave = () => {
    setPopoverAnchor(null);
    setActiveMenu(null);
  };

  const handleMailClick = () => {
    if (open) {
      setMailOpen(!mailOpen);
    } else {
      // 접혀있을 때는 사이드바를 열기
      setOpen(true);
    }
  };

  const handleMailMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (!open) {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
        popoverTimeoutRef.current = null;
      }
      setPopoverAnchor(event.currentTarget);
      setActiveMenu('mail');
    }
  };

  const handleMailMouseLeave = () => {
    popoverTimeoutRef.current = setTimeout(() => {
      setPopoverAnchor(null);
      setActiveMenu(null);
    }, 100);
  };

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

  React.useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  // 현재 경로에 따라 메뉴 자동 열기
  React.useEffect(() => {
    if (location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail') || location.pathname === '/mail-group' || location.pathname === '/mail-history') {
      setMailOpen(true);
    }
  }, [location.pathname]);


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('admin.title')}
          </Typography>

          {/* 우측 아이콘 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
              <MenuItem onClick={() => handleExploreMenuItemClick('https://www.naver.com')}>
                네이버
              </MenuItem>
              <MenuItem onClick={() => handleExploreMenuItemClick('https://www.google.com')}>
                구글
              </MenuItem>
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
          </Box>

        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
            {/* 문의 관리 (상위 메뉴) */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Box sx={{ position: 'relative' }}>
                <ListItemButton
                  onClick={handleInquiryClick}
                  onMouseEnter={handleInquiryMouseEnter}
                  onMouseLeave={handleInquiryMouseLeave}
                  selected={false}
                  sx={(_theme) => ({
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2.5 : 1.5,
                    py: !open ? 1.25 : 1,
                    ...(open && {
                      '&:hover': { bgcolor: 'primary.lighter' },
                      // 상위 메뉴는 배경색과 세로선 없이 텍스트 색상만 변경
                      color: (location.pathname === '/' || location.pathname === '/analysis') ? 'primary.main' : 'text.primary',
                    }),
                    ...(!open && {
                      '&:hover': { bgcolor: 'transparent' },
                    })
                  })}
                >
                  <ListItemIcon
                    sx={(_theme) => ({
                      minWidth: 28,
                      color: (location.pathname === '/' || location.pathname === '/analysis') ? 'primary.main' : 'text.primary',
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      ...(!open && {
                        borderRadius: 1.5,
                        width: 36,
                        height: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': { bgcolor: 'secondary.lighter' }
                      }),
                      ...(!open &&
                        (location.pathname === '/' || location.pathname === '/analysis') && {
                        bgcolor: 'primary.lighter',
                        '&:hover': { bgcolor: 'primary.lighter' }
                      })
                    })}
                  >
                    <SupportAgent />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ color: (location.pathname === '/' || location.pathname === '/analysis') ? 'primary.main' : 'text.primary' }}>
                        {t('menu.inquiry')}
                      </Typography>
                    }
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {open ? (inquiryOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
              </Box>
            </ListItem>

            {/* 하위 메뉴 */}
            <Collapse in={inquiryOpen && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정 (상위 메뉴 아이콘 너비 고려)
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname === '/'}
                        onClick={() => {
                          if (location.pathname !== '/') {
                            navigate('/');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname === '/' ? 'primary.main' : 'text.primary' }}>
                              {t('menu.inquiry.list')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname === '/analysis'}
                        onClick={() => {
                          if (location.pathname !== '/analysis') {
                            navigate('/analysis');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname === '/analysis' ? 'primary.main' : 'text.primary' }}>
                              {t('menu.inquiry.analysis')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                </List>
            </Collapse>


            {/* 메일 관리 (상위 메뉴) */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Box sx={{ position: 'relative' }}>
                <ListItemButton
                  onClick={handleMailClick}
                  onMouseEnter={handleMailMouseEnter}
                  onMouseLeave={handleMailMouseLeave}
                  selected={false}
                  sx={(_theme) => ({
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: open ? 2.5 : 1.5,
                    py: !open ? 1.25 : 1,
                    ...(open && {
                      '&:hover': { bgcolor: 'primary.lighter' },
                      // 상위 메뉴는 배경색과 세로선 없이 텍스트 색상만 변경
                      color: (location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail') || location.pathname === '/mail-group' || location.pathname === '/mail-history') ? 'primary.main' : 'text.primary',
                    }),
                    ...(!open && {
                      '&:hover': { bgcolor: 'transparent' },
                    })
                  })}
                >
                  <ListItemIcon
                    sx={(_theme) => ({
                      minWidth: 28,
                      color: (location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail') || location.pathname === '/mail-group' || location.pathname === '/mail-history') ? 'primary.main' : 'text.primary',
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      ...(!open && {
                        borderRadius: 1.5,
                        width: 36,
                        height: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': { bgcolor: 'secondary.lighter' }
                      }),
                      ...(!open &&
                        (location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail')) && {
                        bgcolor: 'primary.lighter',
                        '&:hover': { bgcolor: 'primary.lighter' }
                      })
                    })}
                  >
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ color: (location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail')) ? 'primary.main' : 'text.primary' }}>
                        {t('menu.mail')}
                      </Typography>
                    }
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {open ? (mailOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
              </Box>
            </ListItem>

            {/* 하위 메뉴 */}
            <Collapse in={mailOpen && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정 (상위 메뉴 아이콘 너비 고려)
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname.startsWith('/auto-mail')}
                        onClick={() => {
                          if (location.pathname !== '/auto-mail') {
                            navigate('/auto-mail');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname.startsWith('/auto-mail') ? 'primary.main' : 'text.primary' }}>
                              {t('menu.mail.auto')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname.startsWith('/manual-mail')}
                        onClick={() => {
                          if (location.pathname !== '/manual-mail') {
                            navigate('/manual-mail');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname.startsWith('/manual-mail') ? 'primary.main' : 'text.primary' }}>
                              {t('menu.mail.manual')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname === '/mail-group'}
                        onClick={() => {
                          if (location.pathname !== '/mail-group') {
                            navigate('/mail-group');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname === '/mail-group' ? 'primary.main' : 'text.primary' }}>
                              {t('menu.mail.group')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                    <ListItemButton
                        sx={(_theme) => ({
                          pl: 9, // 들여쓰기 조정
                          '&:hover': { bgcolor: 'primary.lighter' },
                          '&.Mui-selected': {
                            bgcolor: 'primary.lighter',
                            borderRight: '2px solid',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.main', bgcolor: 'primary.lighter' }
                          }
                        })}
                        selected={location.pathname === '/mail-history'}
                        onClick={() => {
                          if (location.pathname !== '/mail-history') {
                            navigate('/mail-history');
                          }
                        }}
                    >
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: location.pathname === '/mail-history' ? 'primary.main' : 'text.primary' }}>
                              {t('menu.mail.history')}
                            </Typography>
                          }
                        />
                    </ListItemButton>
                </List>
            </Collapse>

            {/* 접혀있을 때 하위 메뉴 Popover (공유) */}
            <Popover
              open={Boolean(popoverAnchor) && activeMenu !== null}
              anchorEl={popoverAnchor}
              onClose={handlePopoverLeave}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              disableRestoreFocus
              disableAutoFocus
              disableEnforceFocus
              onMouseEnter={handlePopoverEnter}
              onMouseLeave={handlePopoverLeave}
              sx={{
                pointerEvents: 'none',
                '& .MuiPopover-paper': {
                  pointerEvents: 'auto',
                },
              }}
            >
              <List sx={{ py: 0, minWidth: 160 }}>
                {activeMenu === 'inquiry' && (
                  <>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/') {
                          navigate('/');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname === '/' ? 'primary.main' : 'text.primary' }}>
                            {t('menu.inquiry.list')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/analysis') {
                          navigate('/analysis');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname === '/analysis' ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname === '/analysis' ? 'primary.main' : 'text.primary' }}>
                            {t('menu.inquiry.analysis')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </>
                )}
                {activeMenu === 'mail' && (
                  <>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/auto-mail') {
                          navigate('/auto-mail');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname.startsWith('/auto-mail') ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname.startsWith('/auto-mail') ? 'primary.main' : 'text.primary' }}>
                            {t('menu.mail.auto')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/manual-mail') {
                          navigate('/manual-mail');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname.startsWith('/manual-mail') ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname.startsWith('/manual-mail') ? 'primary.main' : 'text.primary' }}>
                            {t('menu.mail.manual')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/mail-group') {
                          navigate('/mail-group');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname === '/mail-group' ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname === '/mail-group' ? 'primary.main' : 'text.primary' }}>
                            {t('menu.mail.group')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    <ListItemButton
                      selected={false}
                      tabIndex={-1}
                      onClick={() => {
                        if (location.pathname !== '/mail-history') {
                          navigate('/mail-history');
                        }
                        handlePopoverLeave();
                      }}
                      sx={(_theme) => ({
                        '&:hover': { bgcolor: 'transparent' },
                        color: location.pathname === '/mail-history' ? 'primary.main' : 'text.primary',
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ color: location.pathname === '/mail-history' ? 'primary.main' : 'text.primary' }}>
                            {t('menu.mail.history')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </>
                )}
              </List>
            </Popover>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Box sx={{ position: 'relative' }}>
              <ListItemButton
                onClick={handleLogout}
                    sx={(_theme) => ({
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: open ? 2.5 : 1.5,
                  py: !open ? 1.25 : 1,
                  ...(open && {
                    '&:hover': { bgcolor: 'primary.lighter' }
                  }),
                  ...(!open && {
                    '&:hover': { bgcolor: 'transparent' }
                  })
                })}
              >
                <ListItemIcon
                  sx={(_theme) => ({
                    minWidth: 28,
                    color: 'text.primary',
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    ...(!open && {
                      borderRadius: 1.5,
                      width: 36,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': { bgcolor: 'secondary.lighter' }
                    })
                  })}
                >
                  <Logout />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {t('menu.logout')}
                    </Typography>
                  }
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Box>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {/* Breadcrumbs 추가 */}
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              mb: 2,
              '& .MuiBreadcrumbs-separator': { color: 'text.secondary' },
              '& .MuiTypography-root': { fontSize: '0.75rem' },
              '& .MuiLink-root': { fontSize: '0.75rem', color: 'text.secondary' }
            }}
          >
            {location.pathname.startsWith('/auto-mail') || location.pathname.startsWith('/manual-mail') || location.pathname === '/mail-group' ? (
              (() => {
                const isAutoMail = location.pathname.startsWith('/auto-mail');
                const pathParts = location.pathname.split('/').filter(Boolean);
                const templateId = pathParts.length >= 3 ? pathParts[2] : null;

                let templateName = null;
                if (templateId) {
                  const groups = isAutoMail ? autoMailGroups : manualMailGroups;
                  for (const group of groups) {
                    const template = group.templates.find((t) => t.id === templateId);
                    if (template) {
                      templateName = template.name;
                      break;
                    }
                  }
                }

                if (templateName) {
                  return [
                    <LinkMaterial key="mail" component={Link} to={isAutoMail ? '/auto-mail' : '/manual-mail'} color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {t('breadcrumb.mail')}
                    </LinkMaterial>,
                    <LinkMaterial key="type" component={Link} to={isAutoMail ? '/auto-mail' : '/manual-mail'} color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {isAutoMail ? t('breadcrumb.mail.auto') : t('breadcrumb.mail.manual')}
                    </LinkMaterial>,
                    <Typography key="template" color="text.primary" sx={{ fontWeight: 500 }}>
                      {templateName}
                    </Typography>
                  ];
                } else {
                  return [
                    <LinkMaterial key="mail" component={Link} to={isAutoMail ? '/auto-mail' : '/manual-mail'} color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {t('breadcrumb.mail')}
                    </LinkMaterial>,
                    <Typography key="type" color="text.primary" sx={{ fontWeight: 500 }}>
                      {isAutoMail ? t('breadcrumb.mail.auto') : t('breadcrumb.mail.manual')}
                    </Typography>
                  ];
                }
              })()
            ) : location.pathname === '/mail-group' ? (
              [
                <LinkMaterial key="mail" component={Link} to="/mail-group" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {t('breadcrumb.mail')}
                </LinkMaterial>,
                <Typography key="group" color="text.primary" sx={{ fontWeight: 500 }}>
                  {t('breadcrumb.mail.group')}
                </Typography>
              ]
            ) : location.pathname === '/mail-history' ? (
              [
                <LinkMaterial key="mail" component={Link} to="/mail-group" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {t('breadcrumb.mail')}
                </LinkMaterial>,
                <Typography key="history" color="text.primary" sx={{ fontWeight: 500 }}>
                  {t('breadcrumb.mail.history')}
                </Typography>
              ]
            ) : (
              [
                <LinkMaterial key="inquiry" component={Link} to="/" color="text.secondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {t('breadcrumb.inquiry')}
                </LinkMaterial>,
                location.pathname === '/' ? (
                  <Typography key="list" color="text.primary" sx={{ fontWeight: 500 }}>{t('breadcrumb.inquiry.list')}</Typography>
                ) : (
                  <Typography key="analysis" color="text.primary" sx={{ fontWeight: 500 }}>
                    {t(`breadcrumb.inquiry.${location.pathname === '/analysis' ? 'analysis' : 'list'}`)}
                  </Typography>
                )
              ]
            )}
          </Breadcrumbs>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
