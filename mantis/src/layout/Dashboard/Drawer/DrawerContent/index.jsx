// project imports
import { useGetMenuMaster } from 'api/menu';
import SimpleBar from 'components/third-party/SimpleBar';
import NavCard from './NavCard';
import Navigation from './Navigation';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>

      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation />
        {drawerOpen && <NavCard />}
      </SimpleBar>
    </>
  );
}
