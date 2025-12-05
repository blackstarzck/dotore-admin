import { ExpandMore } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../context/LanguageContext';

interface NavCollapseProps {
  item: {
    id: string;
    title: string;
    type: 'collapse';
    icon?: React.ComponentType;
    children?: Array<{
      id: string;
      title: string;
      type: 'item';
      url?: string;
      icon?: React.ComponentType;
      disabled?: boolean;
      target?: boolean;
    }>;
  };
  drawerOpen: boolean;
  onDrawerClose?: () => void;
}

export default function NavCollapse({ item, drawerOpen, onDrawerClose }: NavCollapseProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const downLG = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const [expanded, setExpanded] = React.useState(false);
  const [popoverAnchor, setPopoverAnchor] = React.useState<HTMLElement | null>(null);

  // 현재 경로에 따라 아코디언 자동 열기
  React.useEffect(() => {
    if (item.children) {
      const isActive = item.children.some((child) => {
        if (!child.url) return false;
        return location.pathname === child.url || location.pathname.startsWith(child.url + '/');
      });
      setExpanded(isActive);
    }
  }, [location.pathname, item.children]);

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const Icon = item.icon as React.ComponentType<any>;
  const itemIcon = item.icon ? <Icon style={{ fontSize: '1rem' }} /> : null;

  const handleItemClick = (url?: string) => {
    if (downLG && onDrawerClose) {
      onDrawerClose();
    }
  };

  const navItems = item.children?.map((menuItem) => {
    if (menuItem.type === 'item') {
      const isSelected = menuItem.url
        ? location.pathname === menuItem.url || location.pathname.startsWith(menuItem.url + '/')
        : false;

      let itemTarget: '_self' | '_blank' = '_self';
      if (menuItem.target) {
        itemTarget = '_blank';
      }

      const textColor = 'text.primary';
      const iconSelectedColor = 'primary.main';

      return (
        <Box key={menuItem.id} sx={{ position: 'relative' }} data-selected={isSelected ? 'true' : undefined}>
          <ListItemButton
            component={Link}
            to={menuItem.url || '#'}
            target={itemTarget}
            disabled={menuItem.disabled}
            selected={isSelected}
            onClick={() => handleItemClick(menuItem.url)}
            sx={{
              zIndex: 1201,
              minHeight: 48,
              height: 48,
              justifyContent: drawerOpen ? 'initial' : 'center',
              py: 0,
              px: '20px'
            }}
          >
            <ListItemText
              primary={
                <Typography variant="h6" sx={{ color: isSelected ? iconSelectedColor : textColor, pl: '36px' }}>
                  {t(menuItem.title)}
                </Typography>
              }
              sx={{ opacity: drawerOpen ? 1 : 0 }}
            />
          </ListItemButton>
        </Box>
      );
    }
    return null;
  });

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const handleMenuItemClick = (url?: string) => {
    if (url) {
      navigate(url);
      handlePopoverClose();
      if (onDrawerClose) {
        onDrawerClose();
      }
    }
  };

  const popoverOpen = Boolean(popoverAnchor);

  // Drawer가 닫혀있을 때는 아이콘만 표시하고 커스텀 툴팁 추가
  if (!drawerOpen) {
    return (
      <>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip
            title={t(item.title)}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  display: 'none', // 기본 툴팁 숨기기
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 48,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              {itemIcon && (
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    justifyContent: 'center',
                    color: 'text.primary',
                  }}
                >
                  {itemIcon}
                </ListItemIcon>
              )}
            </Box>
          </Tooltip>
        </ListItem>
        <Popover
          open={popoverOpen}
          anchorEl={popoverAnchor}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          sx={{
            pointerEvents: 'none',
            '& .MuiPopover-paper': {
              pointerEvents: 'auto',
              ml: 0.5,
              borderRadius: 1.5,
              boxShadow: '0px 0px 16px 0px rgba(0, 0, 0, 0.08)',
              minWidth: 200,
              maxWidth: 250,
              py: 0.5,
              mt: 0,
              border: '1px solid',
              borderColor: 'divider',
            },
          }}
          disableRestoreFocus
          slotProps={{
            paper: {
              onMouseEnter: () => setPopoverAnchor(popoverAnchor),
              onMouseLeave: handlePopoverClose,
            },
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                px: 2,
                py: 1.25,
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontSize: '0.875rem',
              }}
            >
              {t(item.title)}
            </Typography>
            <Box sx={{ py: 0.5 }}>
              {item.children?.map((menuItem) => {
                if (menuItem.type === 'item') {
                  const isSelected = menuItem.url
                    ? location.pathname === menuItem.url || location.pathname.startsWith(menuItem.url + '/')
                    : false;
                  return (
                    <Box
                      key={menuItem.id}
                      component={Link}
                      to={menuItem.url || '#'}
                      onClick={() => handleMenuItemClick(menuItem.url)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 0.875,
                        textDecoration: 'none',
                        color: 'text.primary',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                        ...(isSelected && {
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.lighter',
                          },
                        }),
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {t(menuItem.title)}
                      </Typography>
                    </Box>
                  );
                }
                return null;
              })}
            </Box>
          </Box>
        </Popover>
      </>
    );
  }

  return (
    <ListItem disablePadding sx={{ display: 'block', width: '100%' }}>
      <Accordion
        expanded={expanded}
        onChange={handleChange}
        sx={{
          width: '100%',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
          '& .MuiAccordionSummary-root': {
            minHeight: 48,
            height: 48,
            backgroundColor: 'transparent',
            '&.Mui-expanded': {
              minHeight: 48,
              height: 48,
            },
          },
          '& .MuiAccordionSummary-content': {
            margin: 0,
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiAccordionDetails-root': {
            padding: 0,
            backgroundColor: 'transparent',
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'text.primary' }} />}
          sx={{
            px: 2.5,
            minHeight: 48,
            height: 48,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 28,
                mr: 1,
                justifyContent: 'center',
                color: 'text.primary',
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            {t(item.title)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Box component="div">
            {navItems}
          </Box>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  );
}
