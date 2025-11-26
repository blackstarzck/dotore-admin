import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import { Download, Info, KeyboardArrowUp, RestartAlt } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from 'chart.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Bubble, Doughnut } from 'react-chartjs-2';
import AnalyticEcommerce from '../components/AnalyticEcommerce';
import MainCard from '../components/MainCard';
import { mockInquiries } from '../data/mockData';
import { InquiryCategory, InquiryStatus, UserType } from '../types/inquiry';
import { generateColorTones } from '../utils/colorUtils';
import { getInquiries } from '../utils/storage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// ==============================|| DONUT CHART WIDGET ||============================== //

type PeriodFilter = 'all' | 'today' | '7days' | '30days';

interface DonutChartWidgetProps {
  title: string;
  inquiries: any[];
  getData: (filteredInquiries: any[]) => { labels: string[]; values: number[]; colors: string[] };
  baseColor: string;
  period?: PeriodFilter;
  onPeriodChange?: (period: PeriodFilter) => void;
  showPeriodSelector?: boolean;
}

const DonutChartWidget = ({ title, inquiries, getData, baseColor, period: externalPeriod, onPeriodChange, showPeriodSelector = true }: DonutChartWidgetProps) => {
  const [internalPeriod, setInternalPeriod] = useState<PeriodFilter>('30days');
  const period = externalPeriod !== undefined ? externalPeriod : internalPeriod;

  const filteredInquiries = useMemo(() => {
    // 전체 선택 시 필터링하지 않음
    if (period === 'all') {
      return inquiries;
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return inquiries;
    }

    return inquiries.filter((inq) => {
      const inquiryDate = new Date(inq.created_at);
      return inquiryDate >= startDate;
    });
  }, [inquiries, period]);

  const { labels, values } = useMemo(() => {
    const result = getData(filteredInquiries);
    return { labels: result.labels, values: result.values };
  }, [filteredInquiries, getData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: '60%',
  };

  const chartDataWithTones = useMemo(() => {
    const tones = generateColorTones(baseColor, values.length);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: tones,
          borderWidth: 0,
        },
      ],
    };
  }, [labels, values, baseColor]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodSelect = (newPeriod: PeriodFilter) => {
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    } else {
      setInternalPeriod(newPeriod);
    }
    handleClose();
  };

  const periodLabels: Record<PeriodFilter, string> = {
    all: '전체',
    today: '오늘',
    '7days': '일주일',
    '30days': '한달',
  };

  return (
    <MainCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          {showPeriodSelector && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClick}
                endIcon={<ArrowDownOutlined />}
              >
                {periodLabels[period]}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handlePeriodSelect('all')}>전체</MenuItem>
                <MenuItem onClick={() => handlePeriodSelect('today')}>오늘</MenuItem>
                <MenuItem onClick={() => handlePeriodSelect('7days')}>일주일</MenuItem>
                <MenuItem onClick={() => handlePeriodSelect('30days')}>한달</MenuItem>
              </Menu>
            </>
          )}
        </Box>
        <Box sx={{ height: 200, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, flexShrink: 0 }}>
          <Doughnut data={chartDataWithTones} options={chartOptions} />
          {(() => {
            const total = values.reduce((sum, val) => sum + val, 0);
            return (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {total.toLocaleString()}
                </Typography>
              </Box>
            );
          })()}
        </Box>
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          {labels.map((label, index) => {
            const total = values.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((values[index] / total) * 100).toFixed(0) : '0';
            return (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: chartDataWithTones.datasets[0].backgroundColor[index],
                    }}
                  />
                  <Typography variant="body2" color="text.primary">
                    {label}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {values[index].toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {percentage}%
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </MainCard>
  );
};

// ==============================|| INQUIRY ANALYSIS PAGE ||============================== //

const InquiryAnalysisPage = () => {
  const theme = useTheme();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const [processingTimePeriod, setProcessingTimePeriod] = useState<PeriodFilter>('30days');
  const [hourlyPeriodFilter, setHourlyPeriodFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hourlyCategoryFilter, setHourlyCategoryFilter] = useState<InquiryCategory | 'all'>('all');
  const [hourlyUserTypeFilter, setHourlyUserTypeFilter] = useState<UserType | 'all'>('all');
  const [hourlyCountryFilter, setHourlyCountryFilter] = useState<string | 'all'>('all');
  const [hourlyTimeRangeFilter, setHourlyTimeRangeFilter] = useState<PeriodFilter>('30days');
  const [inquiryDistributionPeriod, setInquiryDistributionPeriod] = useState<PeriodFilter>('30days');

  // 새로운 섹션 상태
  const [stackedBarStatusFilter, setStackedBarStatusFilter] = useState<'all' | 'answered' | 'pending'>('all');
  const [stackedBarPeriodFilter, setStackedBarPeriodFilter] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  // 커스텀 날짜 범위 상태
  const getTodayString = (date?: Date) => {
    const targetDate = date || new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [customStartDate, setCustomStartDate] = useState<string>(getTodayString());
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayString());

  // 페이지 마운트 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 기간 필터가 변경될 때마다 오늘 날짜(마지막 인덱스)를 자동 선택
  useEffect(() => {
    if (stackedBarPeriodFilter === 'daily') {
      setSelectedBarIndex(29); // 최근 30일 중 마지막 인덱스 (오늘)
    } else if (stackedBarPeriodFilter === 'weekly') {
      setSelectedBarIndex(11); // 최근 12주 중 마지막 인덱스 (이번 주)
    } else if (stackedBarPeriodFilter === 'monthly') {
      setSelectedBarIndex(11); // 최근 12개월 중 마지막 인덱스 (이번 달)
    } else if (stackedBarPeriodFilter === 'custom') {
      // 커스텀 날짜 범위의 경우 마지막 날짜 선택
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setSelectedBarIndex(Math.max(0, days - 1));
    }
  }, [stackedBarPeriodFilter, customStartDate, customEndDate]);

  const inquiries = useMemo(() => {
    const stored = getInquiries();
    return stored.length > 0 ? stored : mockInquiries;
  }, []);


  // 카테고리 라벨 함수 (문의 목록과 동일)
  const getCategoryLabel = (category: InquiryCategory): string => {
    const labels: Record<InquiryCategory, string> = {
      [InquiryCategory.Learning]: '학습',
      [InquiryCategory.Payment]: '결제',
      [InquiryCategory.Instructor]: '강사',
      [InquiryCategory.Content]: '콘텐츠',
      [InquiryCategory.AI_Chatbot]: 'AI챗봇',
      [InquiryCategory.Test]: '테스트 관련',
      [InquiryCategory.Dashboard]: '대시보드 관련',
      [InquiryCategory.InstructorSupport]: '강사 지원 관련',
      [InquiryCategory.PackageEvent]: '패키지/이벤트 관련',
    };
    return labels[category] || category;
  };

  // 카테고리별 통계 데이터
  const categoryStats = useMemo(() => {
    const categories = Object.values(InquiryCategory);
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 48시간(2일) 전

    return categories.map((category) => {
      const categoryInquiries = inquiries.filter((inq) => inq.category === category);
      const total = categoryInquiries.length;
      const answered = categoryInquiries.filter((i) => i.status === InquiryStatus.Answered).length;
      const pending = categoryInquiries.filter((i) => i.status === InquiryStatus.Pending).length;
      // 2일 이상 답변하지 않은 문의건수 계산
      const overdue = categoryInquiries.filter((i) => {
        if (i.status !== InquiryStatus.Pending) return false;
        const createdAt = new Date(i.created_at);
        return createdAt < twoDaysAgo;
      }).length;
      const answerRate = total > 0 ? ((answered / total) * 100).toFixed(1) : '0';

      return {
        category,
        label: getCategoryLabel(category),
        total,
        answered,
        pending,
        overdue,
        answerRate,
      };
    });
  }, [inquiries]);




  // 카테고리별 평균 처리 시간 계산 (관리자별)
  const categoryProcessingTimeByAnswerer = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (processingTimePeriod) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // 기간 내에 답변 완료된 문의만 필터링
    const answeredInquiries = inquiries.filter((inq) => {
      if (inq.status !== InquiryStatus.Answered || !inq.answered_at || !inq.answerer_id) return false;
      const inquiryDate = new Date(inq.created_at);
      return inquiryDate >= startDate;
    });

    // 카테고리별, 관리자별로 그룹화하고 평균 처리 시간 계산
    const categoryAnswererMap: Record<InquiryCategory, Record<string, { total: number; sum: number }>> = {
      [InquiryCategory.Learning]: {},
      [InquiryCategory.Payment]: {},
      [InquiryCategory.Instructor]: {},
      [InquiryCategory.Content]: {},
      [InquiryCategory.AI_Chatbot]: {},
      [InquiryCategory.Test]: {},
      [InquiryCategory.Dashboard]: {},
      [InquiryCategory.InstructorSupport]: {},
      [InquiryCategory.PackageEvent]: {},
    };

    answeredInquiries.forEach((inq) => {
      const created = new Date(inq.created_at);
      const answered = new Date(inq.answered_at!);
      const diffHours = (answered.getTime() - created.getTime()) / (1000 * 60 * 60); // 시간 단위

      const category = inq.category as InquiryCategory;
      const answererId = inq.answerer_id!;

      if (category in categoryAnswererMap) {
        if (!categoryAnswererMap[category][answererId]) {
          categoryAnswererMap[category][answererId] = { total: 0, sum: 0 };
        }
        categoryAnswererMap[category][answererId].total += 1;
        categoryAnswererMap[category][answererId].sum += diffHours;
      }
    });

    // 모든 관리자 ID 수집
    const allAnswererIds = new Set<string>();
    Object.values(categoryAnswererMap).forEach((answererMap) => {
      Object.keys(answererMap).forEach((answererId) => allAnswererIds.add(answererId));
    });
    const answererIds = Array.from(allAnswererIds).sort();

    // 카테고리별로 정렬 (처리된 문의가 있는 카테고리만)
    const categoriesWithData = Object.entries(categoryAnswererMap)
      .filter(([_, answererMap]) => Object.keys(answererMap).length > 0)
      .map(([category]) => category as InquiryCategory);

    return {
      categories: categoriesWithData,
      answererIds,
      data: categoryAnswererMap,
    };
  }, [inquiries, processingTimePeriod]);

  // 처리 시간 포맷팅 함수 (시간 단위로 표시)
  const formatProcessingTime = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}분`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return remainingHours > 0 ? `${days}일 ${remainingHours}시간` : `${days}일`;
    }
  };

  // 카테고리별 전체 평균 처리 시간 계산 (모든 관리자 합친 평균)
  const categoryOverallAverage = useMemo(() => {
    const categoryAnswererMap = categoryProcessingTimeByAnswerer.data;
    const categories = categoryProcessingTimeByAnswerer.categories;

    return categories.map((category) => {
      const answererMap = categoryAnswererMap[category];
      let totalSum = 0;
      let totalCount = 0;

      Object.values(answererMap).forEach((data: any) => {
        totalSum += data.sum;
        totalCount += data.total;
      });

      return totalCount > 0 ? totalSum / totalCount : 0;
    });
  }, [categoryProcessingTimeByAnswerer]);

  // 처리 시간 차트 데이터 (관리자별 바 차트 + 전체 평균 라인)
  const processingTimeChartData = useMemo(() => {
    const labels = categoryProcessingTimeByAnswerer.categories.map((cat) => getCategoryLabel(cat));
    const answererIds = categoryProcessingTimeByAnswerer.answererIds;
    const categoryAnswererMap = categoryProcessingTimeByAnswerer.data;

    // 각 관리자별로 데이터셋 생성
    const colorPalette = [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      (theme.palette.secondary as any).main || theme.palette.secondary.main,
    ];

    const barDatasets = answererIds.map((answererId, index) => {
      const color = colorPalette[index % colorPalette.length];
      const data = categoryProcessingTimeByAnswerer.categories.map((category) => {
        const answererData = categoryAnswererMap[category][answererId];
        if (!answererData || answererData.total === 0) return 0;
        return answererData.sum / answererData.total;
      });

      return {
        label: answererId,
        data,
        backgroundColor: color,
        borderRadius: 5,
        barThickness: 20,
      };
    });

    // 전체 평균 라인 차트 데이터셋 추가
    const lineDataset = {
      label: '전체 평균',
      data: categoryOverallAverage,
      type: 'line' as const,
      borderColor: (theme.palette.secondary as any).main || theme.palette.secondary.main,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: (theme.palette.secondary as any).main || theme.palette.secondary.main,
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointHoverBackgroundColor: (theme.palette.secondary as any).main || theme.palette.secondary.main,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 4,
      tension: 0.4,
      fill: false,
      order: -1, // 레전드에서 맨 위에 표시
    };

    return {
      labels,
      datasets: [...barDatasets, lineDataset], // 라인을 마지막에 배치하여 위에 그려지도록
    } as any;
  }, [categoryProcessingTimeByAnswerer, categoryOverallAverage, theme]);

  // 처리 시간 차트 옵션 (바 차트)
  const processingTimeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    datasets: {
      bar: {
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 14,
            weight: 400,
          },
          color: theme.palette.text.primary,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        callbacks: {
          label: (context: any) => {
            const hours = context.parsed.y;
            if (hours === 0 && context.dataset.type !== 'line') return `${context.dataset.label}: 데이터 없음`;
            return `${context.dataset.label}: ${formatProcessingTime(hours)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
          },
        },
        categoryPercentage: 0.8,
        barPercentage: 1.0,
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return formatProcessingTime(value);
          },
        },
      },
    },
  };

  // CSV 다운로드 핸들러
  const handleExportProcessingTimeCSV = () => {
    const { categories, answererIds, data } = categoryProcessingTimeByAnswerer;

    if (categories.length === 0 || answererIds.length === 0) {
      return;
    }

    // CSV 헤더 생성
    const headers = ['카테고리', ...answererIds.map(id => `관리자 ${id}`), '전체 평균'];
    const csvRows: string[] = [headers.join(',')];

    // 각 카테고리에 대한 데이터 행 생성
    categories.forEach((category) => {
      const categoryLabel = getCategoryLabel(category);
      const row: string[] = [categoryLabel];

      // 각 관리자별 평균 처리 시간 계산
      const answererTimes: number[] = [];
      answererIds.forEach((answererId) => {
        const answererData = data[category]?.[answererId];
        if (answererData && answererData.total > 0) {
          const avgTime = answererData.sum / answererData.total;
          row.push(formatProcessingTime(avgTime));
          answererTimes.push(avgTime);
        } else {
          row.push('-');
        }
      });

      // 전체 평균 처리 시간 계산
      const overallAvg = answererTimes.length > 0
        ? answererTimes.reduce((sum, t) => sum + t, 0) / answererTimes.length
        : 0;
      row.push(overallAvg > 0 ? formatProcessingTime(overallAvg) : '-');

      csvRows.push(row.join(','));
    });

    // CSV 문자열 생성 (BOM 추가로 한글 깨짐 방지)
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `카테고리별_평균_처리시간_${processingTimePeriodLabels[processingTimePeriod]}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleProcessingTimePeriodSelect = (newPeriod: PeriodFilter) => {
    setProcessingTimePeriod(newPeriod);
  };

  const processingTimePeriodLabels: Record<PeriodFilter, string> = {
    all: '전체',
    today: '오늘',
    '7days': '일주일',
    '30days': '한달',
  };

  return (
    <>
      {/* 문의 현황 분석 섹션 */}
      <Grid container spacing={2} sx={{ mb: 4.5 }}>
        <Grid size={{ xs: 12 }}>
          <MainCard>
            <Box sx={{ p: 2 }}>
              {/* 필터 영역 */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ButtonGroup
                    variant="outlined"
                    aria-label="상태 필터"
                    sx={{ '& .MuiButton-root': { height: '40px' } }}
                  >
                    <Button
                      onClick={() => setStackedBarStatusFilter('all')}
                      sx={{
                        fontWeight: stackedBarStatusFilter === 'all' ? 600 : 400,
                        color: stackedBarStatusFilter === 'all' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      전체
                    </Button>
                    <Button
                      onClick={() => setStackedBarStatusFilter('answered')}
                      sx={{
                        fontWeight: stackedBarStatusFilter === 'answered' ? 600 : 400,
                        color: stackedBarStatusFilter === 'answered' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      답변
                    </Button>
                    <Button
                      onClick={() => setStackedBarStatusFilter('pending')}
                      sx={{
                        fontWeight: stackedBarStatusFilter === 'pending' ? 600 : 400,
                        color: stackedBarStatusFilter === 'pending' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      미답변
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup
                    variant="outlined"
                    aria-label="기간 필터"
                    sx={{ '& .MuiButton-root': { height: '40px' } }}
                  >
                    <Button
                      onClick={() => {
                        const today = new Date();
                        const startDate = new Date(today);
                        startDate.setDate(startDate.getDate() - 29); // 최근 30일
                        setCustomStartDate(getTodayString(startDate));
                        setCustomEndDate(getTodayString(today));
                        setStackedBarPeriodFilter('daily');
                      }}
                      sx={{
                        fontWeight: stackedBarPeriodFilter === 'daily' ? 600 : 400,
                        color: stackedBarPeriodFilter === 'daily' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      일간
                    </Button>
                    <Button
                      onClick={() => {
                        const today = new Date();
                        const startDate = new Date(today);
                        startDate.setDate(startDate.getDate() - (startDate.getDay() + 11 * 7)); // 최근 12주 시작일
                        setCustomStartDate(getTodayString(startDate));
                        setCustomEndDate(getTodayString(today));
                        setStackedBarPeriodFilter('weekly');
                      }}
                      sx={{
                        fontWeight: stackedBarPeriodFilter === 'weekly' ? 600 : 400,
                        color: stackedBarPeriodFilter === 'weekly' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      주간
                    </Button>
                    <Button
                      onClick={() => {
                        const today = new Date();
                        const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // 최근 12개월 시작일
                        setCustomStartDate(getTodayString(startDate));
                        setCustomEndDate(getTodayString(today));
                        setStackedBarPeriodFilter('monthly');
                      }}
                      sx={{
                        fontWeight: stackedBarPeriodFilter === 'monthly' ? 600 : 400,
                        color: stackedBarPeriodFilter === 'monthly' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      월간
                    </Button>
                  </ButtonGroup>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="date"
                      size="small"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setStackedBarPeriodFilter('custom');
                      }}
                      sx={{ width: 150 }}
                      InputLabelProps={{ shrink: true }}
                      label="시작일"
                    />
                    <Typography variant="body2" color="text.secondary">
                      ~
                    </Typography>
                    <TextField
                      type="date"
                      size="small"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setStackedBarPeriodFilter('custom');
                      }}
                      sx={{ width: 150 }}
                      InputLabelProps={{ shrink: true }}
                      label="종료일"
                    />
                  </Box>
                </Box>
              </Box>

              {/* 스택형 바차트 데이터 계산 */}
              {(() => {
                const filteredInquiries = inquiries.filter((inq) => {
                  if (stackedBarStatusFilter === 'answered') {
                    return inq.status === InquiryStatus.Answered;
                  } else if (stackedBarStatusFilter === 'pending') {
                    return inq.status === InquiryStatus.Pending;
                  }
                  return true;
                });

                const now = new Date();
                let labels: string[] = [];
                let answeredData: number[] = [];
                let pendingData: number[] = [];
                let barInquiries: any[][] = []; // 각 바에 해당하는 문의들

                if (stackedBarPeriodFilter === 'daily') {
                  // 최근 30일 데이터
                  const days = 30;
                  labels = [];
                  answeredData = new Array(days).fill(0);
                  pendingData = new Array(days).fill(0);
                  barInquiries = new Array(days).fill(null).map(() => []);

                  for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                    labels.push(dayLabel);

                    // 날짜 문자열에서 날짜 부분만 추출 (YYYY-MM-DD)
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                    const index = days - 1 - i;

                    // 이미 추가된 문의 ID를 추적하여 중복 방지
                    const addedIds = new Set<string>();

                    filteredInquiries.forEach((inq) => {
                      // created_at에서 날짜 부분만 추출 (YYYY-MM-DD)
                      const inquiryDateStr = inq.created_at.substring(0, 10);
                      if (inquiryDateStr === dateStr && !addedIds.has(inq.id)) {
                        addedIds.add(inq.id);
                        barInquiries[index].push(inq);
                        if (inq.status === InquiryStatus.Answered) {
                          answeredData[index]++;
                        } else {
                          pendingData[index]++;
                        }
                      }
                    });
                  }
                } else if (stackedBarPeriodFilter === 'weekly') {
                  // 최근 12주 데이터
                  const weeks = 12;
                  labels = [];
                  answeredData = new Array(weeks).fill(0);
                  pendingData = new Array(weeks).fill(0);
                  barInquiries = new Array(weeks).fill(null).map(() => []);

                  for (let i = weeks - 1; i >= 0; i--) {
                    const weekStart = new Date(now);
                    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 7);

                    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
                    labels.push(weekLabel);

                    const index = weeks - 1 - i;
                    const addedIds = new Set<string>();

                    filteredInquiries.forEach((inq) => {
                      const inquiryDate = new Date(inq.created_at);
                      inquiryDate.setHours(0, 0, 0, 0); // 시간 부분 제거하여 날짜만 비교
                      if (inquiryDate >= weekStart && inquiryDate < weekEnd && !addedIds.has(inq.id)) {
                        addedIds.add(inq.id);
                        barInquiries[index].push(inq);
                        if (inq.status === InquiryStatus.Answered) {
                          answeredData[index]++;
                        } else {
                          pendingData[index]++;
                        }
                      }
                    });
                  }
                } else if (stackedBarPeriodFilter === 'monthly') {
                  // 최근 12개월 데이터
                  const months = 12;
                  labels = [];
                  answeredData = new Array(months).fill(0);
                  pendingData = new Array(months).fill(0);
                  barInquiries = new Array(months).fill(null).map(() => []);

                  for (let i = months - 1; i >= 0; i--) {
                    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

                    const monthLabel = `${monthStart.getMonth() + 1}월`;
                    labels.push(monthLabel);

                    const index = months - 1 - i;
                    const addedIds = new Set<string>();

                    filteredInquiries.forEach((inq) => {
                      const inquiryDate = new Date(inq.created_at);
                      inquiryDate.setHours(0, 0, 0, 0); // 시간 부분 제거하여 날짜만 비교
                      if (inquiryDate >= monthStart && inquiryDate < monthEnd && !addedIds.has(inq.id)) {
                        addedIds.add(inq.id);
                        barInquiries[index].push(inq);
                        if (inq.status === InquiryStatus.Answered) {
                          answeredData[index]++;
                        } else {
                          pendingData[index]++;
                        }
                      }
                    });
                  }
                } else if (stackedBarPeriodFilter === 'custom') {
                  // 커스텀 날짜 범위 데이터
                  const startDate = new Date(customStartDate);
                  startDate.setHours(0, 0, 0, 0);
                  const endDate = new Date(customEndDate);
                  endDate.setHours(23, 59, 59, 999);

                  // 시작일과 종료일 사이의 모든 날짜 생성
                  const dateArray: Date[] = [];
                  const currentDate = new Date(startDate);
                  while (currentDate <= endDate) {
                    dateArray.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                  }

                  const days = dateArray.length;
                  labels = [];
                  answeredData = new Array(days).fill(0);
                  pendingData = new Array(days).fill(0);
                  barInquiries = new Array(days).fill(null).map(() => []);

                  dateArray.forEach((date, index) => {
                    const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
                    labels.push(dayLabel);

                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const addedIds = new Set<string>();

                    filteredInquiries.forEach((inq) => {
                      const inquiryDateStr = inq.created_at.substring(0, 10);
                      if (inquiryDateStr === dateStr && !addedIds.has(inq.id)) {
                        addedIds.add(inq.id);
                        barInquiries[index].push(inq);
                        if (inq.status === InquiryStatus.Answered) {
                          answeredData[index]++;
                        } else {
                          pendingData[index]++;
                        }
                      }
                    });
                  });
                }

                // 카테고리별 평균 처리 시간 차트와 동일한 색상 팔레트 사용
                const baseColorPalette = [
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.success.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                  (theme.palette.secondary as any).main || theme.palette.secondary.main,
                ];

                // 답변: primary.main, 미답변: info.main 사용
                const answeredColor = baseColorPalette[0]; // primary.main
                const pendingColor = baseColorPalette[1]; // info.main

                // 선택된 바는 더 진한 색상으로
                const answeredColorDark = theme.palette.primary.dark;
                const pendingColorDark = theme.palette.info.dark;

                const stackedBarChartData = {
                  labels,
                  datasets: [
                    {
                      label: '답변',
                      data: answeredData,
                      backgroundColor: labels.map((_, index) =>
                        selectedBarIndex === index
                          ? answeredColorDark
                          : answeredColor
                      ),
                      borderRadius: 4,
                    },
                    {
                      label: '미답변',
                      data: pendingData,
                      backgroundColor: labels.map((_, index) =>
                        selectedBarIndex === index
                          ? pendingColorDark
                          : pendingColor
                      ),
                      borderRadius: 4,
                    },
                  ],
                };

                const stackedBarChartOptions: any = {
                  responsive: true,
                  maintainAspectRatio: false,
                  datasets: {
                    bar: {
                      barPercentage: 1,
                      categoryPercentage: 0.4,
                    },
                  },
                  interaction: {
                    mode: 'index' as const,
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: theme.palette.background.paper,
                      titleColor: theme.palette.text.primary,
                      bodyColor: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                      borderWidth: 1,
                      padding: 12,
                      callbacks: {
                        label: (context: any) => {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y || 0;
                          return `${label}: ${value}건`;
                        },
                      },
                    },
                    // 선택된 날짜의 x축 틱에 배경색 추가
                    ...(selectedBarIndex !== null && {
                      afterDraw: (chart: any) => {
                        const ctx = chart.ctx;
                        const chartArea = chart.chartArea;
                        const meta = chart.getDatasetMeta(0);
                        const xScale = chart.scales.x;

                        if (xScale && meta && selectedBarIndex !== null) {
                          const tickIndex = selectedBarIndex;
                          const tick = xScale.ticks[tickIndex];

                          if (tick) {
                            const tickPosition = xScale.getPixelForValue(tickIndex);
                            const tickWidth = xScale.width / (xScale.ticks.length - 1);

                            // 배경색 그리기
                            ctx.save();
                            ctx.fillStyle = alpha(theme.palette.primary.main, 0.1);
                            ctx.fillRect(
                              tickPosition - tickWidth / 2,
                              chartArea.top,
                              tickWidth,
                              chartArea.bottom - chartArea.top
                            );
                            ctx.restore();
                          }
                        }
                      },
                    }),
                  },
                  scales: {
                    x: {
                      stacked: true,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        font: (context: any) => {
                          const isSelected = selectedBarIndex !== null && context.index === selectedBarIndex;
                          return {
                            size: 11,
                            weight: isSelected ? 600 : 400,
                          };
                        },
                        color: (context: any) => {
                          const isSelected = selectedBarIndex !== null && context.index === selectedBarIndex;
                          return isSelected ? theme.palette.primary.main : theme.palette.text.secondary;
                        },
                      },
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true,
                      grid: {
                        color: theme.palette.divider,
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                        color: theme.palette.text.secondary,
                      },
                    },
                  },
                  onClick: (_event: any, elements: any[]) => {
                    if (elements.length > 0) {
                      const element = elements[0];
                      const index = element.index;
                      setSelectedBarIndex(index);
                    }
                  },
                };

                const selectedBarInquiries = selectedBarIndex !== null ? barInquiries[selectedBarIndex] || [] : [];

                // 중복 제거: 같은 ID를 가진 문의가 여러 번 포함되지 않도록
                const uniqueBarInquiries = selectedBarInquiries.filter((inq, index, self) =>
                  index === self.findIndex((t) => t.id === inq.id)
                );

                // 선택된 바의 상세 정보 계산
                const selectedCategoryCounts: Record<string, number> = {};
                const selectedUserTypeCounts: Record<string, number> = {};
                const selectedCountryCounts: Record<string, number> = {};

                const getCountryLabel = (countryCode: string): string => {
                  const countryLabels: Record<string, string> = {
                    KR: '대한민국',
                    US: '미국',
                    CN: '중국',
                    JP: '일본',
                    GB: '영국',
                    FR: '프랑스',
                    DE: '독일',
                    IT: '이탈리아',
                    ES: '스페인',
                    CA: '캐나다',
                    AU: '호주',
                    BR: '브라질',
                    IN: '인도',
                    MX: '멕시코',
                    RU: '러시아',
                  };
                  return countryLabels[countryCode] || countryCode;
                };

                uniqueBarInquiries.forEach((inq) => {
                  // 카테고리별
                  const categoryLabel = getCategoryLabel(inq.category);
                  selectedCategoryCounts[categoryLabel] = (selectedCategoryCounts[categoryLabel] || 0) + 1;

                  // 작성자 유형별
                  const userTypeLabel = inq.user_type === UserType.Student ? '학생' : inq.user_type === UserType.Instructor ? '강사' : '제휴';
                  selectedUserTypeCounts[userTypeLabel] = (selectedUserTypeCounts[userTypeLabel] || 0) + 1;

                  // 국적별
                  const countryLabel = getCountryLabel(inq.user_country);
                  selectedCountryCounts[countryLabel] = (selectedCountryCounts[countryLabel] || 0) + 1;
                });

                return (
                  <>
                    {/* 바차트 */}
                    <Box sx={{ height: 400, mb: 3 }}>
                      <Bar data={stackedBarChartData} options={stackedBarChartOptions} />
                    </Box>

                    {/* 선택된 바의 상세 정보 */}
                    {selectedBarIndex !== null && (
                      <Box sx={{ mt: 4 }}>
                        {/* 상세 정보 테이블 */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  카테고리별
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                  {Object.values(selectedCategoryCounts).reduce((sum, count) => sum + count, 0).toLocaleString()}
                                </Typography>
                              </Box>
                              {Object.keys(selectedCategoryCounts).length > 0 ? (
                                <Stack spacing={1}>
                                  {Object.entries(selectedCategoryCounts)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([label, count]) => (
                                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">{label}</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {count}
                                        </Typography>
                                      </Box>
                                    ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  데이터 없음
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  작성자 유형별
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                  {Object.values(selectedUserTypeCounts).reduce((sum, count) => sum + count, 0).toLocaleString()}
                                </Typography>
                              </Box>
                              {Object.keys(selectedUserTypeCounts).length > 0 ? (
                                <Stack spacing={1}>
                                  {Object.entries(selectedUserTypeCounts)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([label, count]) => (
                                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">{label}</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {count}
                                        </Typography>
                                      </Box>
                                    ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  데이터 없음
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1.5, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, height: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  국적별
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                  {Object.values(selectedCountryCounts).reduce((sum, count) => sum + count, 0).toLocaleString()}
                                </Typography>
                              </Box>
                              {Object.keys(selectedCountryCounts).length > 0 ? (
                                <Stack spacing={1}>
                                  {Object.entries(selectedCountryCounts)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([label, count]) => (
                                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">{label}</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {count}
                                        </Typography>
                                      </Box>
                                    ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  데이터 없음
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </>
                );
              })()}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Grid container rowSpacing={4.5} columnSpacing={2.75} sx={{ alignItems: 'stretch' }}>
        {/* 문의 분포 섹션 */}
        <Grid sx={{ mb: -2.25 }} size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h5">문의 분포</Typography>
              <Typography variant="body2" color="text.secondary">
                문의 접수 현황 분석
              </Typography>
            </Box>
            <Box>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel>기간</InputLabel>
                <Select
                  value={inquiryDistributionPeriod}
                  onChange={(e) => setInquiryDistributionPeriod(e.target.value as PeriodFilter)}
                  label="기간"
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="today">오늘</MenuItem>
                  <MenuItem value="7days">일주일</MenuItem>
                  <MenuItem value="30days">한달</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <DonutChartWidget
            title="카테고리별 분포"
            inquiries={inquiries}
            baseColor={theme.palette.primary.main}
            period={inquiryDistributionPeriod}
            onPeriodChange={setInquiryDistributionPeriod}
            showPeriodSelector={false}
            getData={(filteredInquiries) => {
              const counts: Record<InquiryCategory, number> = {
                [InquiryCategory.Learning]: 0,
                [InquiryCategory.Payment]: 0,
                [InquiryCategory.Instructor]: 0,
                [InquiryCategory.Content]: 0,
                [InquiryCategory.AI_Chatbot]: 0,
                [InquiryCategory.Test]: 0,
                [InquiryCategory.Dashboard]: 0,
                [InquiryCategory.InstructorSupport]: 0,
                [InquiryCategory.PackageEvent]: 0,
              };

              filteredInquiries.forEach((inq) => {
                const category = inq.category as InquiryCategory;
                if (category in counts) {
                  counts[category]++;
                }
              });

              // 모든 카테고리 포함 (문의 목록과 동일)
              const allCategories = Object.values(InquiryCategory);

              // 값이 0보다 큰 카테고리만 필터링
              const filteredData = allCategories
                .map((cat) => ({
                  label: getCategoryLabel(cat),
                  value: counts[cat] || 0,
                }))
                .filter((item) => item.value > 0)
                .sort((a, b) => b.value - a.value);

              return {
                labels: filteredData.map((item) => item.label),
                values: filteredData.map((item) => item.value),
                colors: [],
              };
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <DonutChartWidget
            title="작성자 유형"
            inquiries={inquiries}
            baseColor={theme.palette.info.main}
            period={inquiryDistributionPeriod}
            onPeriodChange={setInquiryDistributionPeriod}
            showPeriodSelector={false}
            getData={(filteredInquiries) => {
              const counts: Record<UserType, number> = {
                [UserType.Student]: 0,
                [UserType.Instructor]: 0,
                [UserType.Partner]: 0,
              };

              filteredInquiries.forEach((inq) => {
                const userType = inq.user_type as UserType;
                if (userType in counts) {
                  counts[userType]++;
                }
              });

              return {
                labels: ['학생', '강사', '제휴'],
                values: [
                  counts[UserType.Student],
                  counts[UserType.Instructor],
                  counts[UserType.Partner],
                ],
                colors: [],
              };
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <DonutChartWidget
            title="국적별 분포"
            inquiries={inquiries}
            baseColor={theme.palette.warning.main}
            period={inquiryDistributionPeriod}
            onPeriodChange={setInquiryDistributionPeriod}
            showPeriodSelector={false}
            getData={(filteredInquiries) => {
              const counts: Record<string, number> = {};

              filteredInquiries.forEach((inq) => {
                const country = inq.user_country;
                counts[country] = (counts[country] || 0) + 1;
              });

              // 상위 5개 국적만 표시
              const sorted = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

              const countryLabels: Record<string, string> = {
                KR: '대한민국',
                US: '미국',
                CN: '중국',
                JP: '일본',
                GB: '영국',
                FR: '프랑스',
                DE: '독일',
                IT: '이탈리아',
                ES: '스페인',
                CA: '캐나다',
                AU: '호주',
                BR: '브라질',
                IN: '인도',
                MX: '멕시코',
                RU: '러시아',
              };

              return {
                labels: sorted.map(([country]) => countryLabels[country] || country),
                values: sorted.map(([, count]) => count),
                colors: [],
              };
            }}
          />
        </Grid>

        {/* row 1 */}
        <Grid sx={{ mb: -2.25 }} size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5">문의 분석</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                2일 이상 지난 문의는 경고표시가 나타납니다.
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* 전체 문의 카드 - 왼쪽 큰 영역 */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <AnalyticEcommerce
            title="전체 문의"
            count={inquiries.length.toLocaleString()}
            color="primary"
            fullHeight={true}
            pendingCount={inquiries.filter((inq) => inq.status === InquiryStatus.Pending).length}
            overdueCount={(() => {
              const now = new Date();
              const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
              return inquiries.filter((inq) => {
                if (inq.status !== InquiryStatus.Pending) return false;
                const createdAt = new Date(inq.created_at);
                return createdAt < twoDaysAgo;
              }).length;
            })()}
            showProgressBar={true}
            progressValue={(() => {
              const total = inquiries.length;
              const answered = inquiries.filter((inq) => inq.status === InquiryStatus.Answered).length;
              return total > 0 ? (answered / total) * 100 : 0;
            })()}
          />
        </Grid>
        {/* 카테고리별 카드들 - 오른쪽 영역 */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Grid container rowSpacing={2} columnSpacing={2} sx={{ flex: 1, alignContent: 'flex-start' }}>
            {categoryStats.map((stat) => {
              // 전체 문의(primary)보다 한 단계 더 낮은(밝은) 톤 사용
              const categoryChartColor = (theme.palette.primary as any)[200] || (theme.palette.primary as any)[100] || theme.palette.primary.light;
              // 각 카테고리 내에서 답변 완료율 계산
              const progressPercentage = stat.total > 0 ? (stat.answered / stat.total) * 100 : 0;
              return (
                <Grid key={stat.category} size={{ xs: 6, sm: 4, md: 3, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <AnalyticEcommerce
                    title={stat.label}
                    count={stat.total.toLocaleString()}
                    color="primary"
                    chartColor={categoryChartColor}
                    pendingCount={stat.pending}
                    showPendingAsChip={false}
                    category={stat.category}
                    fullHeight={true}
                    showProgressBar={true}
                    progressValue={progressPercentage}
                    overdueCount={stat.overdue}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* 카테고리별 평균 처리 시간 섹션 */}
        <Grid sx={{ mb: -2.25 }} size={12}>
          <Box>
            <Typography variant="h5">카테고리별 평균 처리 시간</Typography>
            <Typography variant="body2" color="text.secondary">
              접수된 문의가 처리되기까지 소요된 시간
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <MainCard>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>기간</InputLabel>
                  <Select
                    value={processingTimePeriod}
                    onChange={(e) => handleProcessingTimePeriodSelect(e.target.value as 'today' | '7days' | '30days')}
                    label="기간"
                  >
                    <MenuItem value="today">오늘</MenuItem>
                    <MenuItem value="7days">일주일</MenuItem>
                    <MenuItem value="30days">한달</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="CSV 다운로드">
                  <IconButton
                    size="medium"
                    onClick={handleExportProcessingTimeCSV}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {categoryProcessingTimeByAnswerer.categories.length > 0 && categoryProcessingTimeByAnswerer.answererIds.length > 0 ? (
                <Box sx={{ height: 400 }}>
                  <Bar data={processingTimeChartData} options={processingTimeChartOptions} />
                </Box>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    선택한 기간에 처리된 문의가 없습니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </MainCard>
        </Grid>

        {/* 국적별 시간대 분석 섹션 */}
        <Grid sx={{ mb: -2.25 }} size={12}>
          <Box>
            <Typography variant="h5">전체 시간대별 문의 분포</Typography>
            <Typography variant="body2" color="text.secondary">
              시간대별 문의 접수 현황 분석
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <MainCard>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  {/* 기간 필터 */}
                  <ButtonGroup
                    variant="outlined"
                    aria-label="기간 필터"
                    sx={{ '& .MuiButton-root': { height: '40px' } }}
                  >
                    <Button
                      onClick={() => setHourlyPeriodFilter('daily')}
                      sx={{
                        fontWeight: hourlyPeriodFilter === 'daily' ? 600 : 400,
                        color: hourlyPeriodFilter === 'daily' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      일간
                    </Button>
                    <Button
                      onClick={() => setHourlyPeriodFilter('weekly')}
                      sx={{
                        fontWeight: hourlyPeriodFilter === 'weekly' ? 600 : 400,
                        color: hourlyPeriodFilter === 'weekly' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      주간
                    </Button>
                    <Button
                      onClick={() => setHourlyPeriodFilter('monthly')}
                      sx={{
                        fontWeight: hourlyPeriodFilter === 'monthly' ? 600 : 400,
                        color: hourlyPeriodFilter === 'monthly' ? 'primary.main' : 'text.secondary',
                        textTransform: 'none',
                      }}
                    >
                      월간
                    </Button>
                  </ButtonGroup>

                  {/* 카테고리 필터 */}
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                      value={hourlyCategoryFilter}
                      onChange={(e) => setHourlyCategoryFilter(e.target.value as InquiryCategory | 'all')}
                      label="카테고리"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      {Object.values(InquiryCategory).map((category) => (
                        <MenuItem key={category} value={category}>
                          {getCategoryLabel(category)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 학습자 유형 필터 */}
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>학습자 유형</InputLabel>
                    <Select
                      value={hourlyUserTypeFilter}
                      onChange={(e) => setHourlyUserTypeFilter(e.target.value as UserType | 'all')}
                      label="학습자 유형"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      {Object.values(UserType).map((userType) => (
                        <MenuItem key={userType} value={userType}>
                          {userType === UserType.Student ? '학습자' : userType === UserType.Instructor ? '강사' : userType === UserType.Partner ? '제휴사' : userType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* 국적 필터 */}
                  {(() => {
                    const countries = useMemo(() => {
                      const countrySet = new Set<string>();
                      inquiries.forEach(inq => countrySet.add(inq.user_country));
                      return Array.from(countrySet).sort();
                    }, [inquiries]);

                    const getCountryLabel = (countryCode: string): string => {
                      const countryLabels: Record<string, string> = {
                        KR: '대한민국',
                        US: '미국',
                        CN: '중국',
                        JP: '일본',
                        GB: '영국',
                        FR: '프랑스',
                        DE: '독일',
                        IT: '이탈리아',
                        ES: '스페인',
                        CA: '캐나다',
                        AU: '호주',
                        BR: '브라질',
                        IN: '인도',
                        MX: '멕시코',
                        RU: '러시아',
                      };
                      return countryLabels[countryCode] || countryCode;
                    };

                    return (
                      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>국적</InputLabel>
                        <Select
                          value={hourlyCountryFilter}
                          onChange={(e) => setHourlyCountryFilter(e.target.value as string | 'all')}
                          label="국적"
                        >
                          <MenuItem value="all">전체</MenuItem>
                          {countries.map((country) => (
                            <MenuItem key={country} value={country}>
                              {getCountryLabel(country)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                })()}

                <Tooltip title="CSV 다운로드">
                  <IconButton
                    size="medium"
                    onClick={handleExportProcessingTimeCSV}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {(() => {
                // 국적 목록 추출
                const countries = useMemo(() => {
                  const countrySet = new Set<string>();
                  inquiries.forEach(inq => countrySet.add(inq.user_country));
                  return Array.from(countrySet).sort();
                }, [inquiries]);

                const getCountryLabel = (countryCode: string): string => {
                  const countryLabels: Record<string, string> = {
                    KR: '대한민국',
                    US: '미국',
                    CN: '중국',
                    JP: '일본',
                    GB: '영국',
                    FR: '프랑스',
                    DE: '독일',
                    IT: '이탈리아',
                    ES: '스페인',
                    CA: '캐나다',
                    AU: '호주',
                    BR: '브라질',
                    IN: '인도',
                    MX: '멕시코',
                    RU: '러시아',
                  };
                  return countryLabels[countryCode] || countryCode;
                };

                // 기간 필터링된 문의 데이터
                const filteredInquiriesByTimeRange = useMemo(() => {
                  const now = new Date();
                  let startDate: Date;

                  switch (hourlyTimeRangeFilter) {
                    case 'today':
                      startDate = new Date(now);
                      startDate.setHours(0, 0, 0, 0);
                      break;
                    case '7days':
                      startDate = new Date(now);
                      startDate.setDate(startDate.getDate() - 7);
                      startDate.setHours(0, 0, 0, 0);
                      break;
                    case '30days':
                      startDate = new Date(now);
                      startDate.setDate(startDate.getDate() - 30);
                      startDate.setHours(0, 0, 0, 0);
                      break;
                    default:
                      return inquiries;
                  }

                  return inquiries.filter((inq) => {
                    const inquiryDate = new Date(inq.created_at);
                    return inquiryDate >= startDate;
                  });
                }, [inquiries, hourlyTimeRangeFilter]);

                // 각 국적별 시간대별 문의 건수 계산
                const hourlyDataByCountry = useMemo(() => {
                  const data: Record<string, number[]> = {};

                  countries.forEach(country => {
                    const hours = Array(24).fill(0);
                    filteredInquiriesByTimeRange
                      .filter(inq => inq.user_country === country)
                      .forEach((inq) => {
                        const date = new Date(inq.created_at);
                        const hour = date.getUTCHours();
                        hours[hour]++;
                      });
                    data[country] = hours;
                  });

                  return data;
                }, [filteredInquiriesByTimeRange, countries]);


                // 필터링된 문의 데이터
                const filteredInquiries = useMemo(() => {
                  return inquiries.filter((inq) => {
                    if (hourlyCategoryFilter !== 'all' && inq.category !== hourlyCategoryFilter) return false;
                    if (hourlyUserTypeFilter !== 'all' && inq.user_type !== hourlyUserTypeFilter) return false;
                    if (hourlyCountryFilter !== 'all' && inq.user_country !== hourlyCountryFilter) return false;
                    return true;
                  });
                }, [inquiries, hourlyCategoryFilter, hourlyUserTypeFilter, hourlyCountryFilter]);

                // 통일된 색상 팔레트 생성 (모든 필터에 동일한 색상 사용)
                const unifiedBaseColor = theme.palette.primary.main;

                const getCategoryColors = useMemo(() => {
                  const categories = Object.values(InquiryCategory);
                  const tones = generateColorTones(unifiedBaseColor, categories.length);
                  const colorMap: Record<InquiryCategory, string> = {} as Record<InquiryCategory, string>;
                  categories.forEach((category, index) => {
                    colorMap[category] = tones[index];
                  });
                  return colorMap;
                }, [unifiedBaseColor]);

                const getUserTypeColors = useMemo(() => {
                  const userTypes = Object.values(UserType);
                  const tones = generateColorTones(unifiedBaseColor, userTypes.length);
                  const colorMap: Record<UserType, string> = {} as Record<UserType, string>;
                  userTypes.forEach((userType, index) => {
                    colorMap[userType] = tones[index];
                  });
                  return colorMap;
                }, [unifiedBaseColor]);

                const getCountryColors = useMemo(() => {
                  const countryList = Array.from(countries).sort();
                  const tones = generateColorTones(unifiedBaseColor, countryList.length);
                  const colorMap: Record<string, string> = {};
                  countryList.forEach((country, index) => {
                    colorMap[country] = tones[index];
                  });
                  return colorMap;
                }, [countries, unifiedBaseColor]);

                // 날짜별 x 시간대별 문의 건수 계산 (기간 필터에 따라)
                const dateHourData = useMemo(() => {
                  const now = new Date();
                  const data: Array<{ date: Date; hour: number; count: number; category?: InquiryCategory; userType?: UserType; country?: string }> = [];

                  if (hourlyPeriodFilter === 'daily') {
                    // 일간: 최근 30일
                    const days = 30;
                    // 일간 필터일 때는 모든 날짜를 포함하기 위해 날짜 범위 계산
                    const startDate = new Date(now);
                    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
                    startDate.setUTCHours(0, 0, 0, 0);
                    const endDate = new Date(now);
                    endDate.setUTCHours(23, 59, 59, 999);

                    for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
                      const date = new Date(now);
                      date.setUTCDate(date.getUTCDate() - dayOffset);
                      date.setUTCHours(0, 0, 0, 0);

                      for (let hour = 0; hour < 24; hour++) {
                        const hourStart = new Date(date);
                        hourStart.setUTCHours(hour, 0, 0, 0);
                        const hourEnd = new Date(date);
                        hourEnd.setUTCHours(hour, 59, 59, 999);

                        // 필터별로 그룹화하여 데이터 생성
                        if (hourlyCategoryFilter !== 'all') {
                          // 카테고리별로 그룹화
                          const categoryGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            if (inquiryDate >= hourStart && inquiryDate <= hourEnd) {
                              if (!acc[inq.category]) acc[inq.category] = [];
                              acc[inq.category].push(inq);
                            }
                            return acc;
                          }, {} as Record<InquiryCategory, typeof filteredInquiries>);

                          Object.entries(categoryGroups).forEach(([category, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            // count가 0보다 큰 경우에만 데이터 추가
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(date),
                                hour,
                                count: inquiries.length,
                                category: category as InquiryCategory,
                              });
                            }
                          });
                        } else if (hourlyUserTypeFilter !== 'all') {
                          // 학습자 유형별로 그룹화
                          const userTypeGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            if (inquiryDate >= hourStart && inquiryDate <= hourEnd) {
                              if (!acc[inq.user_type]) acc[inq.user_type] = [];
                              acc[inq.user_type].push(inq);
                            }
                            return acc;
                          }, {} as Record<UserType, typeof filteredInquiries>);

                          Object.entries(userTypeGroups).forEach(([userType, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            // count가 0보다 큰 경우에만 데이터 추가
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(date),
                                hour,
                                count: inquiries.length,
                                userType: userType as UserType,
                              });
                            }
                          });
                        } else if (hourlyCountryFilter !== 'all') {
                          // 국적별로 그룹화
                          const countryGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            if (inquiryDate >= hourStart && inquiryDate <= hourEnd) {
                              if (!acc[inq.user_country]) acc[inq.user_country] = [];
                              acc[inq.user_country].push(inq);
                            }
                            return acc;
                          }, {} as Record<string, typeof filteredInquiries>);

                          Object.entries(countryGroups).forEach(([country, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            // count가 0보다 큰 경우에만 데이터 추가
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(date),
                                hour,
                                count: inquiries.length,
                                country,
                              });
                            }
                          });
                        } else {
                          // 전체 필터인 경우
                          const count = filteredInquiries.filter((inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            return inquiryDate >= hourStart && inquiryDate <= hourEnd;
                          }).length;

                          // count가 0보다 큰 경우에만 데이터 추가
                          if (count > 0) {
                            data.push({
                              date: new Date(date),
                              hour,
                              count,
                            });
                          }
                        }
                      }
                    }
                  } else if (hourlyPeriodFilter === 'weekly') {
                    // 주간: 최근 12주
                    const weeks = 12;
                    for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset--) {
                      const weekStart = new Date(now);
                      weekStart.setUTCDate(weekStart.getUTCDate() - (weekStart.getUTCDay() + weekOffset * 7));
                      weekStart.setUTCHours(0, 0, 0, 0);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
                      weekEnd.setUTCHours(23, 59, 59, 999);

                      // 주의 중간 날짜를 대표 날짜로 사용
                      const representativeDate = new Date(weekStart);
                      representativeDate.setUTCDate(representativeDate.getUTCDate() + 3);

                      // 각 시간대별로 해당 주의 모든 날짜의 문의를 합산
                      for (let hour = 0; hour < 24; hour++) {
                        const count = filteredInquiries.filter((inq) => {
                          const inquiryDate = new Date(inq.created_at);
                          const inquiryUTCDate = new Date(Date.UTC(
                            inquiryDate.getUTCFullYear(),
                            inquiryDate.getUTCMonth(),
                            inquiryDate.getUTCDate(),
                            inquiryDate.getUTCHours(),
                            inquiryDate.getUTCMinutes(),
                            inquiryDate.getUTCSeconds()
                          ));
                          return inquiryUTCDate >= weekStart && inquiryUTCDate <= weekEnd && inquiryDate.getUTCHours() === hour;
                        }).length;

                        if (count > 0) {
                          data.push({
                            date: new Date(representativeDate),
                            hour,
                            count,
                          });
                        }
                      }
                    }
                  } else if (hourlyPeriodFilter === 'monthly') {
                    // 월간: 최근 12개월
                    const months = 12;
                    for (let monthOffset = months - 1; monthOffset >= 0; monthOffset--) {
                      const currentUTCMonth = now.getUTCMonth();
                      const currentUTCYear = now.getUTCFullYear();

                      // UTC 기준으로 월 계산
                      let targetMonth = currentUTCMonth - monthOffset;
                      let targetYear = currentUTCYear;

                      while (targetMonth < 0) {
                        targetMonth += 12;
                        targetYear -= 1;
                      }

                      const monthStart = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0));
                      const monthEnd = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));

                      // 월의 중간 날짜를 대표 날짜로 사용
                      const representativeDate = new Date(Date.UTC(targetYear, targetMonth, 15, 12, 0, 0, 0));

                      // 각 시간대별로 해당 월의 모든 날짜의 문의를 합산
                      for (let hour = 0; hour < 24; hour++) {
                        // 필터별로 그룹화하여 데이터 생성
                        if (hourlyCategoryFilter !== 'all') {
                          const categoryGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            const inquiryUTC = Date.UTC(
                              inquiryDate.getUTCFullYear(),
                              inquiryDate.getUTCMonth(),
                              inquiryDate.getUTCDate(),
                              inquiryDate.getUTCHours(),
                              inquiryDate.getUTCMinutes(),
                              inquiryDate.getUTCSeconds()
                            );
                            const inquiryUTCTime = new Date(inquiryUTC);
                            if (inquiryUTCTime >= monthStart && inquiryUTCTime <= monthEnd && inquiryDate.getUTCHours() === hour) {
                              if (!acc[inq.category]) acc[inq.category] = [];
                              acc[inq.category].push(inq);
                            }
                            return acc;
                          }, {} as Record<InquiryCategory, typeof filteredInquiries>);

                          Object.entries(categoryGroups).forEach(([category, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(representativeDate),
                                hour,
                                count: inquiries.length,
                                category: category as InquiryCategory,
                              });
                            }
                          });
                        } else if (hourlyUserTypeFilter !== 'all') {
                          const userTypeGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            const inquiryUTC = Date.UTC(
                              inquiryDate.getUTCFullYear(),
                              inquiryDate.getUTCMonth(),
                              inquiryDate.getUTCDate(),
                              inquiryDate.getUTCHours(),
                              inquiryDate.getUTCMinutes(),
                              inquiryDate.getUTCSeconds()
                            );
                            const inquiryUTCTime = new Date(inquiryUTC);
                            if (inquiryUTCTime >= monthStart && inquiryUTCTime <= monthEnd && inquiryDate.getUTCHours() === hour) {
                              if (!acc[inq.user_type]) acc[inq.user_type] = [];
                              acc[inq.user_type].push(inq);
                            }
                            return acc;
                          }, {} as Record<UserType, typeof filteredInquiries>);

                          Object.entries(userTypeGroups).forEach(([userType, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(representativeDate),
                                hour,
                                count: inquiries.length,
                                userType: userType as UserType,
                              });
                            }
                          });
                        } else if (hourlyCountryFilter !== 'all') {
                          const countryGroups = filteredInquiries.reduce((acc, inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            const inquiryUTC = Date.UTC(
                              inquiryDate.getUTCFullYear(),
                              inquiryDate.getUTCMonth(),
                              inquiryDate.getUTCDate(),
                              inquiryDate.getUTCHours(),
                              inquiryDate.getUTCMinutes(),
                              inquiryDate.getUTCSeconds()
                            );
                            const inquiryUTCTime = new Date(inquiryUTC);
                            if (inquiryUTCTime >= monthStart && inquiryUTCTime <= monthEnd && inquiryDate.getUTCHours() === hour) {
                              if (!acc[inq.user_country]) acc[inq.user_country] = [];
                              acc[inq.user_country].push(inq);
                            }
                            return acc;
                          }, {} as Record<string, typeof filteredInquiries>);

                          Object.entries(countryGroups).forEach(([country, groupInquiries]) => {
                            const inquiries = groupInquiries as typeof filteredInquiries;
                            if (inquiries.length > 0) {
                              data.push({
                                date: new Date(representativeDate),
                                hour,
                                count: inquiries.length,
                                country,
                              });
                            }
                          });
                        } else {
                          const count = filteredInquiries.filter((inq) => {
                            const inquiryDate = new Date(inq.created_at);
                            const inquiryUTC = Date.UTC(
                              inquiryDate.getUTCFullYear(),
                              inquiryDate.getUTCMonth(),
                              inquiryDate.getUTCDate(),
                              inquiryDate.getUTCHours(),
                              inquiryDate.getUTCMinutes(),
                              inquiryDate.getUTCSeconds()
                            );
                            const inquiryUTCTime = new Date(inquiryUTC);
                            return inquiryUTCTime >= monthStart && inquiryUTCTime <= monthEnd && inquiryDate.getUTCHours() === hour;
                          }).length;

                          if (count > 0) {
                            data.push({
                              date: new Date(representativeDate),
                              hour,
                              count,
                            });
                          }
                        }
                      }
                    }
                  }

                  return data;
                }, [filteredInquiries, hourlyPeriodFilter]);

                const maxCount = Math.max(...dateHourData.map(d => d.count), 1);

                // 기준값 계산 (고정값)
                const lowThreshold = 2; // 적음: 2건 이하
                const highThreshold = 4; // 보통: 2건 초과 4건 이하, 많음: 4건 초과

                // 날짜 범위 계산 (x축용)
                const now = new Date();
                let startDate: Date;
                let endDate: Date;

                if (hourlyPeriodFilter === 'daily') {
                  // 일간 필터일 때는 최근 30일의 시작일과 종료일 사용
                  const days = 30;
                  startDate = new Date(now);
                  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
                  startDate.setUTCHours(0, 0, 0, 0);
                  endDate = new Date(now);
                  endDate.setUTCHours(23, 59, 59, 999);
                } else if (hourlyPeriodFilter === 'monthly') {
                  // 월간 필터일 때는 최근 12개월의 시작일과 종료일 사용
                  const months = 12;
                  const currentUTCMonth = now.getUTCMonth();
                  const currentUTCYear = now.getUTCFullYear();

                  let startMonth = currentUTCMonth - (months - 1);
                  let startYear = currentUTCYear;

                  while (startMonth < 0) {
                    startMonth += 12;
                    startYear -= 1;
                  }

                  startDate = new Date(Date.UTC(startYear, startMonth, 1, 0, 0, 0, 0));
                  endDate = new Date(Date.UTC(currentUTCYear, currentUTCMonth + 1, 0, 23, 59, 59, 999));
                } else {
                  startDate = dateHourData.length > 0
                    ? new Date(Math.min(...dateHourData.map(d => d.date.getTime())))
                    : new Date();
                  endDate = dateHourData.length > 0
                    ? new Date(Math.max(...dateHourData.map(d => d.date.getTime())))
                    : new Date();
                }

                // 날짜를 숫자로 변환 (밀리초를 일 단위로)
                const dateToNumber = (date: Date) => {
                  return date.getTime() / (1000 * 60 * 60 * 24);
                };

                return (
                  <>
                    {/* 전체 시간대별 분포 차트 */}
                    <Box sx={{ height: 700 }}>
                      <Bubble
                        data={{
                          datasets: (() => {
                            // 필터별로 데이터셋 분리
                            if (hourlyCategoryFilter !== 'all') {
                              // 카테고리별로 데이터셋 분리
                              const categoryGroups: Record<InquiryCategory, Array<{ x: number; y: number; r: number }>> = {} as any;
                              const categoryColors: Record<InquiryCategory, string[]> = {} as any;
                              const categoryBorders: Record<InquiryCategory, string[]> = {} as any;

                              dateHourData.forEach((item) => {
                                if (item.category) {
                                  if (!categoryGroups[item.category]) {
                                    categoryGroups[item.category] = [];
                                    categoryColors[item.category] = [];
                                    categoryBorders[item.category] = [];
                                  }
                                  const minRadius = 3;
                                  const maxRadius = 25;
                                  const radius = maxCount > 0
                                    ? minRadius + (item.count / maxCount) * (maxRadius - minRadius)
                                    : minRadius;

                                  categoryGroups[item.category].push({
                                    x: dateToNumber(item.date),
                                    y: item.hour,
                                    r: radius,
                                  });

                                  // 카테고리 선택 시에도 기준에 따른 기본 색상 사용
                                  if (item.count <= lowThreshold) {
                                    // 적음: 2건 이하
                                    categoryColors[item.category].push(alpha(theme.palette.info.main, 0.5));
                                    categoryBorders[item.category].push(theme.palette.info.main);
                                  } else if (item.count <= highThreshold) {
                                    // 보통: 2건 초과 4건 이하
                                    categoryColors[item.category].push(alpha(theme.palette.warning.main, 0.6));
                                    categoryBorders[item.category].push(theme.palette.warning.main);
                                  } else {
                                    // 많음: 4건 초과
                                    categoryColors[item.category].push(alpha(theme.palette.error.main, 0.7));
                                    categoryBorders[item.category].push(theme.palette.error.main);
                                  }
                                }
                              });

                              return Object.entries(categoryGroups).map(([category, data]) => ({
                                label: ' ', // 공백으로 설정하여 텍스트는 안 보이지만 bullet은 표시
                                data,
                                backgroundColor: categoryColors[category as InquiryCategory],
                                borderColor: categoryBorders[category as InquiryCategory],
                                borderWidth: 2,
                              }));
                            } else if (hourlyUserTypeFilter !== 'all') {
                              // 학습자 유형별로 데이터셋 분리
                              const userTypeGroups: Record<UserType, Array<{ x: number; y: number; r: number }>> = {} as any;
                              const userTypeColors: Record<UserType, string[]> = {} as any;
                              const userTypeBorders: Record<UserType, string[]> = {} as any;

                              dateHourData.forEach((item) => {
                                if (item.userType) {
                                  if (!userTypeGroups[item.userType]) {
                                    userTypeGroups[item.userType] = [];
                                    userTypeColors[item.userType] = [];
                                    userTypeBorders[item.userType] = [];
                                  }
                                  const minRadius = 3;
                                  const maxRadius = 25;
                                  const radius = maxCount > 0
                                    ? minRadius + (item.count / maxCount) * (maxRadius - minRadius)
                                    : minRadius;

                                  userTypeGroups[item.userType].push({
                                    x: dateToNumber(item.date),
                                    y: item.hour,
                                    r: radius,
                                  });

                                  const baseColor = getUserTypeColors[item.userType];
                                  if (item.count <= lowThreshold) {
                                    // 적음: 2건 이하
                                    userTypeColors[item.userType].push(alpha(baseColor, 0.5));
                                    userTypeBorders[item.userType].push(baseColor);
                                  } else if (item.count <= highThreshold) {
                                    // 보통: 2건 초과 4건 이하
                                    userTypeColors[item.userType].push(alpha(baseColor, 0.6));
                                    userTypeBorders[item.userType].push(baseColor);
                                  } else {
                                    // 많음: 4건 초과
                                    userTypeColors[item.userType].push(alpha(baseColor, 0.7));
                                    userTypeBorders[item.userType].push(baseColor);
                                  }
                                }
                              });

                              return Object.entries(userTypeGroups).map(([userType, data]) => ({
                                label: userType === UserType.Student ? '학습자' : userType === UserType.Instructor ? '강사' : userType === UserType.Partner ? '제휴사' : userType,
                                data,
                                backgroundColor: userTypeColors[userType as UserType],
                                borderColor: userTypeBorders[userType as UserType],
                                borderWidth: 2,
                              }));
                            } else if (hourlyCountryFilter !== 'all') {
                              // 국적별로 데이터셋 분리
                              const countryGroups: Record<string, Array<{ x: number; y: number; r: number }>> = {};
                              const countryColors: Record<string, string[]> = {};
                              const countryBorders: Record<string, string[]> = {};

                              dateHourData.forEach((item) => {
                                if (item.country) {
                                  if (!countryGroups[item.country]) {
                                    countryGroups[item.country] = [];
                                    countryColors[item.country] = [];
                                    countryBorders[item.country] = [];
                                  }
                                  const minRadius = 3;
                                  const maxRadius = 25;
                                  const radius = maxCount > 0
                                    ? minRadius + (item.count / maxCount) * (maxRadius - minRadius)
                                    : minRadius;

                                  countryGroups[item.country].push({
                                    x: dateToNumber(item.date),
                                    y: item.hour,
                                    r: radius,
                                  });

                                  const baseColor = getCountryColors[item.country];
                                  if (item.count <= lowThreshold) {
                                    // 적음: 2건 이하
                                    countryColors[item.country].push(alpha(baseColor, 0.5));
                                    countryBorders[item.country].push(baseColor);
                                  } else if (item.count <= highThreshold) {
                                    // 보통: 2건 초과 4건 이하
                                    countryColors[item.country].push(alpha(baseColor, 0.6));
                                    countryBorders[item.country].push(baseColor);
                                  } else {
                                    // 많음: 4건 초과
                                    countryColors[item.country].push(alpha(baseColor, 0.7));
                                    countryBorders[item.country].push(baseColor);
                                  }
                                }
                              });

                              return Object.entries(countryGroups).map(([country, data]) => ({
                                label: getCountryLabel(country),
                                data,
                                backgroundColor: countryColors[country],
                                borderColor: countryBorders[country],
                                borderWidth: 2,
                              }));
                            } else {
                              // 전체 필터인 경우 기존 로직
                              return [{
                                label: '문의 건수',
                                data: dateHourData.map((item) => {
                                  const minRadius = 3;
                                  const maxRadius = 25;
                                  const radius = maxCount > 0
                                    ? minRadius + (item.count / maxCount) * (maxRadius - minRadius)
                                    : minRadius;

                                  return {
                                    x: dateToNumber(item.date),
                                    y: item.hour,
                                    r: radius,
                                  };
                                }),
                                backgroundColor: dateHourData.map((item) => {
                                  if (item.count <= lowThreshold) {
                                    // 적음: 2건 이하
                                    return alpha(theme.palette.info.main, 0.5);
                                  } else if (item.count <= highThreshold) {
                                    // 보통: 2건 초과 4건 이하
                                    return alpha(theme.palette.warning.main, 0.6);
                                  } else {
                                    // 많음: 4건 초과
                                    return alpha(theme.palette.error.main, 0.7);
                                  }
                                }),
                                borderColor: dateHourData.map((item) => {
                                  if (item.count <= lowThreshold) {
                                    // 적음: 2건 이하
                                    return theme.palette.info.main;
                                  } else if (item.count <= highThreshold) {
                                    // 보통: 2건 초과 4건 이하
                                    return theme.palette.warning.main;
                                  } else {
                                    // 많음: 4건 초과
                                    return theme.palette.error.main;
                                  }
                                }),
                                borderWidth: 2,
                              }];
                            }
                          })(),
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: hourlyCategoryFilter !== 'all' || hourlyUserTypeFilter !== 'all' || hourlyCountryFilter !== 'all',
                              position: 'top' as const,
                              labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                  size: hourlyCategoryFilter !== 'all' ? 0 : 12, // 카테고리 필터 선택 시 텍스트 크기를 0으로 설정
                                },
                              },
                            },
                            tooltip: {
                              callbacks: {
                                title: (items: any) => {
                                  const item = items[0];
                                  const dataIndex = item.dataIndex;
                                  const dataItem = dateHourData[dataIndex];
                                  if (dataItem) {
                                    const date = dataItem.date;
                                    const hour = Math.round(item.parsed.y);
                                    if (hourlyPeriodFilter === 'monthly') {
                                      // 월간 필터일 때는 날짜(day) 제외
                                      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')} ${hour}시`;
                                    } else if (hourlyPeriodFilter === 'weekly') {
                                      // 주간 필터일 때는 몇월 몇주차 형식
                                      const year = date.getUTCFullYear();
                                      const month = date.getUTCMonth() + 1;
                                      // 해당 월의 첫 번째 날짜
                                      const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
                                      // 해당 날짜가 속한 주의 시작일 (월요일)
                                      const dayOfWeek = firstDayOfMonth.getUTCDay();
                                      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                                      const firstMonday = new Date(firstDayOfMonth);
                                      firstMonday.setUTCDate(firstMonday.getUTCDate() + mondayOffset);

                                      // 해당 날짜가 속한 주의 시작일
                                      const dateDayOfWeek = date.getUTCDay();
                                      const dateMondayOffset = dateDayOfWeek === 0 ? -6 : 1 - dateDayOfWeek;
                                      const weekStart = new Date(date);
                                      weekStart.setUTCDate(weekStart.getUTCDate() + dateMondayOffset);

                                      // 해당 주가 해당 월의 몇 번째 주인지 계산
                                      const weekNumber = Math.floor((weekStart.getUTCDate() - firstMonday.getUTCDate()) / 7) + 1;

                                      return `${year}년 ${month}월 ${weekNumber}주차 ${hour}시`;
                                    } else {
                                      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${hour}시`;
                                    }
                                  }
                                  return '';
                                },
                                label: (context: any) => {
                                  const dataIndex = context.dataIndex;
                                  const count = dateHourData[dataIndex]?.count || 0;
                                  return `문의 건수: ${count}건`;
                                },
                              },
                              backgroundColor: theme.palette.background.paper,
                              titleColor: theme.palette.text.primary,
                              bodyColor: theme.palette.text.primary,
                              borderColor: theme.palette.divider,
                              borderWidth: 1,
                              padding: 12,
                            },
                          },
                          scales: {
                            x: {
                              type: 'linear',
                              position: 'bottom',
                              title: {
                                display: true,
                                text: '날짜',
                                font: {
                                  size: 12,
                                  weight: 500,
                                },
                                color: theme.palette.text.primary,
                              },
                              min: dateToNumber(startDate) - 0.5,
                              max: dateToNumber(endDate) + 0.5,
                                ticks: {
                                  stepSize: 1,
                                  callback: function(value: any, index: number, ticks: any[]) {
                                    const date = new Date(value * 1000 * 60 * 60 * 24);
                                    if (hourlyPeriodFilter === 'daily') {
                                      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
                                    } else if (hourlyPeriodFilter === 'weekly') {
                                      return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
                                    } else {
                                      // 월간 필터일 때는 각 월의 첫 번째 tick만 표시
                                      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
                                      // 이전 tick과 같은 월이면 null 반환하여 표시하지 않음
                                      if (index > 0) {
                                        const prevDate = new Date(ticks[index - 1].value * 1000 * 60 * 60 * 24);
                                        const prevMonthKey = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;
                                        if (monthKey === prevMonthKey) {
                                          return null; // 중복된 월은 표시하지 않음
                                        }
                                      }
                                      return monthKey;
                                    }
                                  },
                                  maxTicksLimit: hourlyPeriodFilter === 'daily' ? undefined : hourlyPeriodFilter === 'weekly' ? 24 : undefined, // 월간 필터일 때 제한 없음
                                  font: {
                                    size: 10,
                                  },
                                  color: theme.palette.text.secondary,
                                },
                              grid: {
                                color: theme.palette.divider,
                              },
                            },
                            y: {
                              type: 'linear',
                              position: 'left',
                              title: {
                                display: true,
                                text: '시간 (UTC)',
                                font: {
                                  size: 12,
                                  weight: 500,
                                },
                                color: theme.palette.text.primary,
                              },
                              min: -0.5,
                              max: 23.5,
                              ticks: {
                                stepSize: 1,
                                callback: function(value: any) {
                                  return `${Math.round(value)}시`;
                                },
                                font: {
                                  size: 11,
                                },
                                color: theme.palette.text.secondary,
                              },
                              grid: {
                                color: theme.palette.divider,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.info.main, 0.5),
                              border: `2px solid ${theme.palette.info.main}`,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            적음
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.warning.main, 0.6),
                              border: `2px solid ${theme.palette.warning.main}`,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            보통
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: alpha(theme.palette.error.main, 0.7),
                              border: `2px solid ${theme.palette.error.main}`,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            많음
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          기준: 적음 {lowThreshold}건 이하 | 보통 {lowThreshold + 1}~{highThreshold}건 | 많음 {highThreshold + 1}건 이상
                        </Typography>
                      </Box>
                    </Box>


                    {/* 국적별 주요 시간대 Pie 차트 */}
                    <Box sx={{ pt: 10 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          국적별 주요 문의 시간대
                        </Typography>
                        <Box>
                          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>기간</InputLabel>
                            <Select
                              value={hourlyTimeRangeFilter}
                              onChange={(e) => setHourlyTimeRangeFilter(e.target.value as PeriodFilter)}
                              label="기간"
                            >
                              <MenuItem value="all">전체</MenuItem>
                              <MenuItem value="today">오늘</MenuItem>
                              <MenuItem value="7days">일주일</MenuItem>
                              <MenuItem value="30days">한달</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Box>
                      <Grid container spacing={2}>
                        {countries.map((country, countryIndex) => {
                          const hours = hourlyDataByCountry[country];
                          const totalCount = hours.reduce((sum, val) => sum + val, 0);

                          if (totalCount === 0) return null;

                          // 각 국가별 차트 참조를 저장하기 위한 ref 생성
                          const chartRef = React.useRef<any>(null);

                          // 시간대별 데이터를 pie 차트용으로 변환
                          const pieData = hours
                            .map((count, hour) => ({
                              hour,
                              count,
                              percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
                            }))
                            .filter((item) => item.count > 0)
                            .sort((a, b) => b.count - a.count);

                          // 상위 시간대만 표시 (나머지는 기타로 합침)
                          const topCount = 5; // 상위 5개 시간대만 표시
                          const topData = pieData.slice(0, topCount);
                          const otherData = pieData.slice(topCount);
                          const otherCount = otherData.reduce((sum, item) => sum + item.count, 0);

                          // 국가별로 다른 메인 톤 사용 (각 국가마다 다른 기본 색상)
                          const baseColors = [
                            theme.palette.primary.main,    // 파란색
                            theme.palette.error.main,      // 빨간색
                            theme.palette.success.main,    // 초록색
                            theme.palette.warning.main,    // 주황색
                            theme.palette.info.main,       // 청록색
                            theme.palette.secondary.main, // 보라색
                          ];
                          const countryBaseColor = baseColors[countryIndex % baseColors.length];
                          const dataCount = topData.length + (otherCount > 0 ? 1 : 0);
                          const colorTones = generateColorTones(countryBaseColor, dataCount);

                          const chartData = {
                            labels: [
                              ...topData.map((item) => `${item.hour}시`),
                              ...(otherCount > 0 ? ['기타'] : []),
                            ],
                            datasets: [
                              {
                                data: [
                                  ...topData.map((item) => item.count),
                                  ...(otherCount > 0 ? [otherCount] : []),
                                ],
                                backgroundColor: colorTones,
                                borderWidth: 0,
                              },
                            ],
                          };

                          const chartOptions = {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                enabled: true,
                              },
                            },
                            cutout: '60%',
                          };

                          return (
                            <Grid key={country} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 2,
                                  backgroundColor: theme.palette.background.paper,
                                  height: '100%',
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                                  {getCountryLabel(country)}
                                </Typography>
                                <Box sx={{ height: 200, mb: 2, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Doughnut
                                    data={chartData}
                                    options={chartOptions}
                                    ref={chartRef}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                      {totalCount.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Stack spacing={1}>
                                  {chartData.labels.map((label, index) => {
                                    const value = chartData.datasets[0].data[index];
                                    const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(0) : '0';

                                    // 해당 시간대의 카테고리별 문의 건수 계산
                                    const getCategoryCountsByHour = (hourLabel: string) => {
                                      const categoryCounts: Record<InquiryCategory, number> = {
                                        [InquiryCategory.Learning]: 0,
                                        [InquiryCategory.Payment]: 0,
                                        [InquiryCategory.Instructor]: 0,
                                        [InquiryCategory.Content]: 0,
                                        [InquiryCategory.AI_Chatbot]: 0,
                                        [InquiryCategory.Test]: 0,
                                        [InquiryCategory.Dashboard]: 0,
                                        [InquiryCategory.InstructorSupport]: 0,
                                        [InquiryCategory.PackageEvent]: 0,
                                      };

                                      if (hourLabel === '기타') {
                                        // 기타 시간대의 경우, topData에 포함되지 않은 모든 시간대의 카테고리별 합계
                                        otherData.forEach((item) => {
                                          filteredInquiriesByTimeRange
                                            .filter((inq) => inq.user_country === country)
                                            .forEach((inq) => {
                                              const inquiryDate = new Date(inq.created_at);
                                              if (inquiryDate.getUTCHours() === item.hour) {
                                                const category = inq.category as InquiryCategory;
                                                if (category in categoryCounts) {
                                                  categoryCounts[category]++;
                                                }
                                              }
                                            });
                                        });
                                      } else {
                                        // 특정 시간대의 경우
                                        const hour = parseInt(hourLabel.replace('시', ''));
                                        filteredInquiriesByTimeRange
                                          .filter((inq) => inq.user_country === country)
                                          .forEach((inq) => {
                                            const inquiryDate = new Date(inq.created_at);
                                            if (inquiryDate.getUTCHours() === hour) {
                                              const category = inq.category as InquiryCategory;
                                              if (category in categoryCounts) {
                                                categoryCounts[category]++;
                                              }
                                            }
                                          });
                                      }

                                      return Object.entries(categoryCounts)
                                        .filter(([_, count]) => count > 0)
                                        .map(([category, count]) => ({
                                          category: category as InquiryCategory,
                                          count,
                                        }))
                                        .sort((a, b) => b.count - a.count);
                                    };

                                    const categoryCounts = getCategoryCountsByHour(label);
                                    const tooltipContent = categoryCounts.length > 0 ? (
                                      <Box>
                                        {categoryCounts.map((item) => (
                                          <Typography key={item.category} variant="body2">
                                            {getCategoryLabel(item.category)}: {item.count}건
                                          </Typography>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Typography variant="body2">카테고리 정보 없음</Typography>
                                    );

                                    return (
                                      <Tooltip
                                        key={label}
                                        title={tooltipContent}
                                        arrow
                                        placement="left"
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            '&:hover': {
                                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                            },
                                          }}
                                          onMouseEnter={() => {
                                            // 상세 정보에 마우스를 올리면 해당 파이 차트 영역 하이라이트
                                            if (chartRef.current) {
                                              chartRef.current.setActiveElements([{ datasetIndex: 0, index }]);
                                              chartRef.current.update('none');
                                            }
                                          }}
                                          onMouseLeave={() => {
                                            // 마우스가 벗어나면 하이라이트 제거
                                            if (chartRef.current) {
                                              chartRef.current.setActiveElements([]);
                                              chartRef.current.update('none');
                                            }
                                          }}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                              sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: colorTones[index],
                                              }}
                                            />
                                            <Typography variant="body2" color="text.primary">
                                              {label}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                              {value.toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              {percentage}%
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Tooltip>
                                    );
                                  })}
                                </Stack>
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </>
                );
              })()}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* 우측 하단 플로팅 버튼 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Zoom in={trigger}>
          <Fab
            color="primary"
            size="medium"
            onClick={handleScrollTop}
            aria-label="scroll back to top"
            sx={{
              boxShadow: (theme as any).customShadows?.z1 || theme.shadows[4],
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Zoom>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Fab
            color="secondary"
            size="medium"
            onClick={handleRefresh}
            aria-label="refresh page"
            sx={{
              boxShadow: (theme as any).customShadows?.z1 || theme.shadows[4],
            }}
          >
            <RestartAlt />
          </Fab>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            새로고침
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default InquiryAnalysisPage;
