import { Clear, Download, FilterList, KeyboardArrowUp, RestartAlt, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MailHistoryDetailModal from '../components/MailHistoryDetailModal';
import { useLanguage } from '../context/LanguageContext';
import { MailHistory, mockMailHistory } from '../data/mockMailHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mail-history-tabpanel-${index}`}
      aria-labelledby={`mail-history-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `mail-history-tab-${index}`,
    'aria-controls': `mail-history-tabpanel-${index}`,
  };
}

const MailHistoryPage = () => {
  const { t } = useLanguage();

  // localStorage에서 수동 발송 이력 불러오기
  const getManualMailHistory = (): MailHistory[] => {
    try {
      const stored = localStorage.getItem('manual_mail_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // 기존 더미데이터와 localStorage의 수동 발송 이력을 병합
  const manualHistory = getManualMailHistory();
  const history = [...mockMailHistory, ...manualHistory];

  const [selectedHistory, setSelectedHistory] = useState<MailHistory | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('all');

  // 상세 검색 필터 상태
  const [typeFilter, setTypeFilter] = useState<string>('all'); // 유형 필터
  const [templateNameFilter, setTemplateNameFilter] = useState<string>('all'); // 템플릿 이름 필터
  const [groupNameFilter, setGroupNameFilter] = useState<string>('all'); // 그룹 이름 필터
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 상태 필터 (수동만)
  const [sentByFilter, setSentByFilter] = useState<string>('all'); // 발송자 필터 (수동만)
  const [dateFilter, setDateFilter] = useState<string>('all'); // 기간 필터
  const [startDate, setStartDate] = useState<string>(''); // 시작일
  const [endDate, setEndDate] = useState<string>(''); // 종료일

  // 상세 검색 팝오버 상태
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(filterAnchorEl);

  // 자동 탭 페이지네이션 상태
  const [autoPage, setAutoPage] = useState<number>(0);
  const [autoRowsPerPage, setAutoRowsPerPage] = useState<number>(10);

  // 수동 탭 페이지네이션 상태
  const [manualPage, setManualPage] = useState<number>(0);
  const [manualRowsPerPage, setManualRowsPerPage] = useState<number>(10);

  // 수신자 탭 페이지네이션 상태
  const [recipientPage, setRecipientPage] = useState<number>(0);
  const [recipientRowsPerPage, setRecipientRowsPerPage] = useState<number>(10);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 마운트 시 스크롤을 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // URL 파라미터에서 초기값 읽어오기 (한 번만 실행)
  useEffect(() => {
    if (isInitialized) return; // 이미 초기화되었으면 실행하지 않음

    const tabParam = searchParams.get('tab');
    const searchParam = searchParams.get('search');
    const searchTypeParam = searchParams.get('searchType');
    const typeParam = searchParams.get('type');
    const templateNameParam = searchParams.get('templateName');
    const groupNameParam = searchParams.get('groupName');
    const statusParam = searchParams.get('status');
    const sentByParam = searchParams.get('sentBy');
    const dateFilterParam = searchParams.get('dateFilter');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const autoPageParam = searchParams.get('autoPage');
    const autoRowsPerPageParam = searchParams.get('autoRowsPerPage');
    const manualPageParam = searchParams.get('manualPage');
    const manualRowsPerPageParam = searchParams.get('manualRowsPerPage');
    const recipientPageParam = searchParams.get('recipientPage');
    const recipientRowsPerPageParam = searchParams.get('recipientRowsPerPage');
    const historyIdParam = searchParams.get('historyId');

    // historyId 파라미터가 있으면 해당 이력을 찾아서 모달 열기
    if (historyIdParam) {
      const historyItem = history.find((item) => item.id === historyIdParam);
      if (historyItem) {
        setSelectedHistory(historyItem);
        setOpenModal(true);
        // URL에서 historyId 파라미터 제거 (한 번만 실행되도록)
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('historyId');
        setSearchParams(newParams, { replace: true });
      }
    }

    // URL 파라미터에서 초기값 설정
    if (tabParam) {
      const tabIndex = tabParam === 'auto' ? 0 : tabParam === 'manual' ? 1 : tabParam === 'recipient' ? 2 : 0;
      setTabValue(tabIndex);
    }
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
    if (searchTypeParam) {
      setSearchType(searchTypeParam);
    }
    if (typeParam) {
      setTypeFilter(typeParam);
    }
    if (templateNameParam) {
      setTemplateNameFilter(templateNameParam);
    }
    if (groupNameParam) {
      setGroupNameFilter(groupNameParam);
    }
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    if (sentByParam) {
      setSentByFilter(sentByParam);
    }
    if (dateFilterParam) {
      setDateFilter(dateFilterParam);
    }
    if (startDateParam) {
      setStartDate(startDateParam);
    }
    if (endDateParam) {
      setEndDate(endDateParam);
    }
    if (autoPageParam) {
      const pageNum = parseInt(autoPageParam, 10);
      if (!isNaN(pageNum)) {
        setAutoPage(pageNum);
      }
    }
    if (autoRowsPerPageParam) {
      const rowsNum = parseInt(autoRowsPerPageParam, 10);
      if (!isNaN(rowsNum)) {
        setAutoRowsPerPage(rowsNum);
      }
    }
    if (manualPageParam) {
      const pageNum = parseInt(manualPageParam, 10);
      if (!isNaN(pageNum)) {
        setManualPage(pageNum);
      }
    }
    if (manualRowsPerPageParam) {
      const rowsNum = parseInt(manualRowsPerPageParam, 10);
      if (!isNaN(rowsNum)) {
        setManualRowsPerPage(rowsNum);
      }
    }
    if (recipientPageParam) {
      const pageNum = parseInt(recipientPageParam, 10);
      if (!isNaN(pageNum)) {
        setRecipientPage(pageNum);
      }
    }
    if (recipientRowsPerPageParam) {
      const rowsNum = parseInt(recipientRowsPerPageParam, 10);
      if (!isNaN(rowsNum)) {
        setRecipientRowsPerPage(rowsNum);
      }
    }

    setIsInitialized(true);
  }, [isInitialized, searchParams, setSearchParams, history]);

  // 상태 변경 시 URL 파라미터 업데이트
  useEffect(() => {
    if (!isInitialized) return; // 초기화되지 않았으면 실행하지 않음

    const newParams = new URLSearchParams();

    // 탭 선택
    if (tabValue === 0) {
      newParams.set('tab', 'auto');
    } else if (tabValue === 1) {
      newParams.set('tab', 'manual');
    } else if (tabValue === 2) {
      newParams.set('tab', 'recipient');
    }

    // 검색 관련
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    if (searchType !== 'all') {
      newParams.set('searchType', searchType);
    }

    // 상세 검색 필터
    if (typeFilter !== 'all') {
      newParams.set('type', typeFilter);
    }
    if (templateNameFilter !== 'all') {
      newParams.set('templateName', templateNameFilter);
    }
    if (groupNameFilter !== 'all') {
      newParams.set('groupName', groupNameFilter);
    }
    if (statusFilter !== 'all') {
      newParams.set('status', statusFilter);
    }
    if (sentByFilter !== 'all') {
      newParams.set('sentBy', sentByFilter);
    }
    if (dateFilter !== 'all') {
      newParams.set('dateFilter', dateFilter);
    }
    if (startDate) {
      newParams.set('startDate', startDate);
    }
    if (endDate) {
      newParams.set('endDate', endDate);
    }

    // 페이지네이션
    if (autoPage !== 0) {
      newParams.set('autoPage', String(autoPage));
    }
    if (autoRowsPerPage !== 10) {
      newParams.set('autoRowsPerPage', String(autoRowsPerPage));
    }
    if (manualPage !== 0) {
      newParams.set('manualPage', String(manualPage));
    }
    if (manualRowsPerPage !== 10) {
      newParams.set('manualRowsPerPage', String(manualRowsPerPage));
    }
    if (recipientPage !== 0) {
      newParams.set('recipientPage', String(recipientPage));
    }
    if (recipientRowsPerPage !== 10) {
      newParams.set('recipientRowsPerPage', String(recipientRowsPerPage));
    }

    // 현재 URL과 비교하여 변경사항이 있을 때만 업데이트
    const currentParams = searchParams.toString();
    const newParamsStr = newParams.toString();

    if (currentParams !== newParamsStr) {
      setSearchParams(newParams, { replace: true });
    }
  }, [
    tabValue,
    searchQuery,
    searchType,
    typeFilter,
    templateNameFilter,
    groupNameFilter,
    statusFilter,
    sentByFilter,
    dateFilter,
    startDate,
    endDate,
    autoPage,
    autoRowsPerPage,
    manualPage,
    manualRowsPerPage,
    recipientPage,
    recipientRowsPerPage,
    isInitialized,
    searchParams,
    setSearchParams,
  ]);

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatDateForCSV = (dateString: string) => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusChip = (status: MailHistory['status']) => {
    switch (status) {
      case 'success':
        return <Chip label={t('mailHistory.status.success')} color="success" size="small" />;
      case 'partial':
        return <Chip label={t('mailHistory.status.partial')} color="warning" size="small" />;
      case 'failed':
        return <Chip label={t('mailHistory.status.failed')} color="error" size="small" />;
      default:
        return null;
    }
  };

  const handleRowClick = (item: MailHistory) => {
    setSelectedHistory(item);
    setOpenModal(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // 페이지네이션 상태는 유지 (각 탭마다 독립적으로 관리)
    setSearchType('all');
    setSearchQuery('');
  };

  const handleSearch = () => {
    setAutoPage(0);
    setManualPage(0);
    setRecipientPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setAutoPage(0);
    setManualPage(0);
    setRecipientPage(0);
  };

  // 자동 탭 페이지네이션 핸들러
  const handleAutoPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setAutoPage(newPage - 1); // Pagination은 1부터 시작하므로 0-based index로 변환
  };

  const handleAutoRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setAutoRowsPerPage(Number(event.target.value));
    setAutoPage(0);
  };

  // 수동 탭 페이지네이션 핸들러
  const handleManualPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setManualPage(newPage - 1); // Pagination은 1부터 시작하므로 0-based index로 변환
  };

  const handleManualRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setManualRowsPerPage(Number(event.target.value));
    setManualPage(0);
  };

  // 수신자 탭 페이지네이션 핸들러
  const handleRecipientPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setRecipientPage(newPage - 1); // Pagination은 1부터 시작하므로 0-based index로 변환
  };

  const handleRecipientRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRecipientRowsPerPage(Number(event.target.value));
    setRecipientPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 상세 검색 팝오버 핸들러
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleDateFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setDateFilter(value);
    setAutoPage(0);
    setManualPage(0);
    setRecipientPage(0);

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

  const handleResetFilter = () => {
    setTypeFilter('all');
    setTemplateNameFilter('all');
    setGroupNameFilter('all');
    setStatusFilter('all');
    setSentByFilter('all');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setAutoPage(0);
    setManualPage(0);
    setRecipientPage(0);
  };

  // 고유한 템플릿 이름 목록
  const uniqueTemplateNames = useMemo(() => {
    return Array.from(new Set(history.map((item) => item.templateName))).sort();
  }, [history]);

  // 고유한 그룹 이름 목록
  const uniqueGroupNames = useMemo(() => {
    return Array.from(new Set(history.map((item) => item.groupName))).sort();
  }, [history]);

  // 고유한 발송자 목록
  const uniqueSentBys = useMemo(() => {
    return Array.from(new Set(history.filter((item) => item.type === 'manual').map((item) => item.sentBy))).sort();
  }, [history]);

  // 자동 탭 필터링 및 페이지네이션
  const autoFiltered = useMemo(() => {
    let filtered = history.filter((item) => item.type === 'auto');

    // 상세 검색 필터 적용
    if (templateNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.templateName === templateNameFilter);
    }
    if (groupNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.groupName === groupNameFilter);
    }
    if (dateFilter !== 'all' && startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.sentAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });
    }

    // 기본 검색 필터 적용
    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter((item) => {
      if (searchType === 'all') {
        return (
          item.templateName.toLowerCase().includes(query) ||
          item.groupName.toLowerCase().includes(query)
        );
      } else if (searchType === 'templateName') {
        return item.templateName.toLowerCase().includes(query);
      } else if (searchType === 'groupName') {
        return item.groupName.toLowerCase().includes(query);
      }
      return true;
    });
  }, [history, searchQuery, searchType, templateNameFilter, groupNameFilter, dateFilter, startDate, endDate]);

  const autoPaginated = useMemo(() => {
    const startIndex = autoPage * autoRowsPerPage;
    return autoFiltered.slice(startIndex, startIndex + autoRowsPerPage);
  }, [autoFiltered, autoPage, autoRowsPerPage]);

  // 수동 탭 필터링 및 페이지네이션
  const manualFiltered = useMemo(() => {
    let filtered = history.filter((item) => item.type === 'manual');

    // 상세 검색 필터 적용
    if (templateNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.templateName === templateNameFilter);
    }
    if (groupNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.groupName === groupNameFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (sentByFilter !== 'all') {
      filtered = filtered.filter((item) => item.sentBy === sentByFilter);
    }
    if (dateFilter !== 'all' && startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.sentAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });
    }

    // 기본 검색 필터 적용
    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter((item) => {
      if (searchType === 'all') {
        return (
          item.templateName.toLowerCase().includes(query) ||
          item.groupName.toLowerCase().includes(query) ||
          item.sentBy.toLowerCase().includes(query)
        );
      } else if (searchType === 'templateName') {
        return item.templateName.toLowerCase().includes(query);
      } else if (searchType === 'groupName') {
        return item.groupName.toLowerCase().includes(query);
      } else if (searchType === 'sentBy') {
        return item.sentBy.toLowerCase().includes(query);
      }
      return true;
    });
  }, [history, searchQuery, searchType, templateNameFilter, groupNameFilter, statusFilter, sentByFilter, dateFilter, startDate, endDate]);

  const manualPaginated = useMemo(() => {
    const startIndex = manualPage * manualRowsPerPage;
    return manualFiltered.slice(startIndex, startIndex + manualRowsPerPage);
  }, [manualFiltered, manualPage, manualRowsPerPage]);

  // 통계 계산
  const stats = useMemo(() => {
    const auto = history.filter((item) => item.type === 'auto').length;
    const manual = history.filter((item) => item.type === 'manual').length;
    return { auto, manual };
  }, [history]);

  // 수신자 탭 필터링 및 페이지네이션
  const allRecipients = useMemo(() => {
    let recipients = history.flatMap((item) => [
      ...(item.successfulRecipients || []),
      ...(item.failedRecipients || []),
    ]);

    // 상세 검색 필터 적용
    if (typeFilter !== 'all') {
      recipients = recipients.filter((recipient) => recipient.type === typeFilter);
    }
    if (templateNameFilter !== 'all') {
      recipients = recipients.filter((recipient) => recipient.templateName === templateNameFilter);
    }
    if (dateFilter !== 'all' && startDate && endDate) {
      recipients = recipients.filter((recipient) => {
        const recipientDate = new Date(recipient.sentAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return recipientDate >= start && recipientDate <= end;
      });
    }

    return recipients;
  }, [history, typeFilter, templateNameFilter, dateFilter, startDate, endDate]);

  const recipientFiltered = useMemo(() => {
    if (!searchQuery.trim()) return allRecipients;

    const query = searchQuery.toLowerCase();
    return allRecipients.filter((recipient) => {
      if (searchType === 'all') {
        return (
          recipient.userId.toLowerCase().includes(query) ||
          recipient.userName.toLowerCase().includes(query) ||
          recipient.userEmail.toLowerCase().includes(query)
        );
      } else if (searchType === 'userId') {
        return recipient.userId.toLowerCase().includes(query);
      } else if (searchType === 'userName') {
        return recipient.userName.toLowerCase().includes(query);
      } else if (searchType === 'userEmail') {
        return recipient.userEmail.toLowerCase().includes(query);
      }
      return true;
    });
  }, [allRecipients, searchQuery, searchType]);

  const recipientPaginated = useMemo(() => {
    const startIndex = recipientPage * recipientRowsPerPage;
    return recipientFiltered.slice(startIndex, startIndex + recipientRowsPerPage);
  }, [recipientFiltered, recipientPage, recipientRowsPerPage]);

  // 상세 검색 필터를 적용한 전체 필터링 (타입 필터 포함)
  const filteredByType = useMemo(() => {
    let filtered = history;

    // 타입 필터 적용
    if (typeFilter === 'auto') {
      filtered = filtered.filter((item) => item.type === 'auto');
    } else if (typeFilter === 'manual') {
      filtered = filtered.filter((item) => item.type === 'manual');
    }

    // 상세 검색 필터 적용
    if (templateNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.templateName === templateNameFilter);
    }
    if (groupNameFilter !== 'all') {
      filtered = filtered.filter((item) => item.groupName === groupNameFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    if (sentByFilter !== 'all') {
      filtered = filtered.filter((item) => item.sentBy === sentByFilter);
    }
    if (dateFilter !== 'all' && startDate && endDate) {
      filtered = filtered.filter((item) => {
        if (item.type === 'auto') return true; // 자동은 발송일 필터링 제외
        const itemDate = new Date(item.sentAt);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      });
    }

    return filtered;
  }, [history, typeFilter, templateNameFilter, groupNameFilter, statusFilter, sentByFilter, dateFilter, startDate, endDate]);

  // CSV 다운로드
  const handleExportCSV = () => {
    const headers = [
      'ID',
      '템플릿 이름',
      '그룹 이름',
      '수신자 수',
      '발송 성공',
      '발송 실패',
      '상태',
      '발송일',
      '발송자',
      '타입',
    ];

    // 현재 활성 탭에 따른 데이터 선택
    const currentFiltered = tabValue === 0 ? autoFiltered : tabValue === 1 ? manualFiltered : filteredByType;

    const csvRows = [
      headers.join(','),
      ...currentFiltered.map((item) => {
        const row = [
          item.id,
          `"${item.templateName.replace(/"/g, '""')}"`,
          `"${item.groupName.replace(/"/g, '""')}"`,
          item.recipientCount,
          item.sentCount,
          item.failedCount,
          item.status === 'success' ? '성공' : item.status === 'partial' ? '부분 성공' : '실패',
          formatDateForCSV(item.sentAt),
          `"${item.sentBy.replace(/"/g, '""')}"`,
          item.type === 'auto' ? '자동' : '수동',
        ];
        return row.join(',');
      }),
    ];

    const csvString = csvRows.join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mail_history_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {t('mailHistory.title')}
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
        {/* 검색 및 CSV 다운로드 영역 */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {/* 왼쪽: 검색 */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              placeholder="검색..."
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
                        displayEmpty
                        sx={{
                          fontSize: '0.875rem',
                          '& .MuiSelect-select': { py: 0 },
                        }}
                        renderValue={(value) => {
                          if (value === 'all') return '전체';
                          if (tabValue === 2) {
                            if (value === 'userId') return '사용자 ID';
                            if (value === 'userName') return '사용자명';
                            if (value === 'userEmail') return '이메일';
                          } else {
                            if (value === 'templateName') return '템플릿 이름';
                            if (value === 'groupName') return '그룹 이름';
                            if (value === 'sentBy') return '발송자';
                          }
                          return '';
                        }}
                      >
                        {tabValue === 2 ? (
                          <>
                            <MenuItem value="all">전체</MenuItem>
                            <MenuItem value="userId">사용자 ID</MenuItem>
                            <MenuItem value="userName">사용자명</MenuItem>
                            <MenuItem value="userEmail">이메일</MenuItem>
                          </>
                        ) : (
                          <>
                            <MenuItem value="all">전체</MenuItem>
                            <MenuItem value="templateName">템플릿 이름</MenuItem>
                            <MenuItem value="groupName">그룹 이름</MenuItem>
                            <MenuItem value="sentBy">발송자</MenuItem>
                          </>
                        )}
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
              상세
            </Button>
          </Box>

          {/* 오른쪽: CSV 다운로드 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              disableElevation
              startIcon={<Download />}
              onClick={handleExportCSV}
              sx={{
                minWidth: 'auto',
                px: 2,
                whiteSpace: 'nowrap',
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
            <Typography variant="subtitle1" fontWeight="bold">
              상세 검색
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>유형</InputLabel>
              <Select
                value={typeFilter}
                label="유형"
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setAutoPage(0);
                  setManualPage(0);
                  setRecipientPage(0);
                }}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="auto">자동</MenuItem>
                <MenuItem value="manual">수동</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>템플릿 이름</InputLabel>
              <Select
                value={templateNameFilter}
                label="템플릿 이름"
                onChange={(e) => {
                  setTemplateNameFilter(e.target.value);
                  setAutoPage(0);
                  setManualPage(0);
                  setRecipientPage(0);
                }}
              >
                <MenuItem value="all">전체</MenuItem>
                {uniqueTemplateNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>그룹 이름</InputLabel>
              <Select
                value={groupNameFilter}
                label="그룹 이름"
                onChange={(e) => {
                  setGroupNameFilter(e.target.value);
                  setAutoPage(0);
                  setManualPage(0);
                  setRecipientPage(0);
                }}
              >
                <MenuItem value="all">전체</MenuItem>
                {uniqueGroupNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {tabValue !== 0 && (
              <>
                <FormControl size="small" fullWidth>
                  <InputLabel>상태</InputLabel>
                  <Select
                    value={statusFilter}
                    label="상태"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setManualPage(0);
                    }}
                  >
                    <MenuItem value="all">전체</MenuItem>
                    <MenuItem value="success">성공</MenuItem>
                    <MenuItem value="partial">부분 성공</MenuItem>
                    <MenuItem value="failed">실패</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>발송자</InputLabel>
                  <Select
                    value={sentByFilter}
                    label="발송자"
                    onChange={(e) => {
                      setSentByFilter(e.target.value);
                      setManualPage(0);
                    }}
                  >
                    <MenuItem value="all">전체</MenuItem>
                    {uniqueSentBys.map((sentBy) => (
                      <MenuItem key={sentBy} value={sentBy}>
                        {sentBy}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>기간</InputLabel>
              <Select value={dateFilter} label="기간" onChange={handleDateFilterChange}>
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="today">오늘</MenuItem>
                <MenuItem value="week">최근 7일</MenuItem>
                <MenuItem value="month">최근 30일</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateFilter('all');
                  setAutoPage(0);
                  setManualPage(0);
                  setRecipientPage(0);
                }}
                sx={{ width: '100%' }}
                InputLabelProps={{ shrink: true }}
                label="시작일"
              />
              <Typography variant="body2">~</Typography>
              <TextField
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateFilter('all');
                  setAutoPage(0);
                  setManualPage(0);
                  setRecipientPage(0);
                }}
                sx={{ width: '100%' }}
                InputLabelProps={{ shrink: true }}
                label="종료일"
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
              필터 초기화
            </Button>
          </Box>
        </Popover>

        {/* 탭 메뉴 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="발송 타입 탭" sx={{ px: 2 }}>
            <Tab label={`자동 (${stats.auto})`} {...a11yProps(0)} />
            <Tab label={`수동 (${stats.manual})`} {...a11yProps(1)} />
            <Tab label="수신자" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* 자동 탭 테이블 */}
        <CustomTabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.templateName')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.groupName')}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.recipientCount')}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.sentCount')}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.failedCount')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {autoPaginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                          {t('mailHistory.noHistory')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  autoPaginated.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      onClick={() => handleRowClick(item)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.templateName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.groupName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.recipientCount.toLocaleString()}명
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.sentCount.toLocaleString()}명
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.failedCount.toLocaleString()}명
                        </Typography>
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
                value={autoRowsPerPage}
                onChange={handleAutoRowsPerPageChange}
                size="small"
                sx={{
                  minWidth: 80,
                  '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>
            <Pagination
              count={Math.ceil(autoFiltered.length / autoRowsPerPage)}
              page={autoPage + 1} // 0-based index를 1-based로 변환
              onChange={handleAutoPageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CustomTabPanel>

        {/* 수동 탭 테이블 */}
        <CustomTabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.templateName')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.groupName')}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.recipientCount')}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.sentCount')}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {t('mailHistory.failedCount')}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.status')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.type')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.sentDate')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.sentBy')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {manualPaginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                          {t('mailHistory.noHistory')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  manualPaginated.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      onClick={() => handleRowClick(item)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.templateName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.groupName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.recipientCount.toLocaleString()}명
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.sentCount.toLocaleString()}명
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.failedCount.toLocaleString()}명
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getStatusChip(item.status)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.type === 'auto' ? t('mailHistory.type.auto') : t('mailHistory.type.manual')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.type === 'auto' ? '-' : formatDateOnly(item.sentAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {item.sentBy}
                        </Typography>
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
                value={manualRowsPerPage}
                onChange={handleManualRowsPerPageChange}
                size="small"
                sx={{
                  minWidth: 80,
                  '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>
            <Pagination
              count={Math.ceil(manualFiltered.length / manualRowsPerPage)}
              page={manualPage + 1} // 0-based index를 1-based로 변환
              onChange={handleManualPageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CustomTabPanel>

        {/* 수신자 탭 테이블 */}
        <CustomTabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>사용자 ID</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>사용자명</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>이메일</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.type')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.templateName')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.recipientStatus')}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('mailHistory.sentDate')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipientPaginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                          {recipientFiltered.length === 0
                            ? allRecipients.length > 0
                              ? '검색 결과가 없습니다.'
                              : '수신자 목록이 없습니다.'
                            : '수신자 목록이 없습니다.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  recipientPaginated.map((recipient) => (
                    <TableRow key={recipient.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {recipient.userId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {recipient.userName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {recipient.userEmail}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {recipient.type === 'auto' ? t('mailHistory.type.auto') : t('mailHistory.type.manual')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {recipient.templateName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {recipient.status === 'success' ? (
                          <Chip label={t('mailHistory.recipientStatus.success')} color="success" size="small" />
                        ) : (
                          <Chip label={t('mailHistory.recipientStatus.failed')} color="error" size="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {formatDateOnly(recipient.sentAt)}
                        </Typography>
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
                value={recipientRowsPerPage}
                onChange={handleRecipientRowsPerPageChange}
                size="small"
                sx={{
                  minWidth: 80,
                  '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>
            <Pagination
              count={Math.ceil(recipientFiltered.length / recipientRowsPerPage)}
              page={recipientPage + 1} // 0-based index를 1-based로 변환
              onChange={handleRecipientPageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CustomTabPanel>

        <Zoom in={trigger}>
          <Fab
            color="primary"
            size="small"
            aria-label="scroll back to top"
            onClick={scrollToTop}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Zoom>

        {selectedHistory && (
          <MailHistoryDetailModal
            open={openModal}
            history={selectedHistory}
            onClose={() => {
              setOpenModal(false);
              setSelectedHistory(null);
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default MailHistoryPage;
