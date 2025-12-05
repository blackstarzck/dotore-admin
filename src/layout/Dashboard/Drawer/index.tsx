import { Logout } from '@mui/icons-material';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme, useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { removeAuthToken } from '../../../utils/storage';
import DrawerContent from './DrawerContent';
import DrawerHeader from './DrawerHeader';

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

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
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
}));

interface MainDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MainDrawer({ open, onClose }: MainDrawerProps) {
  const { t } = useLanguage();
  const { mode: colorSchemeMode } = useColorScheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader open={open} onClose={onClose} />
      <DrawerContent open={open} onClose={onClose} />
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
                  '&:hover': { bgcolor: colorSchemeMode === 'dark' ? 'action.hover' : 'primary.lighter' },
                }),
                ...(!open && {
                  '&:hover': { bgcolor: 'transparent' },
                }),
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
                    '&:hover': { bgcolor: 'secondary.lighter' },
                  }),
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
  );
}
