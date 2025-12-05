import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton, styled } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const DrawerHeaderStyled = styled('div')<{ open?: boolean }>(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: open ? 'space-between' : 'center',
  padding: theme.spacing(open ? 2 : 1),
  minHeight: 60,
  ...theme.mixins.toolbar,
}));

interface DrawerHeaderProps {
  open: boolean;
  onClose: () => void;
}

export default function DrawerHeader({ open, onClose }: DrawerHeaderProps) {
  const theme = useTheme();

  return (
    <DrawerHeaderStyled open={open}>
      <ButtonBase
        component={Link}
        to="/"
        disableRipple
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: open ? 1.5 : 0,
          flex: 1,
          justifyContent: open ? 'flex-start' : 'center',
          '&:hover': {
            opacity: 0.8,
          },
        }}
        aria-label="Logo"
      >
        <Box
          component="img"
          src="/images/logo.png"
          alt="Logo"
          sx={{
            height: open ? 40 : 35,
            width: 'auto',
            objectFit: 'contain',
          }}
        />
      </ButtonBase>
      {open && (
        <IconButton onClick={onClose} size="small">
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      )}
    </DrawerHeaderStyled>
  );
}
