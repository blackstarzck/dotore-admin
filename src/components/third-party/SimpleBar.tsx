import * as React from 'react';
// material-ui
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// project imports
import { withAlpha } from 'utils/colorUtils';

// third-party
import { BrowserView, MobileView } from 'react-device-detect';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

// root style
const RootStyle = styled(BrowserView)({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden',
});

// scroll bar wrapper
const SimpleBarStyle = styled(SimpleBar)(({ theme }) => ({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      background: withAlpha(theme.palette.grey[500], 0.48),
    },
    '&.simplebar-visible:before': {
      opacity: 1,
    },
  },
  '& .simplebar-track': {
    '&.simplebar-vertical': {
      width: 10,
    },
  },
  '& .simplebar-track.simplebar-horizontal .simplebar-scrollbar': {
    height: 6,
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
}));

// ==============================|| SIMPLE SCROLL BAR ||============================== //

interface SimpleBarScrollProps {
  children: React.ReactNode;
  sx?: any;
  [key: string]: any;
}

const SimpleBarScroll = React.forwardRef<any, SimpleBarScrollProps>(({ children, sx, ...other }, ref) => {
  return (
    <>
      <RootStyle>
        <SimpleBarStyle ref={ref} clickOnTrack={false} sx={sx} data-simplebar-direction="ltr" {...other}>
          {children}
        </SimpleBarStyle>
      </RootStyle>
      <MobileView>
        <Box sx={{ overflowX: 'auto', ...sx }} {...other}>
          {children}
        </Box>
      </MobileView>
    </>
  );
});

SimpleBarScroll.displayName = 'SimpleBarScroll';

export default SimpleBarScroll;
