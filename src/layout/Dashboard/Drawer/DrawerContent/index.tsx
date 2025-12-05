import SimpleBar from 'components/third-party/SimpleBar';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';

interface DrawerContentProps {
  open: boolean;
  onClose?: () => void;
}

export default function DrawerContent({ open, onClose }: DrawerContentProps) {
  const location = useLocation();
  const simpleBarRef = React.useRef<any>(null);

  // 현재 경로가 변경되면 선택된 메뉴 항목으로 스크롤
  React.useEffect(() => {
    if (open && simpleBarRef.current) {
      const scrollContent = simpleBarRef.current.getScrollElement?.();
      if (scrollContent) {
        // 선택된 메뉴 항목 찾기
        const selectedItem = scrollContent.querySelector('[data-selected="true"]');
        if (selectedItem) {
          setTimeout(() => {
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      }
    }
  }, [location.pathname, open]);

  return (
    <SimpleBar ref={simpleBarRef} sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
      <Navigation drawerOpen={open} onDrawerClose={onClose} />
    </SimpleBar>
  );
}
