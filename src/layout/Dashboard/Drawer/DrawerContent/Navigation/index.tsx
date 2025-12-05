import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import menuItems, { MenuItem } from '../../../../../menu-items';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup';

interface NavigationProps {
  drawerOpen: boolean;
  onDrawerClose?: () => void;
}

export default function Navigation({ drawerOpen, onDrawerClose }: NavigationProps) {
  const navItems = menuItems.items.map((item: MenuItem) => {
    if (item.type === 'group') {
      return (
        <NavGroup
          key={item.id}
          item={item as {
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
          }}
          drawerOpen={drawerOpen}
          onDrawerClose={onDrawerClose}
        />
      );
    }
    if (item.type === 'collapse') {
      return (
        <NavCollapse
          key={item.id}
          item={item as {
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
    }
    return (
      <Typography key={item.id} variant="h6" color="error" align="center">
        Fix - Navigation Group or Collapse
      </Typography>
    );
  });

  return <Box sx={{ pt: 2 }}>{navItems}</Box>;
}
