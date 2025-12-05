import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../../../context/LanguageContext';

interface NavItemProps {
  item: {
    id: string;
    title: string;
    type: 'item';
    url?: string;
    icon?: React.ComponentType;
    disabled?: boolean;
    target?: boolean;
  };
  level: number;
  drawerOpen: boolean;
  onItemClick?: () => void;
}

export default function NavItem({ item, level, drawerOpen, onItemClick }: NavItemProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const downLG = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  let itemTarget: '_self' | '_blank' = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downLG && onItemClick) {
      onItemClick();
    }
  };

  const Icon = item.icon as React.ComponentType<any>;
  const itemIcon = item.icon ? (
    <Icon
      style={{
        fontSize: drawerOpen ? '1rem' : '1.25rem',
      }}
    />
  ) : null;

  const isSelected = item.url ? location.pathname === item.url || location.pathname.startsWith(item.url + '/') : false;

  const textColor = 'text.primary';
  const iconSelectedColor = 'primary.main';

  const content = (
    <Box sx={{ position: 'relative' }} data-selected={isSelected ? 'true' : undefined}>
      <ListItemButton
          component={Link}
          to={item.url || '#'}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          sx={(theme) => ({
            zIndex: 1201,
            minHeight: 48,
            height: level > 0 ? 48 : undefined,
            justifyContent: drawerOpen ? 'initial' : 'center',
            ...(level === 0 && {
              px: drawerOpen ? 2.5 : 1.5,
            }),
            ...(level > 0 && {
              pl: drawerOpen ? `${level * 28}px` : 1.5,
              pr: drawerOpen ? 2.5 : 1.5,
            }),
            py: level > 0 ? 0 : !drawerOpen ? 1.25 : 1,
          })}
          onClick={() => itemHandler()}
        >
          {itemIcon && level === 0 && (
            <ListItemIcon
              sx={(theme) => ({
                minWidth: 28,
                color: isSelected ? iconSelectedColor : textColor,
                mr: drawerOpen ? 1 : 'auto',
                justifyContent: 'center',
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { bgcolor: 'secondary.lighter' },
                }),
                ...(!drawerOpen &&
                  isSelected && {
                  bgcolor: 'primary.lighter',
                  '&:hover': { bgcolor: 'primary.lighter' },
                }),
              })}
            >
              {itemIcon}
            </ListItemIcon>
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) && (
            <ListItemText
              primary={
                <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor }}>
                  {t(item.title)}
                </Typography>
              }
              sx={{ opacity: drawerOpen ? 1 : 0 }}
            />
          )}
      </ListItemButton>
    </Box>
  );

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {content}
    </ListItem>
  );
}
