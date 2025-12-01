import { AttachFile, Clear, Close, ContentCopy, Download, FilterList, Info, KeyboardArrowUp, RestartAlt, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Popover,
  Select,
  SelectChangeEvent,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  tooltipClasses,
  useScrollTrigger
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import type { TooltipProps } from '@mui/material/Tooltip';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InquiryDetailModal from '../components/InquiryDetailModal';
import { useLanguage } from '../context/LanguageContext';
import { mockInquiries } from '../data/mockData';
import { Inquiry, InquiryCategory, InquiryStatus, UserType } from '../types/inquiry';
import { getInquiries, saveInquiries } from '../utils/storage';
import { getPageText, getCommonText } from '../utils/pageTexts';

// 커스터마이징된 Tooltip 컴포넌트 (현재 사용되지 않음)
// const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
//   <Tooltip {...props} classes={{ popper: className }} disableInteractive={false} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.popper}`]: {
//     zIndex: 1100, // GNB(z-index: 1200) 아래에 표시되도록 설정
//   },
//   [`& .${tooltipClasses.tooltip}`]: {
//     backgroundColor: '#f5f5f9',
//     color: 'rgba(0, 0, 0, 0.87)',
//     maxWidth: 400,
//     fontSize: theme.typography.pxToRem(12),
//     border: '1px solid #dadde9',
//     padding: theme.spacing(1.5),
//     pointerEvents: 'auto',
//     userSelect: 'text',
//     WebkitUserSelect: 'text',
//     MozUserSelect: 'text',
//     msUserSelect: 'text',
//   },
// }));

// 경고 느낌의 Tooltip 컴포넌트 (미답변 셀용)
const WarningTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} disableInteractive={false} />
))(({ theme }) => ({
  [`& .${tooltipClasses.popper}`]: {
    zIndex: 1100, // GNB(z-index: 1200) 아래에 표시되도록 설정
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    maxWidth: 200,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #ffc107',
    padding: theme.spacing(1),
    pointerEvents: 'auto',
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#ffc107',
  },
}));

const InquiryListPage = () => {
  const { language } = useLanguage();
  const { mode } = useColorScheme();

  // 오늘 날짜 문자열 생성
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayString = getTodayString();

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all'); // 국적 필터 추가
  const [tabValue, setTabValue] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [startDate, setStartDate] = useState<string>(todayString);
  const [endDate, setEndDate] = useState<string>(todayString);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('all');
  const [orderBy, setOrderBy] = useState<string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // 상세 검색 팝오버 상태
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(filterAnchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleDateFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setDateFilter(value);
    setPage(0);

    const today = new Date();
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (value === 'today') {
      const dateString = formatDate(today);
      setStartDate(dateString);
      setEndDate(dateString);
    } else if (value === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      setStartDate(formatDate(weekAgo));
      setEndDate(formatDate(today));
    } else if (value === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      setStartDate(formatDate(monthAgo));
      setEndDate(formatDate(today));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  // 페이지 마운트 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // localStorage에서 데이터 로드
    const stored = getInquiries();

    // localStorage에 데이터가 없거나, mockInquiries보다 적은 경우 업데이트
    // (새로운 카테고리 데이터가 추가되었을 수 있으므로)
    if (stored.length === 0 || stored.length < mockInquiries.length) {
      // 기존 데이터의 답변 정보를 보존하면서 새로운 데이터로 병합
      const storedMap = new Map(stored.map((inq: Inquiry) => [inq.id, inq]));
      const merged = mockInquiries.map((mockInq) => {
        const storedInq = storedMap.get(mockInq.id);
        // 기존 답변이 있으면 보존
        if (storedInq && storedInq.status === InquiryStatus.Answered) {
          return storedInq;
        }
        return mockInq;
      });

      saveInquiries(merged);
      setInquiries(merged);
    } else {
      setInquiries(stored);
    }
  }, []);

  // URL 파라미터에서 초기값 읽어오기 (한 번만 실행)
  useEffect(() => {
    if (inquiries.length === 0 || isInitialized) return; // inquiries가 로드되기 전이거나 이미 초기화되었으면 실행하지 않음

    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const userTypeParam = searchParams.get('userType');
    const countryParam = searchParams.get('country');
    const searchParam = searchParams.get('search');
    const searchTypeParam = searchParams.get('searchType');
    const dateFilterParam = searchParams.get('dateFilter');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const orderByParam = searchParams.get('orderBy');
    const orderParam = searchParams.get('order') as 'asc' | 'desc' | null;
    const pageParam = searchParams.get('page');
    const rowsPerPageParam = searchParams.get('rowsPerPage');
    const inquiryIdParam = searchParams.get('inquiryId');

    // inquiryId 파라미터가 있으면 해당 문의를 찾아서 모달 열기
    if (inquiryIdParam) {
      const inquiry = inquiries.find((inq) => inq.id === inquiryIdParam);
      if (inquiry) {
        setSelectedInquiry(inquiry);
        setOpenModal(true);
        // URL에서 inquiryId 파라미터 제거 (한 번만 실행되도록)
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('inquiryId');
        setSearchParams(newParams, { replace: true });
      }
    }

    // URL 파라미터에서 초기값 설정
    if (statusParam) {
      setTabValue(statusParam === 'all' ? 'all' : statusParam);
    }
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
    if (userTypeParam) {
      setUserTypeFilter(userTypeParam);
    }
    if (countryParam) {
      setCountryFilter(countryParam);
    }
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
    if (searchTypeParam) {
      setSearchType(searchTypeParam);
    }
    if (dateFilterParam) {
      setDateFilter(dateFilterParam);
    } else if (!statusParam) {
      // status 파라미터가 없고 dateFilter도 없으면 기본값 설정
      setDateFilter('today');
    }
    if (startDateParam) {
      setStartDate(startDateParam);
    }
    if (endDateParam) {
      setEndDate(endDateParam);
    }
    if (orderByParam) {
      setOrderBy(orderByParam);
    }
    if (orderParam === 'asc' || orderParam === 'desc') {
      setOrder(orderParam);
    }
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum)) {
        setPage(pageNum);
      }
    }
    if (rowsPerPageParam) {
      const rowsNum = parseInt(rowsPerPageParam, 10);
      if (!isNaN(rowsNum)) {
        setRowsPerPage(rowsNum);
      }
    }

    setIsInitialized(true);
  }, [inquiries.length, isInitialized, searchParams, setSearchParams]); // inquiries가 로드된 후 한 번만 실행

  // 상태 변경 시 URL 파라미터 업데이트
  useEffect(() => {
    if (!isInitialized || inquiries.length === 0) return; // 초기화되지 않았거나 inquiries가 로드되기 전에는 실행하지 않음

    const newParams = new URLSearchParams();

    if (tabValue !== 'all') {
      newParams.set('status', tabValue);
    }
    if (categoryFilter !== 'all') {
      newParams.set('category', categoryFilter);
    }
    if (userTypeFilter !== 'all') {
      newParams.set('userType', userTypeFilter);
    }
    if (countryFilter !== 'all') {
      newParams.set('country', countryFilter);
    }
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    if (searchType !== 'all') {
      newParams.set('searchType', searchType);
    }
    if (dateFilter !== 'today') {
      newParams.set('dateFilter', dateFilter);
    }
    if (startDate) {
      newParams.set('startDate', startDate);
    }
    if (endDate) {
      newParams.set('endDate', endDate);
    }
    if (orderBy) {
      newParams.set('orderBy', orderBy);
    }
    if (order !== 'asc') {
      newParams.set('order', order);
    }
    if (page !== 0) {
      newParams.set('page', String(page));
    }
    if (rowsPerPage !== 10) {
      newParams.set('rowsPerPage', String(rowsPerPage));
    }

    // 현재 URL과 비교하여 변경사항이 있을 때만 업데이트
    const currentParams = searchParams.toString();
    const newParamsStr = newParams.toString();

    if (currentParams !== newParamsStr) {
      setSearchParams(newParams, { replace: true });
    }
  }, [tabValue, categoryFilter, userTypeFilter, countryFilter, searchQuery, searchType, dateFilter, startDate, endDate, orderBy, order, page, rowsPerPage, isInitialized, inquiries.length, searchParams, setSearchParams]);

  // 존재하는 모든 국적 목록 추출
  const countries = useMemo(() => {
    const countrySet = new Set(inquiries.map((i) => i.user_country));
    return Array.from(countrySet).sort();
  }, [inquiries]);

  const baseFilteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
          // 검색어 필터링
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            let matches = false;

            if (searchType === 'all') {
              // 전체 검색
              const matchesTitle = inquiry.title.toLowerCase().includes(query);
              const matchesContent = inquiry.content.toLowerCase().includes(query);
              const matchesUserId = inquiry.user_id.toLowerCase().includes(query);
              const matchesUserName = inquiry.user_name?.toLowerCase().includes(query) || false;
              const matchesNickname = inquiry.user_nickname?.toLowerCase().includes(query) || false;
              const matchesEmail = inquiry.user_email.toLowerCase().includes(query);
              matches = matchesTitle || matchesContent || matchesUserId || matchesUserName || matchesNickname || matchesEmail;
            } else if (searchType === 'id') {
              // 문의 ID로 정확히 일치하는 경우만 검색 (대소문자 구분 없이)
              matches = inquiry.id.toLowerCase() === query;
            } else if (searchType === 'user_id') {
              matches = inquiry.user_id.toLowerCase().includes(query);
            } else if (searchType === 'user_name') {
              matches = inquiry.user_name?.toLowerCase().includes(query) || false;
            } else if (searchType === 'user_nickname') {
              matches = inquiry.user_nickname?.toLowerCase().includes(query) || false;
            } else if (searchType === 'user_email') {
              matches = inquiry.user_email.toLowerCase().includes(query);
            } else if (searchType === 'answerer_id') {
              matches = inquiry.answerer_id?.toLowerCase().includes(query) || false;
            } else if (searchType === 'content') {
              // 문의 내용별 검색
              const matchesTitle = inquiry.title.toLowerCase().includes(query);
              const matchesContent = inquiry.content.toLowerCase().includes(query);
              matches = matchesTitle || matchesContent;
            }

            if (!matches) {
              return false;
            }
          }
      if (categoryFilter !== 'all' && inquiry.category !== categoryFilter) {
        return false;
      }
      if (userTypeFilter !== 'all' && inquiry.user_type !== userTypeFilter) {
        return false;
      }
      if (countryFilter !== 'all' && inquiry.user_country !== countryFilter) { // 국적 필터링
        return false;
      }
      if (dateFilter !== 'all') {
        const inquiryDate = new Date(inquiry.created_at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inquiryDateOnly = new Date(inquiryDate.getFullYear(), inquiryDate.getMonth(), inquiryDate.getDate());

        if (dateFilter === 'today') {
          return inquiryDateOnly.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return inquiryDateOnly >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return inquiryDateOnly >= monthAgo;
        } else if (dateFilter === 'custom') {
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return inquiryDate >= start && inquiryDate <= end;
          } else if (startDate) {
            const start = new Date(startDate);
            return inquiryDate >= start;
          } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return inquiryDate <= end;
          }
        }
      }
      return true;
    });
  }, [inquiries, categoryFilter, userTypeFilter, countryFilter, dateFilter, searchQuery, searchType]);

  const filteredInquiries = useMemo(() => {
    if (tabValue === 'all') return baseFilteredInquiries;
    return baseFilteredInquiries.filter((i) => i.status === tabValue);
  }, [baseFilteredInquiries, tabValue]);

  // 정렬된 데이터
  const sortedInquiries = useMemo(() => {
    const sorted = [...filteredInquiries];
    if (orderBy) {
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (orderBy) {
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'user_id':
            aValue = a.user_id;
            bValue = b.user_id;
            break;
          case 'user_name':
            aValue = a.user_name || '';
            bValue = b.user_name || '';
            break;
          case 'user_nickname':
            aValue = a.user_nickname || '';
            bValue = b.user_nickname || '';
            break;
          case 'user_country': // 국적 정렬 추가
            aValue = a.user_country;
            bValue = b.user_country;
            break;
          case 'user_email':
            aValue = a.user_email;
            bValue = b.user_email;
            break;
          case 'user_type':
            aValue = a.user_type;
            bValue = b.user_type;
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'created_at':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  }, [filteredInquiries, orderBy, order]);

  // 페이지네이션된 데이터
  const paginatedInquiries = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedInquiries.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedInquiries, page, rowsPerPage]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1); // Pagination은 1부터 시작하므로 0-based index로 변환
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const stats = useMemo(() => {
    const pending = baseFilteredInquiries.filter((i) => i.status === InquiryStatus.Pending).length;
    const answered = baseFilteredInquiries.filter((i) => i.status === InquiryStatus.Answered).length;
    const total = baseFilteredInquiries.length;
    return { total, pending, answered };
  }, [baseFilteredInquiries]);

  const handleRowClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setOpenModal(true);
  };

  const handleAnswerSubmit = (inquiryId: string, answer: string) => {
    const updated = inquiries.map((inq) => {
      if (inq.id === inquiryId) {
        return {
          ...inq,
          status: InquiryStatus.Answered,
          answer_content: answer,
          answerer_id: 'admin001',
          answered_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      }
      return inq;
    });
    setInquiries(updated);
    // localStorage에 저장하지 않음
    setOpenModal(false);
    setSelectedInquiry(null);
  };

  const handleAnswerSubmitSuccess = () => {
    setSnackbarMessage('답변이 성공적으로 등록되었습니다.');
    setSnackbarOpen(true);
  };

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').substring(0, 10);
  };

  const getCategoryLabel = (category: InquiryCategory) => {
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
    return labels[category];
  };

  const getUserTypeLabel = (userType: UserType) => {
    const labels: Record<UserType, string> = {
      [UserType.Student]: '학생',
      [UserType.Instructor]: '강사',
      [UserType.Partner]: '제휴',
    };
    return labels[userType];
  };

  const getCountryLabel = (countryCode: string) => {
    const labels: Record<string, string> = {
      KR: '대한민국',
      US: '미국',
      JP: '일본',
      CN: '중국',
      VN: '베트남',
      TH: '태국',
      ID: '인도네시아',
      PH: '필리핀',
      SG: '싱가포르',
      TW: '대만',
      HK: '홍콩',
      MY: '말레이시아',
      IN: '인도',
      AU: '호주',
      GB: '영국',
      CA: '캐나다',
    };
    return labels[countryCode] || countryCode;
  };

  // const getUserTypeColor 삭제됨

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    navigator.clipboard.writeText(email);
    setSnackbarMessage('이메일이 클립보드에 복사되었습니다.');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSearch = () => {
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSearchType('all');
    setCategoryFilter('all');
    setUserTypeFilter('all');
    setCountryFilter('all'); // 국적 필터 초기화
    setTabValue('all');
    setDateFilter('today');
    setStartDate(todayString);
    setEndDate(todayString);
    setPage(0);
    setOrderBy('');
    setOrder('asc');
  };

  const handleExportCSV = () => {
    // CSV 헤더 정의
    const headers = [
      'ID',
      '카테고리',
      '사용자 ID',
      '사용자 이름',
      '이메일',
      '사용자 유형',
      '제목',
      '내용',
      '첨부파일',
      '국적', // 국적 헤더 이동
      '등록일',
      '상태',
      '답변자 ID',
      '답변일',
      '답변 내용'
    ];

    // 데이터 행 생성
    const csvRows = [
      headers.join(','), // 헤더 행
      ...sortedInquiries.map(item => {
        const row = [
          item.id,
          getCategoryLabel(item.category),
          item.user_id,
          item.user_name || '',
          item.user_email,
          getUserTypeLabel(item.user_type),
          // 제목과 내용은 쉼표나 줄바꿈이 있을 수 있으므로 따옴표로 감싸고 내부 따옴표는 이스케이프 처리
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.content.replace(/"/g, '""')}"`,
          item.has_attachment
            ? item.attachments && item.attachments.length > 0
              ? item.attachments.map((att) => att.filename).join('; ')
              : item.attachment_filename || '있음'
            : '없음',
          getCountryLabel(item.user_country), // 국적 데이터 이동
          formatDate(item.created_at),
          item.status === InquiryStatus.Answered ? '답변완료' : '미답변',
          item.answerer_id || '',
          item.answered_at ? formatDate(item.answered_at) : '',
          `"${(item.answer_content || '').replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ];

    // CSV 문자열 결합
    const csvString = csvRows.join('\n');

    // BOM 추가 (한글 깨짐 방지)
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });

    // 다운로드 링크 생성 및 클릭
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inquiries_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {getPageText('inquiryList', language).title}
      </Typography>

      <Paper
        sx={{
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        {/* 탭 메뉴와 필터 영역 (위아래 배치 변경) */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
           {/* 왼쪽: 검색 + 상세 버튼 */}
           <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
             <TextField
              placeholder={getCommonText('searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                width: { xs: '100%', sm: 300 },
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FormControl
                      variant="standard"
                      size="small"
                      sx={{
                        minWidth: 80,
                        '& .MuiInput-underline:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:hover:before': { borderBottom: 'none' },
                        '& .MuiInput-underline:after': { borderBottom: 'none' },
                      }}
                    >
                      <Select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        disableUnderline
                        sx={{
                          fontSize: '0.875rem',
                          '& .MuiSelect-select': { py: 0 },
                        }}
                      >
                        <MenuItem value="all">{getCommonText('all', language)}</MenuItem>
                        <MenuItem value="user_id">{getCommonText('user_id', language)}</MenuItem>
                        <MenuItem value="user_name">{getCommonText('user_name', language)}</MenuItem>
                        <MenuItem value="user_nickname">{getCommonText('user_nickname', language)}</MenuItem>
                        <MenuItem value="user_email">{getCommonText('userEmail', language)}</MenuItem>
                        <MenuItem value="answerer_id">{getCommonText('answerer', language)}</MenuItem>
                        <MenuItem value="content">{getCommonText('content', language)}</MenuItem>
                      </Select>
                    </FormControl>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchQuery && (
                      <IconButton onClick={handleClearSearch} edge="end" sx={{ mr: 0.5 }}>
                        <Clear />
                      </IconButton>
                    )}
                    <IconButton onClick={handleSearch} edge="end" sx={{ color: 'text.secondary' }}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
               variant="outlined"
               color="inherit"
               startIcon={<FilterList />}
               onClick={handleFilterClick}
               sx={{ whiteSpace: 'nowrap', borderColor: 'divider' }}
             >
               {getCommonText('detail', language)}
             </Button>
           </Box>

          {/* 오른쪽: CSV 다운로드 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* CSV 다운로드 버튼 */}
            <Button
              variant="contained"
              disableElevation
              startIcon={<Download />}
              onClick={handleExportCSV}
              sx={{
                minWidth: 'auto',
                px: 2,
                whiteSpace: 'nowrap'
              }}
            >
              CSV
            </Button>
          </Box>
        </Box>

        {/* 상세 필터 Popover */}
        <Popover
          open={openFilter}
          anchorEl={filterAnchorEl}
          onClose={handleFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Box sx={{ p: 3, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
             <Typography variant="subtitle1" fontWeight="bold">{getCommonText('detailSearch', language)}</Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>{getCommonText('category', language)}</InputLabel>
              <Select
                value={categoryFilter}
                label={getCommonText('category', language)}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">{getCommonText('all', language)}</MenuItem>
                {Object.values(InquiryCategory).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{getCommonText('userType', language)}</InputLabel>
              <Select
                value={userTypeFilter}
                label={getCommonText('userType', language)}
                onChange={(e) => setUserTypeFilter(e.target.value)}
              >
                <MenuItem value="all">{getCommonText('all', language)}</MenuItem>
                {Object.values(UserType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {getUserTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 국적 필터 추가 */}
            <FormControl size="small" fullWidth>
              <InputLabel>{getCommonText('country', language)}</InputLabel>
              <Select
                value={countryFilter}
                label={getCommonText('country', language)}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <MenuItem value="all">{getCommonText('all', language)}</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {getCountryLabel(country)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>{getCommonText('period', language)}</InputLabel>
              <Select
                value={dateFilter}
                label={getCommonText('period', language)}
                onChange={handleDateFilterChange}
              >
                <MenuItem value="all">{getCommonText('all', language)}</MenuItem>
                <MenuItem value="today">{getCommonText('today', language)}</MenuItem>
                <MenuItem value="week">{getCommonText('week', language)}</MenuItem>
                <MenuItem value="month">{getCommonText('month', language)}</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('');
                }}
                sx={{
                  width: '100%',
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: mode === 'dark' ? 'invert(1)' : 'none',
                  },
                  '& input[type="date"]': {
                    color: 'text.primary',
                  },
                }}
                InputLabelProps={{ shrink: true }}
                label={getCommonText('startDate', language)}
              />
              <Typography variant="body2">~</Typography>
              <TextField
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('');
                }}
                sx={{
                  width: '100%',
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: mode === 'dark' ? 'invert(1)' : 'none',
                  },
                  '& input[type="date"]': {
                    color: 'text.primary',
                  },
                }}
                InputLabelProps={{ shrink: true }}
                label={getCommonText('endDate', language)}
              />
            </Box>

            {/* 필터 초기화 버튼 */}
            <Button
              variant="outlined"
              color="secondary"
              disableElevation
              startIcon={<RestartAlt />}
              onClick={handleResetFilter}
              fullWidth
            >
              {getCommonText('resetFilter', language)}
            </Button>
          </Box>
        </Popover>

        {/* 탭 메뉴 (필터 영역 아래로 이동) */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="문의 상태 탭"
            sx={{ px: 2 }}
          >
            <Tab label={`전체 (${stats.total})`} value="all" />
            <Tab label={`미답변 (${stats.pending})`} value={InquiryStatus.Pending} />
            <Tab label={`답변 (${stats.answered})`} value={InquiryStatus.Answered} />
          </Tabs>
        </Box>

        {/* 테이블 */}
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '60px', minWidth: '60px', whiteSpace: 'nowrap' }}>번호</TableCell>
                <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'category'}
                    direction={orderBy === 'category' ? order : 'asc'}
                    onClick={() => handleRequestSort('category')}
                  >
                    카테고리
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '150px', minWidth: '150px' }}>
                  <TableSortLabel
                    active={orderBy === 'user_name'}
                    direction={orderBy === 'user_name' ? order : 'asc'}
                    onClick={() => handleRequestSort('user_name')}
                  >
                    이름(아이디)
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'user_nickname'}
                    direction={orderBy === 'user_nickname' ? order : 'asc'}
                    onClick={() => handleRequestSort('user_nickname')}
                  >
                    닉네임
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '180px', minWidth: '180px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'user_email'}
                    direction={orderBy === 'user_email' ? order : 'asc'}
                    onClick={() => handleRequestSort('user_email')}
                  >
                    이메일
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'user_type'}
                    direction={orderBy === 'user_type' ? order : 'asc'}
                    onClick={() => handleRequestSort('user_type')}
                  >
                    작성자 유형
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '300px', minWidth: '300px', maxWidth: '300px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleRequestSort('title')}
                  >
                    문의 내용
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>첨부파일</TableCell>
                {/* 국적 컬럼 이동 */}
                <TableCell sx={{ width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'user_country'}
                    direction={orderBy === 'user_country' ? order : 'asc'}
                    onClick={() => handleRequestSort('user_country')}
                  >
                    국적
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TableSortLabel
                      active={orderBy === 'created_at'}
                      direction={orderBy === 'created_at' ? order : 'asc'}
                      onClick={() => handleRequestSort('created_at')}
                    >
                      등록일
                    </TableSortLabel>
                    <Tooltip title={getCommonText('dateTimeInfo', language)} arrow placement="top">
                      <Info sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    답변 정보
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary">
                        조회된 데이터가 없습니다.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInquiries.map((inquiry, index) => (
                  <TableRow
                    key={inquiry.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(inquiry)}
                  >
                    <TableCell sx={{ width: '60px', minWidth: '60px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {page * rowsPerPage + index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {getCategoryLabel(inquiry.category)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '150px', minWidth: '150px' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" noWrap>
                          {inquiry.user_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          ({inquiry.user_id})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>{inquiry.user_nickname || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '180px', minWidth: '180px', whiteSpace: 'nowrap' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover .copy-button': {
                            opacity: 1,
                            visibility: 'visible',
                          },
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {inquiry.user_email}
                        </Typography>
                        <Tooltip title={getCommonText('copyEmail', language)} arrow placement="top">
                          <IconButton
                            className="copy-button"
                            size="small"
                            onClick={(e) => handleCopyEmail(inquiry.user_email, e)}
                            sx={{
                              opacity: 0,
                              visibility: 'hidden',
                              transition: 'all 0.2s',
                              p: 0.5,
                              ml: 1,
                            }}
                          >
                            <ContentCopy fontSize="small" sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '100px', minWidth: '100px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {getUserTypeLabel(inquiry.user_type)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '300px', minWidth: '300px', maxWidth: '300px', whiteSpace: 'nowrap' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {inquiry.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {inquiry.content}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>
                      {inquiry.has_attachment ? (
                        <Tooltip
                          title={
                            inquiry.attachments && inquiry.attachments.length > 0
                              ? inquiry.attachments.map((att) => att.filename).join(', ')
                              : inquiry.attachment_filename || getCommonText('attachment', language)
                          }
                          arrow
                        >
                          <IconButton size="small">
                            <AttachFile fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    {/* 국적 데이터 이동 */}
                    <TableCell sx={{ width: '80px', minWidth: '80px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>{getCountryLabel(inquiry.user_country)}</Typography>
                    </TableCell>
                    <TableCell sx={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {formatDate(inquiry.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: '120px', minWidth: '120px', whiteSpace: 'nowrap' }}>
                      {inquiry.status === InquiryStatus.Answered ? (
                        <>
                          <Typography variant="body2" noWrap>{inquiry.answerer_id}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {inquiry.answered_at && formatDate(inquiry.answered_at)}
                          </Typography>
                        </>
                      ) : (
                        <WarningTooltip
                          title={
                            <Box
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              onMouseUp={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                            >
                              <Typography color="inherit" variant="body2" sx={{ fontWeight: 500 }}>
                                {(() => {
                                  const createdDate = new Date(inquiry.created_at);
                                  const now = new Date();
                                  const diffTime = now.getTime() - createdDate.getTime();
                                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                                  const diffMinutes = Math.floor(diffTime / (1000 * 60));

                                  if (diffDays > 0) {
                                    return `${diffDays}일 동안 미답변`;
                                  } else if (diffHours > 0) {
                                    return `${diffHours}시간 동안 미답변`;
                                  } else {
                                    return `${diffMinutes}분 동안 미답변`;
                                  }
                                })()}
                              </Typography>
                            </Box>
                          }
                          arrow
                          placement="right"
                          open={true}
                          disableHoverListener
                          disableFocusListener
                          disableTouchListener
                          PopperProps={{
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              e.preventDefault();
                            },
                            onMouseDown: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              e.preventDefault();
                            },
                            style: {
                              zIndex: openModal ? 1200 : 1100, // GNB(z-index: 1200) 아래에 표시되도록 설정
                            },
                          }}
                        >
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Typography variant="body2" color="error" noWrap>
                              미답변
                            </Typography>
                          </Box>
                        </WarningTooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 영역 */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    페이지당 행 수:
                </Typography>
                <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    size="small"
                    sx={{
                        minWidth: 80,
                        '& .MuiSelect-select': { py: 0.5, px: 1.5 }
                    }}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                </Select>
            </Box>
            <Pagination
                count={Math.ceil(sortedInquiries.length / rowsPerPage)}
                page={page + 1} // 0-based index를 1-based로 변환
                onChange={handleChangePage}
                variant="outlined"
                shape="rounded"
                color="primary"
                showFirstButton
                showLastButton
            />
        </Box>
      </Paper>

      {selectedInquiry && (
        <InquiryDetailModal
          open={openModal}
          inquiry={selectedInquiry}
          onClose={() => {
            setOpenModal(false);
            setSelectedInquiry(null);
          }}
          onAnswerSubmit={handleAnswerSubmit}
          onAnswerSubmitSuccess={handleAnswerSubmitSuccess}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />

      <Zoom in={trigger}>
        <Box
          role="presentation"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 9999,
          }}
        >
          <Fab
            color="primary"
            size="medium"
            onClick={handleScrollTop}
            aria-label="scroll back to top"
          >
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Zoom>
    </Box>
  );
};

export default InquiryListPage;
