import ExclamationCircleOutlined from '@ant-design/icons/ExclamationCircleOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { withAlpha } from '../utils/colorUtils';
import MainCard from './MainCard';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

interface AnalyticEcommerceProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  title: string;
  count: string;
  percentage?: number;
  isLoss?: boolean;
  extra?: string;
  chartData?: number[];
  chartColor?: string; // 커스텀 차트 색상
  fullHeight?: boolean; // 전체 높이 사용 여부
  pendingCount?: number; // 미답변 문의 수
  showPendingAsChip?: boolean; // 미답변 건수를 Chip으로 표시할지 여부 (기본값: true)
  category?: string; // 카테고리 필터링을 위한 카테고리 값
  showProgressBar?: boolean; // 프로그레스 바 표시 여부
  progressValue?: number; // 프로그레스 바 값 (0-100)
  overdueCount?: number; // 하루 이상 답변하지 않은 문의건수
}

export default function AnalyticEcommerce({
  color = 'primary',
  title,
  count,
  percentage,
  isLoss,
  extra: _extra,
  chartData,
  chartColor,
  fullHeight = false,
  pendingCount,
  showPendingAsChip = true,
  category,
  showProgressBar = false,
  progressValue = 0,
  overdueCount = 0
}: AnalyticEcommerceProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handlePendingClick = () => {
    const params = new URLSearchParams();
    params.set('status', 'Pending');
    if (category && category !== 'all') {
      params.set('category', category);
    }
    navigate(`/?${params.toString()}`);
  };

  const chartColorValue = chartColor || theme.palette[color].main;

  const miniChartData = chartData ? {
    labels: chartData.map(() => ''),
    datasets: [
      {
        data: chartData,
        borderColor: chartColorValue,
        backgroundColor: withAlpha(chartColorValue, 0.1),
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
  };

  // Ripple 애니메이션 정의
  const rippleAnimation = keyframes`
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0.7)};
    }
    50% {
      transform: scale(1);
      box-shadow: 0 0 0 10px ${alpha(theme.palette.error.main, 0)};
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 ${alpha(theme.palette.error.main, 0)};
    }
  `;

  return (
    <MainCard content={false} sx={fullHeight ? { height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' } : { position: 'relative' }}>
      {/* 우측 상단 경고 배지 */}
      {overdueCount !== undefined && overdueCount > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
            animation: `${rippleAnimation} 2s ease-out infinite`,
            cursor: 'pointer',
          }}
          onClick={handlePendingClick}
        >
          <ExclamationCircleOutlined style={{ fontSize: '18px' }} />
        </Box>
      )}
      <Box sx={{ p: 2.25, flex: fullHeight ? 1 : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Grid container sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Grid>
              <Typography variant="h4" color="inherit">
                {count}
              </Typography>
            </Grid>
            {pendingCount !== undefined && pendingCount > 0 && Number(count.replace(/,/g, '')) > 0 && (
              <Grid>
                {showPendingAsChip ? (
                  <Chip
                    label={`미답변 ${pendingCount.toLocaleString()}건`}
                    color="error"
                    size="small"
                    sx={{
                      ml: 1,
                      fontWeight: 500,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    onClick={handlePendingClick}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{
                      ml: 1,
                      fontWeight: 500,
                      cursor: 'pointer',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: (theme) => withAlpha(theme.palette.error.main, 0.1)
                      }
                    }}
                    onClick={handlePendingClick}
                  >
                    미답변 {pendingCount.toLocaleString()}건
                  </Typography>
                )}
              </Grid>
            )}
            {percentage !== undefined && (
              <Grid>
                <Chip
                  variant="outlined"
                  color={color}
                  icon={isLoss ? <FallOutlined style={iconSX} /> : <RiseOutlined style={iconSX} />}
                  label={`${percentage}%`}
                  sx={{ ml: 1.25, pl: 1 }}
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </Stack>
      </Box>
      {showProgressBar ? (
        <Box sx={{ px: 2.25, pb: 2.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette[color].main, 0.2),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: chartColor || theme.palette[color].main,
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
              {progressValue.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      ) : miniChartData ? (
        <Box sx={{ pt: 0, height: fullHeight ? 'auto' : 60, flex: fullHeight ? 1 : 'none', minHeight: fullHeight ? 100 : 60, position: 'relative', width: '100%' }}>
          <Line data={miniChartData} options={chartOptions} />
        </Box>
      ) : null}
    </MainCard>
  );
}
