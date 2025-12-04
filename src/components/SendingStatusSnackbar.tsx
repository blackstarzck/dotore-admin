import { ArrowForward, Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Fade,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SendingStatistics } from '../context/SendingStatusContext';
import GlobalSnackbar from './GlobalSnackbar';

export type SendingStatus = 'request' | 'sending' | 'completed' | 'failed' | null;

interface SendingStatusSnackbarProps {
  open: boolean;
  status: SendingStatus;
  statistics: SendingStatistics | null;
  onViewHistory?: () => string | null | undefined;
  onClose?: () => void;
}

const SendingStatusSnackbar = ({
  open,
  status,
  statistics,
  onViewHistory,
  onClose,
}: SendingStatusSnackbarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (!status) return null;

  const handleViewHistoryClick = () => {
    if (onViewHistory) {
      const historyId = onViewHistory();
      if (historyId) {
        navigate(`/mail-history?historyId=${historyId}`);
      } else {
        navigate('/mail-history');
      }
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case 'request':
        return {
          message: '발송 요청 중...',
          severity: 'info' as const,
          icon: null,
        };
      case 'sending':
        return {
          message: '발송 중...',
          severity: 'info' as const,
          icon: <CircularProgress size={20} />,
        };
      case 'completed':
        return {
          message: '발송이 완료되었습니다.',
          severity: 'success' as const,
        };
      case 'failed':
        return {
          message: '발송에 실패했습니다.',
          severity: 'error' as const,
        };
      default:
        return {
          message: '',
          severity: 'info' as const,
          icon: null,
        };
    }
  };

  const { message, severity, icon } = getStatusContent();

  const transitionProps = {
    timeout: 300,
    easing: {
      enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  };

  return (
    <GlobalSnackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={Fade}
      TransitionProps={transitionProps}
      severity={severity}
      alertIcon={
        icon ? (
          <Fade in={true} timeout={300}>
            <Box component="span">{icon}</Box>
          </Fade>
        ) : undefined
      }
      alertAction={
        <Fade in={true} timeout={300}>
          <IconButton
            size="small"
            onClick={handleClose}
            color="inherit"
            sx={{
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Fade>
      }
      message={
        <Fade in={true} timeout={300}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {message}
            </Typography>
            {status === 'completed' && statistics && (
              <Fade in={true} timeout={500}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      fontSize: '0.875rem',
                      color: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    총 {statistics.totalRecipients.toLocaleString()}명에게 발송 · 성공 {statistics.sentCount.toLocaleString()}건 · 실패 {statistics.failedCount.toLocaleString()}건
                  </Typography>
                  {onViewHistory && (
                    <Fade in={true} timeout={700}>
                      <Button
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={handleViewHistoryClick}
                        sx={{
                          mt: 1.5,
                          textTransform: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                          '&:active': {
                            backgroundColor: 'transparent',
                          },
                        }}
                      >
                        발송 이력 보기
                      </Button>
                    </Fade>
                  )}
                </Box>
              </Fade>
            )}
            {status === 'failed' && statistics && (
              <Fade in={true} timeout={500}>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    fontSize: '0.875rem',
                    color: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  총 {statistics.totalRecipients.toLocaleString()}명 발송 실패
                </Typography>
              </Fade>
            )}
          </Box>
        </Fade>
      }
    />
  );
};

export default SendingStatusSnackbar;
