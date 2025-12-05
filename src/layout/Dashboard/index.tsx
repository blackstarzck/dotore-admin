import { Box, CssBaseline } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import MainDrawer from './Drawer';
import Footer from './Footer';
import CustomBreadcrumbs from './Breadcrumbs';

export default function DashboardLayout() {
  const [open, setOpen] = React.useState(false);
  const downXL = useMediaQuery((theme: any) => theme.breakpoints.down('xl'));

  // set media wise responsive drawer
  React.useEffect(() => {
    setOpen(!downXL);
  }, [downXL]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CssBaseline />
      <Header open={open} onOpen={handleDrawerOpen} />
      <MainDrawer open={open} onClose={handleDrawerClose} />

      <Box component="main" sx={{ width: open ? 'calc(100% - 240px)' : 'calc(100% - 60px)', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar sx={{ mt: 'inherit' }} />
        <Box
          sx={{
            ...{ px: { xs: 0, sm: 2 } },
            position: 'relative',
            minHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CustomBreadcrumbs />
          <Outlet />
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
