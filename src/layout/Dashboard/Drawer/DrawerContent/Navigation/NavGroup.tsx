// material-ui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import * as React from 'react';

// project import
import { useLanguage } from '../../../../../context/LanguageContext';
import NavCollapse from './NavCollapse';
import NavItem from './NavItem';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

interface NavGroupProps {
  item: {
    id: string;
    title: string;
    type: 'group';
    icon?: React.ComponentType;
    children?: Array<{
      id: string;
      title: string;
      type: 'item' | 'collapse';
      url?: string;
      icon?: React.ComponentType;
      disabled?: boolean;
      target?: boolean;
      children?: Array<{
        id: string;
        title: string;
        type: 'item';
        url?: string;
        icon?: React.ComponentType;
        disabled?: boolean;
        target?: boolean;
      }>;
    }>;
  };
  drawerOpen: boolean;
  onDrawerClose?: () => void;
}

export default function NavGroup({ item, drawerOpen, onDrawerClose }: NavGroupProps) {
  const { t } = useLanguage();

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return (
          <NavCollapse
            key={menuItem.id}
            item={menuItem as {
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
            }}
            drawerOpen={drawerOpen}
            onDrawerClose={onDrawerClose}
          />
        );
      case 'item':
        return (
          <NavItem
            key={menuItem.id}
            item={menuItem as { id: string; title: string; type: 'item'; url?: string; icon?: React.ComponentType; disabled?: boolean; target?: boolean }}
            level={0}
            drawerOpen={drawerOpen}
            onItemClick={onDrawerClose}
          />
        );
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 400 }}>
              {t(item.title)}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
    >
      {navCollapse}
    </List>
  );
}
