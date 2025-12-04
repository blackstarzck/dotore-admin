import { Add, AddCircle, Code, DeleteOutlined, KeyboardArrowUp, Language, Refresh, RemoveCircle, Search, Storage, Warning } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import QueryBuilder, { formatQuery, RuleGroupType } from 'react-querybuilder';
import MainCard from '../components/MainCard';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { mockInquiries } from '../data/mockData';
import { mockSendGroups, SendGroup } from '../data/mockSendGroups';
import { UserGender, UserType } from '../types/inquiry';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText, getPageText } from '../utils/pageTexts';

interface SimpleConditionState {
  nationality: string[];
  ageRange: number[];
  gender: string[];
  userType: string[];
  signupMethod: string[]; // 가입 방식
  signupDateRange: [Dayjs | null, Dayjs | null]; // 가입 일자 범위
  subscriptionStatus: string[]; // 구독 여부
  activityStatus: string[]; // 활동 여부
}

// Ant Design Descriptions 스타일을 위한 컴포넌트 (InquiryDetailModal에서 가져옴)
const DescriptionItem = ({
  label,
  children,
  span = 1,
  labelWidth = '120px',
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
  labelWidth?: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      gridColumn: `span ${span}`,
      borderBottom: '1px solid',
      borderRight: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      sx={{
        width: labelWidth,
        minWidth: labelWidth,
        bgcolor: 'grey.50',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        borderRight: '1px solid',
        borderColor: 'divider',
        fontWeight: 500,
        color: 'text.primary',
        fontSize: '0.875rem',
      }}
    >
      {label}
    </Box>
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        color: 'text.secondary',
        fontSize: '0.875rem',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  </Box>
);

const MailGroupPage = () => {
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<SendGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SendGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SendGroup | null>(null);
  const [groupName, setGroupName] = useState<MultilingualContent>({ ko: '', en: '', vi: '' });
  const [groupDescription, setGroupDescription] = useState<MultilingualContent>({ ko: '', en: '', vi: '' });
  const [groupNameError, setGroupNameError] = useState('');
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [],
  });
  const [convertedQuery, setConvertedQuery] = useState('');
  const [convertFormat, setConvertFormat] = useState<'sql' | 'json' | 'natural_language'>('natural_language');

  // 조건 설정 모드 (0: 간편 설정, 1: 상세 설정)
  const [conditionMode, setConditionMode] = useState<number>(0);
  const [enabledConditionMode, setEnabledConditionMode] = useState<number>(0); // 활성화된 설정 모드 (항상 하나는 활성화되어야 함)

  // 간편 설정 상태
  const [simpleCondition, setSimpleCondition] = useState<SimpleConditionState>({
    nationality: ['ALL'],
    ageRange: [0, 100],
    gender: ['ALL', UserGender.Male, UserGender.Female],
    userType: ['ALL', UserType.Student, UserType.Instructor, UserType.Partner],
    signupMethod: ['ALL', 'email', 'google', 'facebook', 'kakao'],
    signupDateRange: [null, null],
    subscriptionStatus: ['ALL', 'subscribed', 'unsubscribed'],
    activityStatus: ['ALL', 'active', 'inactive'],
  });

  // 조회 관련 상태
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [isCheckingCount, setIsCheckingCount] = useState(false);
  const [memberCountCheckedAt, setMemberCountCheckedAt] = useState<string | null>(null); // 조회하기를 눌러 확인한 시간

  // 경고 Popover 상태
  const [warningPopoverAnchor, setWarningPopoverAnchor] = useState<HTMLElement | null>(null);
  const saveButtonRef = React.useRef<HTMLButtonElement>(null);

  // 필드 변경 시 연산자 유지
  const handleQueryChange = (newQuery: RuleGroupType) => {
    const preserveOperators = (newRules: any[], prevRules: any[]): any[] => {
      return newRules.map((newRule, index) => {
        // RuleGroupType인지 확인 (rules 속성이 있으면 그룹)
        if ('rules' in newRule && Array.isArray(newRule.rules)) {
          // 재귀적으로 그룹 처리
          const prevRule = prevRules[index];
          const prevGroupRules = 'rules' in prevRule && Array.isArray(prevRule.rules) ? prevRule.rules : [];
          return {
            ...newRule,
            rules: preserveOperators(newRule.rules, prevGroupRules),
          };
        } else {
          // RuleType인 경우 (field 속성이 있으면 규칙)
          const prevRule = prevRules[index];
          if (prevRule && 'field' in prevRule && 'field' in newRule) {
            // 필드가 변경되었지만 연산자가 유효한 경우 연산자 유지
            if (newRule.field !== prevRule.field && 'operator' in prevRule && prevRule.operator) {
              if (!('operator' in newRule) || newRule.operator !== prevRule.operator) {
                return {
                  ...newRule,
                  operator: prevRule.operator,
                };
              }
            }
          }
          return newRule;
        }
      });
    };

    const preservedQuery = {
      ...newQuery,
      rules: preserveOperators(newQuery.rules, query.rules),
    };

    setQuery(preservedQuery);
    setMemberCount(null); // 쿼리 변경 시 조회 결과 초기화
    setMemberCountCheckedAt(null); // 쿼리 변경 시 조회 시간도 초기화
  };

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // 그룹 목록 불러오기
  useEffect(() => {
    loadGroups();
  }, []);

  // 쿼리가 변경될 때마다 자동으로 변환하여 표시
  useEffect(() => {
    if (query.rules.length === 0) {
      setConvertedQuery('');
      return;
    }
    try {
      const formatted = formatQuery(query, convertFormat);
      setConvertedQuery(typeof formatted === 'string' ? formatted : JSON.stringify(formatted, null, 2));
    } catch (error) {
      console.error('Convert error:', error);
      setConvertedQuery('');
    }
  }, [query, convertFormat]);

  const loadGroups = async () => {
    setIsLoadingGroups(true);
    // 네트워크 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));
    // 더미데이터에서 불러오기
    setGroups([...mockSendGroups]);
    setIsLoadingGroups(false);
  };

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleAddClick = () => {
    setEditingGroup(null);
    setGroupName({ ko: '', en: '', vi: '' });
    setGroupDescription({ ko: '', en: '', vi: '' });
    setGroupNameError('');
    setConditionMode(0); // 기본값 간편 설정
    setSimpleCondition({
      nationality: ['ALL'],
      ageRange: [0, 100],
      gender: ['ALL', UserGender.Male, UserGender.Female],
      userType: ['ALL', UserType.Student, UserType.Instructor, UserType.Partner],
      signupMethod: ['ALL', 'email', 'google', 'facebook', 'kakao'],
      signupDateRange: [null, null],
      subscriptionStatus: ['ALL', 'subscribed', 'unsubscribed'],
      activityStatus: ['ALL', 'active', 'inactive'],
    });
    setQuery({
      combinator: 'and',
      rules: [],
    });
    setMemberCount(null);
    setMemberCountCheckedAt(null);
    setEnabledConditionMode(0); // 간편 설정 활성화
    setDialogOpen(true);
  };

  const handleEditClick = (group: SendGroup) => {
    // 기존 그룹 데이터를 다국어로 변환 (하위 호환성)
    const migrateContent = (content: string | MultilingualContent): MultilingualContent => {
      if (typeof content === 'string') {
        return {
          ko: content,
          en: content,
          vi: content,
        };
      }
      return content;
    };

    setEditingGroup(group);
    setGroupName(migrateContent(group.name));
    setGroupDescription(group.description ? migrateContent(group.description) : { ko: '', en: '', vi: '' });
    setGroupNameError('');

    // 편집 시에도 간편 설정으로 먼저 열기 (사용자가 원하는 탭으로 전환 가능)
    setConditionMode(0);
    setEnabledConditionMode(0);

    // query가 있으면 간편 설정 상태로 변환
    if (group.query && group.query.rules && group.query.rules.length > 0) {
      const parsedSimple = parseQueryToSimple(group.query);
      setSimpleCondition(parsedSimple);
      setQuery(group.query);
    } else {
      // query가 없으면 기본값으로 초기화
      setSimpleCondition({
        nationality: ['ALL'],
        ageRange: [0, 100],
        gender: ['ALL'],
        userType: ['ALL'],
        signupMethod: ['ALL'],
        signupDateRange: [null, null],
        subscriptionStatus: ['ALL'],
        activityStatus: ['ALL'],
      });
      setQuery({ combinator: 'and', rules: [] });
    }

    // 편집 시에는 기존 memberCount를 표시하되, 조회 시간은 초기화 (다시 조회해야 함)
    setMemberCount(group.memberCount ?? null);
    setMemberCountCheckedAt(null); // 편집 시에는 조회 시간 초기화 (다시 조회해야 함)

    setDialogOpen(true);
  };

  const handleDeleteClick = (group: SendGroup) => {
    setDeletingGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGroup(null);
    setGroupName({ ko: '', en: '', vi: '' });
    setGroupDescription({ ko: '', en: '', vi: '' });
    setGroupNameError('');
    setConditionMode(0); // 간편 설정으로 초기화
    setEnabledConditionMode(0); // 간편 설정 활성화
    setSimpleCondition({
      nationality: ['ALL'],
      ageRange: [0, 100],
      gender: ['ALL', UserGender.Male, UserGender.Female],
      userType: ['ALL', UserType.Student, UserType.Instructor, UserType.Partner],
      signupMethod: ['ALL', 'email', 'google', 'facebook', 'kakao'],
      signupDateRange: [null, null],
      subscriptionStatus: ['ALL', 'subscribed', 'unsubscribed'],
      activityStatus: ['ALL', 'active', 'inactive'],
    });
    setQuery({ combinator: 'and', rules: [] });
    setMemberCount(null);
    setMemberCountCheckedAt(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingGroup(null);
  };

  const handleFormatChange = (format: typeof convertFormat) => {
    setConvertFormat(format);
  };

  const handleCopyConvertedQuery = () => {
    if (convertedQuery) {
      navigator.clipboard.writeText(convertedQuery);
      showSnackbar(getCommonText('copiedToClipboard', language), 'success', 2000);
    }
  };

  const handleCheckCount = () => {
    setIsCheckingCount(true);
    setMemberCount(null);
    // 테이블 로딩 상태를 즉시 설정
    setIsLoadingGroups(true);

    // 실제 데이터 필터링 시뮬레이션
    setTimeout(() => {
      if (conditionMode === 0) {
        // 간편 설정: mockInquiries 기반 필터링
        const uniqueUsers = Array.from(new Map(mockInquiries.map(item => [item.user_id, item])).values());
        const filtered = uniqueUsers.filter(user => {
          // 국적 필터
          if (!simpleCondition.nationality.includes('ALL') && !simpleCondition.nationality.includes(user.user_country)) return false;

          // 연령 필터
          if (user.user_age < simpleCondition.ageRange[0] || user.user_age > simpleCondition.ageRange[1]) return false;

          // 성별 필터
          if (!simpleCondition.gender.includes('ALL') && !simpleCondition.gender.includes(user.user_gender)) return false;

          // 가입 유형 필터
          if (!simpleCondition.userType.includes('ALL') && !simpleCondition.userType.includes(user.user_type)) return false;

          return true;
        });
        setMemberCount(filtered.length);
      } else {
        // 상세 설정: 복잡한 쿼리 파싱 대신 랜덤 값 시뮬레이션 (프로토타입용)
        // 실제 구현 시에는 백엔드에 쿼리를 보내 count를 받아와야 함
        const randomCount = Math.floor(Math.random() * 100);
        setMemberCount(randomCount);
      }
      setIsCheckingCount(false);
      setIsLoadingGroups(false);
      // 조회하기를 눌렀음을 표시하기 위해 현재 시간을 저장
      setMemberCountCheckedAt(new Date().toISOString());
    }, 800); // 0.8초 지연 시뮬레이션
  };

  // 간편 설정 변경 핸들러 래퍼 (상태 변경 시 count 초기화)
  const updateSimpleCondition = (updater: (prev: SimpleConditionState) => SimpleConditionState) => {
    setSimpleCondition(updater);
    setMemberCount(null);
    setMemberCountCheckedAt(null); // 조건 변경 시 조회 시간도 초기화
  };

  // 특정 그룹의 인원을 다시 조회하는 함수
  const handleRefreshMemberCount = async (group: SendGroup, e: React.MouseEvent) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지

    if (!group.query || !group.query.rules || group.query.rules.length === 0) {
      showSnackbar('조회할 조건이 없습니다.', 'warning', 3000);
      return;
    }

    // 테이블 로딩 상태 시작
    setIsLoadingGroups(true);

    // 네트워크 지연 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800));

    // 그룹의 query를 간편 설정으로 파싱
    const parsedCondition = parseQueryToSimple(group.query);

    // 실제 데이터 필터링 시뮬레이션
    const uniqueUsers = Array.from(new Map(mockInquiries.map(item => [item.user_id, item])).values());
    const filtered = uniqueUsers.filter(user => {
      // 국적 필터
      if (!parsedCondition.nationality.includes('ALL') && !parsedCondition.nationality.includes(user.user_country)) return false;

      // 연령 필터
      if (user.user_age < parsedCondition.ageRange[0] || user.user_age > parsedCondition.ageRange[1]) return false;

      // 성별 필터
      if (!parsedCondition.gender.includes('ALL') && !parsedCondition.gender.includes(user.user_gender)) return false;

      // 가입 유형 필터
      if (!parsedCondition.userType.includes('ALL') && !parsedCondition.userType.includes(user.user_type)) return false;

      return true;
    });

    const newCount = filtered.length;
    const checkedAt = new Date().toISOString();

    // 그룹의 memberCount 업데이트
    setGroups((prev) =>
      prev.map((g) =>
        g.id === group.id
          ? {
              ...g,
              memberCount: newCount,
              memberCountCheckedAt: checkedAt,
              updatedAt: new Date().toISOString(),
            }
          : g
      )
    );

    // 테이블 로딩 상태 종료
    setIsLoadingGroups(false);
  };

  const validateGroupName = (name: MultilingualContent): boolean => {
    // 최소 하나의 언어에 값이 입력되어야 함
    const koTrimmed = (name.ko || '').trim();
    const enTrimmed = (name.en || '').trim();
    const viTrimmed = (name.vi || '').trim();

    // 입력된 값이 있는지 확인
    const hasAnyValue = koTrimmed || enTrimmed || viTrimmed;
    if (!hasAnyValue) {
      setGroupNameError(getCommonText('groupNameRequired', language));
      return false;
    }

    // 입력된 값이 있는 언어는 최소 2자 이상이어야 함
    if (koTrimmed && koTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', language));
      return false;
    }
    if (enTrimmed && enTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', language));
      return false;
    }
    if (viTrimmed && viTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', language));
      return false;
    }

    setGroupNameError('');
    return true;
  };

  // Query Builder의 RuleGroupType을 간편 설정 상태로 변환
  const parseQueryToSimple = (query: RuleGroupType): SimpleConditionState => {
    const defaultCondition: SimpleConditionState = {
      nationality: ['ALL'],
      ageRange: [0, 100],
      gender: ['ALL', UserGender.Male, UserGender.Female],
      userType: ['ALL', UserType.Student, UserType.Instructor, UserType.Partner],
      signupMethod: ['ALL', 'email', 'google', 'facebook', 'kakao'],
      signupDateRange: [null, null],
      subscriptionStatus: ['ALL', 'subscribed', 'unsubscribed'],
      activityStatus: ['ALL', 'active', 'inactive'],
    };

    if (!query.rules || query.rules.length === 0) {
      return defaultCondition;
    }

    const result = { ...defaultCondition };

    query.rules.forEach((rule: any) => {
      if (!rule.field || !rule.operator) return;

      switch (rule.field) {
        case 'userCountry':
          if (rule.operator === '=') {
            result.nationality = [rule.value];
          } else if (rule.operator === 'in') {
            // value가 문자열인 경우 (예: 'KR,US') 또는 배열인 경우 처리
            if (typeof rule.value === 'string') {
              result.nationality = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.nationality = rule.value;
            }
          }
          break;

        case 'userAge':
          if (rule.operator === 'between' && Array.isArray(rule.value)) {
            result.ageRange = rule.value;
          }
          break;

        case 'userGender':
          if (rule.operator === '=') {
            result.gender = [rule.value];
          } else if (rule.operator === 'in') {
            if (typeof rule.value === 'string') {
              result.gender = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.gender = rule.value;
            }
          }
          break;

        case 'userType':
          if (rule.operator === '=') {
            result.userType = [rule.value];
          } else if (rule.operator === 'in') {
            if (typeof rule.value === 'string') {
              result.userType = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.userType = rule.value;
            }
          }
          break;

        case 'signupMethod':
          if (rule.operator === '=') {
            result.signupMethod = [rule.value];
          } else if (rule.operator === 'in') {
            if (typeof rule.value === 'string') {
              result.signupMethod = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.signupMethod = rule.value;
            }
          }
          break;

        case 'signupDate':
          if (rule.operator === 'between' && Array.isArray(rule.value) && rule.value.length === 2) {
            const startDate = dayjs(rule.value[0]);
            const endDate = dayjs(rule.value[1]);
            if (startDate.isValid() && endDate.isValid()) {
              result.signupDateRange = [startDate, endDate];
            }
          } else if (rule.operator === '>=') {
            const startDate = dayjs(rule.value);
            if (startDate.isValid()) {
              result.signupDateRange = [startDate, null];
            }
          } else if (rule.operator === '<=') {
            const endDate = dayjs(rule.value);
            if (endDate.isValid()) {
              result.signupDateRange = [null, endDate];
            }
          }
          break;

        case 'subscriptionStatus':
          if (rule.operator === '=') {
            result.subscriptionStatus = [rule.value];
          } else if (rule.operator === 'in') {
            if (typeof rule.value === 'string') {
              result.subscriptionStatus = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.subscriptionStatus = rule.value;
            }
          }
          break;

        case 'activityStatus':
          if (rule.operator === '=') {
            result.activityStatus = [rule.value];
          } else if (rule.operator === 'in') {
            if (typeof rule.value === 'string') {
              result.activityStatus = rule.value.split(',').map((v: string) => v.trim());
            } else if (Array.isArray(rule.value)) {
              result.activityStatus = rule.value;
            }
          }
          break;
      }
    });

    return result;
  };

  // Query를 사람이 읽을 수 있는 형태로 변환
  const formatQueryForDisplay = (query: RuleGroupType | undefined): {
    nationality: string;
    ageRange: string;
    gender: string;
    userType: string;
    signupMethod: string;
    signupDate: string;
    subscriptionStatus: string;
    activityStatus: string;
  } => {
    const defaultDisplay = {
      nationality: '전체',
      ageRange: '전체',
      gender: '전체',
      userType: '전체',
      signupMethod: '전체',
      signupDate: '-',
      subscriptionStatus: '전체',
      activityStatus: '전체',
    };

    if (!query || !query.rules || query.rules.length === 0) {
      return defaultDisplay;
    }

    const result = { ...defaultDisplay };

    const nationalityLabels: Record<string, string> = { 'KR': '한국', 'US': '미국', 'VN': '베트남' };
    const genderLabels: Record<string, string> = { 'Male': '남성', 'Female': '여성' };
    const userTypeLabels: Record<string, string> = { 'Student': '학생', 'Instructor': '강사', 'Partner': '파트너' };
    const signupMethodLabels: Record<string, string> = { 'email': '이메일', 'google': '구글', 'facebook': '페이스북', 'kakao': '카카오' };
    const subscriptionLabels: Record<string, string> = { 'subscribed': '구독', 'unsubscribed': '구독 해지' };
    const activityLabels: Record<string, string> = { 'active': '활동', 'inactive': '비활동' };

    query.rules.forEach((rule: any) => {
      if (!rule.field || !rule.operator) return;

      switch (rule.field) {
        case 'userCountry':
          if (rule.operator === '=') {
            result.nationality = nationalityLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.nationality = values.map((v: string) => nationalityLabels[v] || v).join(', ');
          }
          break;

        case 'userAge':
          if (rule.operator === 'between' && Array.isArray(rule.value)) {
            result.ageRange = `${rule.value[0]} ~ ${rule.value[1]}`;
          }
          break;

        case 'userGender':
          if (rule.operator === '=') {
            result.gender = genderLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.gender = values.map((v: string) => genderLabels[v] || v).join(', ');
          }
          break;

        case 'userType':
          if (rule.operator === '=') {
            result.userType = userTypeLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.userType = values.map((v: string) => userTypeLabels[v] || v).join(', ');
          }
          break;

        case 'signupMethod':
          if (rule.operator === '=') {
            result.signupMethod = signupMethodLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.signupMethod = values.map((v: string) => signupMethodLabels[v] || v).join(', ');
          }
          break;

        case 'signupDate':
          if (rule.operator === 'between' && Array.isArray(rule.value) && rule.value.length === 2) {
            const startDate = dayjs(rule.value[0]);
            const endDate = dayjs(rule.value[1]);
            if (startDate.isValid() && endDate.isValid()) {
              result.signupDate = `${startDate.format('YY-MM-DD')} ~ ${endDate.format('YY-MM-DD')}`;
            }
          } else if (rule.operator === '>=') {
            const startDate = dayjs(rule.value);
            if (startDate.isValid()) {
              result.signupDate = `${startDate.format('YY-MM-DD')}`;
            }
          } else if (rule.operator === '<=') {
            const endDate = dayjs(rule.value);
            if (endDate.isValid()) {
              result.signupDate = `${endDate.format('YY-MM-DD')} 이전`;
            }
          }
          break;

        case 'subscriptionStatus':
          if (rule.operator === '=') {
            result.subscriptionStatus = subscriptionLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.subscriptionStatus = values.map((v: string) => subscriptionLabels[v] || v).join(', ');
          }
          break;

        case 'activityStatus':
          if (rule.operator === '=') {
            result.activityStatus = activityLabels[rule.value] || rule.value;
          } else if (rule.operator === 'in') {
            const values = typeof rule.value === 'string' ? rule.value.split(',').map((v: string) => v.trim()) : rule.value;
            result.activityStatus = values.map((v: string) => activityLabels[v] || v).join(', ');
          }
          break;
      }
    });

    return result;
  };

  // 간편 설정 상태를 Query Builder의 RuleGroupType으로 변환
  const buildQueryFromSimple = (): RuleGroupType => {
    const rules: any[] = [];

    // 국적
    if (!simpleCondition.nationality.includes('ALL')) {
      rules.push({
        field: 'userCountry',
        operator: 'in',
        value: simpleCondition.nationality.join(',')
      });
    }

    // 연령 (범위)
    // 슬라이더가 전체 범위(0-100)가 아닐 때만 추가
    if (simpleCondition.ageRange[0] !== 0 || simpleCondition.ageRange[1] !== 100) {
      rules.push({
        field: 'userAge',
        operator: 'between',
        value: simpleCondition.ageRange // react-querybuilder might expect comma separated string or array depending on config, passing array for now
      });
    }

    // 성별
    if (!simpleCondition.gender.includes('ALL')) {
      if (simpleCondition.gender.length === 1) {
        rules.push({
          field: 'userGender',
          operator: '=',
          value: simpleCondition.gender[0]
        });
      } else {
        rules.push({
          field: 'userGender',
          operator: 'in',
          value: simpleCondition.gender
        });
      }
    }

    // 가입 유형
    if (!simpleCondition.userType.includes('ALL')) {
      if (simpleCondition.userType.length === 1) {
        rules.push({
          field: 'userType',
          operator: '=',
          value: simpleCondition.userType[0]
        });
      } else {
        rules.push({
          field: 'userType',
          operator: 'in',
          value: simpleCondition.userType
        });
      }
    }

    // 가입 방식
    if (!simpleCondition.signupMethod.includes('ALL')) {
      if (simpleCondition.signupMethod.length === 1) {
        rules.push({
          field: 'signupMethod',
          operator: '=',
          value: simpleCondition.signupMethod[0]
        });
      } else {
        rules.push({
          field: 'signupMethod',
          operator: 'in',
          value: simpleCondition.signupMethod
        });
      }
    }

    // 가입 일자 범위
    if (simpleCondition.signupDateRange[0] && simpleCondition.signupDateRange[1]) {
      rules.push({
        field: 'signupDate',
        operator: 'between',
        value: [
          simpleCondition.signupDateRange[0].format('YYYY-MM-DD'),
          simpleCondition.signupDateRange[1].format('YYYY-MM-DD')
        ]
      });
    } else if (simpleCondition.signupDateRange[0]) {
      rules.push({
        field: 'signupDate',
        operator: '>=',
        value: simpleCondition.signupDateRange[0].format('YYYY-MM-DD')
      });
    } else if (simpleCondition.signupDateRange[1]) {
      rules.push({
        field: 'signupDate',
        operator: '<=',
        value: simpleCondition.signupDateRange[1].format('YYYY-MM-DD')
      });
    }

    // 구독 여부
    if (!simpleCondition.subscriptionStatus.includes('ALL')) {
      if (simpleCondition.subscriptionStatus.length === 1) {
        rules.push({
          field: 'subscriptionStatus',
          operator: '=',
          value: simpleCondition.subscriptionStatus[0]
        });
      } else {
        rules.push({
          field: 'subscriptionStatus',
          operator: 'in',
          value: simpleCondition.subscriptionStatus
        });
      }
    }

    // 활동 여부
    if (!simpleCondition.activityStatus.includes('ALL')) {
      if (simpleCondition.activityStatus.length === 1) {
        rules.push({
          field: 'activityStatus',
          operator: '=',
          value: simpleCondition.activityStatus[0]
        });
      } else {
        rules.push({
          field: 'activityStatus',
          operator: 'in',
          value: simpleCondition.activityStatus
        });
      }
    }

    return {
      combinator: 'and',
      rules: rules,
    };
  };

  const handleSave = () => {
    if (!validateGroupName(groupName)) {
      return;
    }

    const trimmedName = {
      ko: (groupName.ko || '').trim(),
      en: (groupName.en || '').trim(),
      vi: (groupName.vi || '').trim(),
    };
    const trimmedDescription = {
      ko: (groupDescription.ko || '').trim(),
      en: (groupDescription.en || '').trim(),
      vi: (groupDescription.vi || '').trim(),
    };

    // 중복 체크 (편집 중인 경우 자기 자신 제외) - 입력된 언어 중 하나로 체크
    const checkLanguage = trimmedName.ko ? 'ko' : trimmedName.en ? 'en' : 'vi';
    const currentLanguageName = trimmedName[checkLanguage];

    if (currentLanguageName) {
      const isDuplicate = groups.some((g) => {
        const existingName = typeof g.name === 'string'
          ? g.name
          : (g.name as MultilingualContent)[checkLanguage];
        return existingName === currentLanguageName && (!editingGroup || g.id !== editingGroup.id);
      });
      if (isDuplicate) {
        setGroupNameError(getCommonText('groupNameDuplicate', language));
        return;
      }
    }

    // 현재 모드에 따라 쿼리 결정
    const finalQuery = conditionMode === 0 ? buildQueryFromSimple() : query;

    // 상세 설정이 활성화된 경우 조건이 있는지 확인
    if (enabledConditionMode === 1) {
      if (!query.rules || query.rules.length === 0) {
        // 저장 버튼 근처에 경고 Popover 표시
        if (saveButtonRef.current) {
          setWarningPopoverAnchor(saveButtonRef.current);
          // 2.5초 후 자동으로 닫기
          setTimeout(() => {
            setWarningPopoverAnchor(null);
          }, 2500);
        }
        return;
      }
    }

    // 조회하기를 눌렀는지 확인 (memberCountCheckedAt이 있어야 함)
    if (!memberCountCheckedAt) {
      // 저장 버튼 근처에 경고 Popover 표시
      if (saveButtonRef.current) {
        setWarningPopoverAnchor(saveButtonRef.current);
        // 2.5초 후 자동으로 닫기
        setTimeout(() => {
          setWarningPopoverAnchor(null);
        }, 2500);
      }
      return;
    }

    // 멤버 수는 조회를 했다면 그 값을, 아니면 0으로 저장 (실제로는 백엔드에서 계산)
    const count = memberCount !== null ? memberCount : 0;

    if (editingGroup) {
      // 수정
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: trimmedName,
                description: trimmedDescription.ko || trimmedDescription.en || trimmedDescription.vi ? trimmedDescription : undefined,
                query: finalQuery.rules.length > 0 ? finalQuery : undefined,
                memberCount: memberCount !== null ? memberCount : g.memberCount, // 조회된 값이 있으면 업데이트
                memberCountCheckedAt: memberCountCheckedAt || undefined, // 조회 시간 저장
                updatedAt: new Date().toISOString(),
              }
            : g
        )
      );
      showSnackbar(getCommonText('groupUpdated', language), 'success', 3000);
    } else {
      // 추가
      const newGroup: SendGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: trimmedName,
        description: trimmedDescription.ko || trimmedDescription.en || trimmedDescription.vi ? trimmedDescription : undefined,
        memberCount: count,
        query: finalQuery.rules.length > 0 ? finalQuery : undefined,
        memberCountCheckedAt: memberCountCheckedAt || undefined, // 조회 시간 저장
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newGroup]);
      showSnackbar(getCommonText('groupAdded', language), 'success', 3000);
    }

    handleDialogClose();
  };

  const handleDeleteConfirm = () => {
    if (!deletingGroup) return;

    setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
    showSnackbar(getCommonText('groupDeleted', language), 'success', 3000);

    handleDeleteDialogClose();
  };

  // MUI 스타일의 Query Builder 컨트롤 요소
  const muiControlElements: Partial<Record<string, any>> = useMemo(
    () => ({
      fieldSelector: (props: any) => {
        const handleChange = (e: SelectChangeEvent<string>) => {
          const onChange = props.handleOnChange || props.onChange;
          if (typeof onChange === 'function') {
            onChange(e.target.value);
          }
        };
        const options = Array.isArray(props.options) ? props.options : [];
        const menuItems = options.map((option: any) => (
          <MenuItem key={option.name} value={option.name}>
            {option.label}
          </MenuItem>
        ));
        return (
          <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
            <InputLabel>Field</InputLabel>
            <Select
              value={props.value || ''}
              onChange={handleChange}
              label="Field"
            >
              {menuItems}
            </Select>
          </FormControl>
        );
      },
      operatorSelector: (props: any) => {
        const handleChange = (e: SelectChangeEvent<string>) => {
          const onChange = props.handleOnChange || props.onChange;
          if (typeof onChange === 'function') {
            onChange(e.target.value);
          }
        };
        const options = Array.isArray(props.options) ? props.options : [];
        const menuItems = options.map((option: any) => (
          <MenuItem key={option.name} value={option.name}>
            {option.label}
          </MenuItem>
        ));
        return (
          <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={props.value || ''}
              onChange={handleChange}
              label="Operator"
            >
              {menuItems}
            </Select>
          </FormControl>
        );
      },
      valueEditor: (props: any) => {
        const isMultiple = ['in', 'notIn'].includes(props.operator || '');
        const isBetween = ['between', 'notBetween'].includes(props.operator || '');
        const fieldDataType = props.fieldData?.dataType || props.fieldData?.inputType;

        // Select 타입 필드
        if (props.fieldData?.valueEditorType === 'select') {
          const handleChange = (e: SelectChangeEvent<string | string[]>) => {
            const onChange = props.handleOnChange || props.onChange;
            if (typeof onChange === 'function') {
              // 다중 선택일 경우, 값이 배열로 오지만 react-querybuilder는 보통 쉼표로 구분된 문자열을 기대할 수 있음
              // 하지만 여기서는 내부 상태 관리를 위해 배열 그대로 전달하거나, 필요시 문자열로 변환
              onChange(e.target.value);
            }
          };
          const values = Array.isArray(props.fieldData?.values) ? props.fieldData.values : [];
          const menuItems = values.map((val: { name: string; label: string }) => (
            <MenuItem key={val.name} value={val.name}>
              {val.label}
            </MenuItem>
          ));

          let selectValue = props.value;
          if (isMultiple) {
             if (typeof selectValue === 'string') {
                selectValue = selectValue ? selectValue.split(',') : [];
             } else if (!Array.isArray(selectValue)) {
                selectValue = [];
             }
          } else {
             selectValue = selectValue || '';
          }

          return (
            <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
              <InputLabel>Value</InputLabel>
              <Select
                value={selectValue}
                onChange={handleChange}
                label="Value"
                multiple={isMultiple}
              >
                {menuItems}
              </Select>
            </FormControl>
          );
        }

        // Date 타입 필드
        if (fieldDataType === 'date') {
          if (isBetween) {
            // Between 연산자: 두 개의 날짜 선택 필드
            const valueArray = Array.isArray(props.value) ? props.value : props.value ? [props.value] : [null, null];
            const handleChange1 = (newValue: Dayjs | null) => {
              const onChange = props.handleOnChange || props.onChange;
              if (typeof onChange === 'function') {
                const dateStr1 = newValue ? newValue.format('YYYY-MM-DD') : '';
                onChange([dateStr1, valueArray[1] || '']);
              }
            };
            const handleChange2 = (newValue: Dayjs | null) => {
              const onChange = props.handleOnChange || props.onChange;
              if (typeof onChange === 'function') {
                const dateStr2 = newValue ? newValue.format('YYYY-MM-DD') : '';
                onChange([valueArray[0] || '', dateStr2]);
              }
            };
            return (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mr: 1 }}>
                  <DatePicker
                    value={valueArray[0] ? dayjs(valueArray[0]) : null}
                    onChange={handleChange1}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 120 },
                      },
                      actionBar: {
                        actions: ['clear', 'today'],
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    and
                  </Typography>
                  <DatePicker
                    value={valueArray[1] ? dayjs(valueArray[1]) : null}
                    onChange={handleChange2}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 120 },
                      },
                      actionBar: {
                        actions: ['clear', 'today'],
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            );
          }
          // 일반 연산자: 하나의 날짜 선택 필드
          const handleChange = (newValue: Dayjs | null) => {
            const onChange = props.handleOnChange || props.onChange;
            if (typeof onChange === 'function') {
              onChange(newValue ? newValue.format('YYYY-MM-DD') : '');
            }
          };
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <DatePicker
                value={props.value ? dayjs(props.value) : null}
                onChange={handleChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    placeholder: 'Value',
                    sx: { minWidth: 150, mr: 1 },
                  },
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
          );
        }

        // DateTime 타입 필드
        if (fieldDataType === 'datetime') {
          if (isBetween) {
            // Between 연산자: 두 개의 날짜+시간 선택 필드
            const valueArray = Array.isArray(props.value) ? props.value : props.value ? [props.value] : [null, null];
            const handleChange1 = (newValue: Dayjs | null) => {
              const onChange = props.handleOnChange || props.onChange;
              if (typeof onChange === 'function') {
                const dateTimeStr1 = newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '';
                onChange([dateTimeStr1, valueArray[1] || '']);
              }
            };
            const handleChange2 = (newValue: Dayjs | null) => {
              const onChange = props.handleOnChange || props.onChange;
              if (typeof onChange === 'function') {
                const dateTimeStr2 = newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '';
                onChange([valueArray[0] || '', dateTimeStr2]);
              }
            };
            return (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mr: 1 }}>
                  <DateTimePicker
                    value={valueArray[0] ? dayjs(valueArray[0]) : null}
                    onChange={handleChange1}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 150 },
                      },
                      actionBar: {
                        actions: ['clear', 'today'],
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    and
                  </Typography>
                  <DateTimePicker
                    value={valueArray[1] ? dayjs(valueArray[1]) : null}
                    onChange={handleChange2}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 150 },
                      },
                      actionBar: {
                        actions: ['clear', 'today'],
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            );
          }
          // 일반 연산자: 하나의 날짜+시간 선택 필드
          const handleChange = (newValue: Dayjs | null) => {
            const onChange = props.handleOnChange || props.onChange;
            if (typeof onChange === 'function') {
              onChange(newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : '');
            }
          };
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={props.value ? dayjs(props.value) : null}
                onChange={handleChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    placeholder: 'Value',
                    sx: { minWidth: 150, mr: 1 },
                  },
                  actionBar: {
                    actions: ['clear', 'today'],
                  },
                }}
              />
            </LocalizationProvider>
          );
        }

        // 기본 텍스트/숫자 필드
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const onChange = props.handleOnChange || props.onChange;
          if (typeof onChange === 'function') {
            onChange(e.target.value);
          }
        };
        return (
          <TextField
            size="small"
            type={props.fieldData?.inputType || 'text'}
            value={props.value || ''}
            onChange={handleChange}
            placeholder="Value"
            sx={{ minWidth: 150, mr: 1 }}
          />
        );
      },
      combinatorSelector: (props: any) => {
        const handleChange = (e: SelectChangeEvent<string>) => {
          const onChange = props.handleOnChange || props.onChange;
          if (typeof onChange === 'function') {
            onChange(e.target.value);
          }
        };
        const options = Array.isArray(props.options) ? props.options : [];
        const menuItems = options.map((option: any) => (
          <MenuItem key={option.name} value={option.name}>
            {option.label}
          </MenuItem>
        ));
        return (
          <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
            <InputLabel>Combinator</InputLabel>
            <Select
              value={props.value || 'and'}
              onChange={handleChange}
              label="Combinator"
            >
              {menuItems}
            </Select>
          </FormControl>
        );
      },
      addRuleAction: (props: any) => (
        <Button
          size="medium"
          variant="outlined"
          startIcon={<AddCircle />}
          onClick={props.handleOnClick}
          sx={{ textTransform: 'none', mr: 1 }}
        >
          {getCommonText('addRule', language)}
        </Button>
      ),
      addGroupAction: (props: any) => (
        <Button
          size="medium"
          variant="outlined"
          startIcon={<AddCircle />}
          onClick={props.handleOnClick}
          sx={{ textTransform: 'none', mr: 1 }}
        >
          {getCommonText('addQueryGroup', language)}
        </Button>
      ),
      removeRuleAction: (props: any) => (
        <IconButton size="small" onClick={props.handleOnClick} color="error" sx={{ ml: 1 }}>
          <RemoveCircle fontSize="small" />
        </IconButton>
      ),
      removeGroupAction: (props: any) => (
        <IconButton size="small" onClick={props.handleOnClick} color="error" sx={{ ml: 1 }}>
          <RemoveCircle fontSize="small" />
        </IconButton>
      ),
    }),
    [language]
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {getPageText('mailGroup', language).title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        {getPageText('mailGroup', language).description}
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
        <MainCard>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClick}
              sx={{ textTransform: 'none' }}
            >
              {getCommonText('addGroup', language)}
            </Button>
          </Box>
          <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{getCommonText('groupName', language)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', width: '200px', minWidth: '200px', maxWidth: '200px' }}>{getCommonText('description', language)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>국적</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>연령</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>성별</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>가입 유형</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>가입 방식</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>가입 일자</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>구독 여부</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>활동 여부</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{getCommonText('members', language)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {getCommonText('actions', language)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingGroups ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary">
                        {isCheckingCount ? '인원을 조회하는 중...' : '그룹 목록을 불러오는 중...'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="text.secondary">
                        {getCommonText('noGroupsRegistered', language)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => {
                  const displayData = formatQueryForDisplay(group.query);
                  return (
                    <TableRow
                      key={group.id}
                      hover
                      onClick={() => handleEditClick(group)}
                      sx={{ cursor: 'pointer' }}
                    >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {typeof group.name === 'string' ? group.name : group.name.ko}
                      </Typography>
                    </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', width: '200px', minWidth: '200px', maxWidth: '200px', overflow: 'hidden' }}>
                        <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {group.description
                          ? typeof group.description === 'string'
                            ? group.description
                            : group.description[language] || group.description.ko
                          : '-'}
                      </Typography>
                    </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                          {displayData.nationality}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.ageRange}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.gender}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.userType}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.signupMethod}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.signupDate}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.subscriptionStatus}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" noWrap>
                          {displayData.activityStatus}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <Typography variant="body2" noWrap>
                            {group.memberCount?.toLocaleString() || 0} {getCommonText('memberCount', language)}
                          </Typography>
                          <Tooltip title="인원을 다시 조회합니다.">
                        <IconButton
                          size="small"
                              onClick={(e) => handleRefreshMemberCount(group, e)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: 'primary.main',
                                  bgcolor: 'action.hover',
                                },
                              }}
                        >
                              <Refresh fontSize="small" />
                        </IconButton>
                      </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title={getCommonText('delete', language)}>
                        <IconButton
                          size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(group);
                            }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </TableContainer>
        </MainCard>
      </Paper>

      {/* 그룹 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {editingGroup ? getCommonText('editGroup', language) : getCommonText('addGroup', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            {/* 설정 선택 및 조건 UI */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                borderTop: '1px solid',
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* 그룹 이름 */}
              <DescriptionItem label="그룹 이름" span={2}>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
                  size="small"
              value={groupName.ko || ''}
              onChange={(e) => {
                const value = e.target.value;
                setGroupName({ ko: value, en: value, vi: value });
                setGroupNameError('');
              }}
              error={!!groupNameError}
              helperText={groupNameError}
                  sx={{ bgcolor: 'background.paper' }}
            />
              </DescriptionItem>

              {/* 설명 */}
              <DescriptionItem label="설명 (선택사항)" span={2}>
            <TextField
              fullWidth
              variant="outlined"
                  size="small"
              multiline
              rows={3}
              value={groupDescription.ko}
              onChange={(e) => {
                const value = e.target.value;
                setGroupDescription({ ko: value, en: value, vi: value });
              }}
                  sx={{ bgcolor: 'background.paper' }}
            />
              </DescriptionItem>

              {/* 설정 선택 */}
              <DescriptionItem label="설정" span={2}>
                <FormControl>
                  <RadioGroup
                    row
                    value={conditionMode}
                    onChange={(e) => {
                      const newMode = parseInt(e.target.value);
                      setConditionMode(newMode);
                      setEnabledConditionMode(newMode);

                      // 설정 변경 시 관련 항목 초기화
                      if (newMode === 0) {
                        // 간편 설정 선택 시 상세 설정 초기화
                        setQuery({ combinator: 'and', rules: [] });
                        setConvertedQuery('');
                      } else {
                        // 상세 설정 선택 시 간편 설정 초기화
                        setSimpleCondition({
                          nationality: ['ALL'],
                          ageRange: [0, 100],
                          gender: ['ALL'],
                          userType: ['ALL'],
                          signupMethod: ['ALL'],
                          signupDateRange: [null, null],
                          subscriptionStatus: ['ALL'],
                          activityStatus: ['ALL'],
                        });
                      }
                      // 조회 결과도 초기화
                      setMemberCount(null);
                      setMemberCountCheckedAt(null);
                    }}
                  >
                    <FormControlLabel value={0} control={<Radio />} label="간편 설정" />
                    <FormControlLabel value={1} control={<Radio />} label="상세 설정(Query Builder)" />
                  </RadioGroup>
                </FormControl>
              </DescriptionItem>

              {/* 간편 설정 UI */}
              {conditionMode === 0 && (
                <>
                  <DescriptionItem label="국적" span={2}>
                  <FormControl fullWidth size="small">
                    <Select
                      multiple
                      value={simpleCondition.nationality}
                      onChange={(e) => {
                        const { value } = e.target;
                        const newValues = typeof value === 'string' ? value.split(',') : value;

                        updateSimpleCondition(prev => {
                          const prevValues = prev.nationality;
                          // 'ALL'이 선택된 상태에서 다른 것을 선택한 경우 -> 'ALL' 제거
                          if (prevValues.includes('ALL') && newValues.length > 1) {
                            return { ...prev, nationality: newValues.filter(v => v !== 'ALL') };
                          }
                          // 다른 것이 선택된 상태에서 'ALL'을 선택한 경우 -> 'ALL'만 선택
                          if (!prevValues.includes('ALL') && newValues.includes('ALL')) {
                            return { ...prev, nationality: ['ALL'] };
                          }
                          // 선택된 것이 없는 경우 -> 'ALL' 선택
                          if (newValues.length === 0) {
                            return { ...prev, nationality: ['ALL'] };
                          }
                          // 그 외의 경우 (다른 것 추가/제거)
                          return { ...prev, nationality: newValues.filter(v => v !== 'ALL') };
                        });
                      }}
                      renderValue={(selected) => {
                        if (selected.includes('ALL')) return '전체';
                        const labels: Record<string, string> = { 'KR': '한국 (KR)', 'US': '미국 (US)', 'VN': '베트남 (VN)' };
                        return selected.map(val => labels[val] || val).join(', ');
                      }}
                      sx={{ bgcolor: 'background.paper' }}
                      disabled={enabledConditionMode !== 0}
                    >
                      <MenuItem value="ALL">전체</MenuItem>
                      <MenuItem value="KR">한국 (KR)</MenuItem>
                      <MenuItem value="US">미국 (US)</MenuItem>
                      <MenuItem value="VN">베트남 (VN)</MenuItem>
                    </Select>
                  </FormControl>
                </DescriptionItem>

                <DescriptionItem label="가입 유형" span={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            simpleCondition.userType.includes('ALL') ||
                            (simpleCondition.userType.includes(UserType.Student) &&
                             simpleCondition.userType.includes(UserType.Instructor) &&
                             simpleCondition.userType.includes(UserType.Partner))
                          }
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              if (e.target.checked) {
                                // 전체 선택 시 모든 항목 선택
                                return { ...prev, userType: ['ALL', UserType.Student, UserType.Instructor, UserType.Partner] };
                              } else {
                                // 전체 해제 시 모든 항목 해제
                                return { ...prev, userType: [] };
                              }
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="전체"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.userType.includes(UserType.Student)}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.userType;
                              let newValues: string[];

                              if (e.target.checked) {
                                // 체크 시: 'ALL' 제거하고 해당 항목 추가
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes(UserType.Student)) {
                                  newValues.push(UserType.Student);
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = [UserType.Student, UserType.Instructor, UserType.Partner];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                // 체크 해제 시: 해당 항목 제거
                                newValues = prevValues.filter(v => v !== UserType.Student && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', UserType.Student, UserType.Instructor, UserType.Partner];
                                }
                              }
                              return { ...prev, userType: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="학생"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.userType.includes(UserType.Instructor)}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.userType;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes(UserType.Instructor)) {
                                  newValues.push(UserType.Instructor);
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = [UserType.Student, UserType.Instructor, UserType.Partner];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== UserType.Instructor && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', UserType.Student, UserType.Instructor, UserType.Partner];
                                }
                              }
                              return { ...prev, userType: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="강사"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.userType.includes(UserType.Partner)}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.userType;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes(UserType.Partner)) {
                                  newValues.push(UserType.Partner);
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = [UserType.Student, UserType.Instructor, UserType.Partner];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== UserType.Partner && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', UserType.Student, UserType.Instructor, UserType.Partner];
                                }
                              }
                              return { ...prev, userType: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="파트너"
                    />
                  </Box>
                </DescriptionItem>

                <DescriptionItem label="성별" span={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            simpleCondition.gender.includes('ALL') ||
                            (simpleCondition.gender.includes(UserGender.Male) &&
                             simpleCondition.gender.includes(UserGender.Female))
                          }
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              if (e.target.checked) {
                                // 전체 선택 시 모든 항목 선택
                                return { ...prev, gender: ['ALL', UserGender.Male, UserGender.Female] };
                              } else {
                                // 전체 해제 시 모든 항목 해제
                                return { ...prev, gender: [] };
                              }
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="전체"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.gender.includes(UserGender.Male)}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.gender;
                              let newValues: string[];

                              if (e.target.checked) {
                                // 체크 시: 'ALL' 제거하고 해당 항목 추가
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes(UserGender.Male)) {
                                  newValues.push(UserGender.Male);
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = [UserGender.Male, UserGender.Female];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                // 체크 해제 시: 해당 항목 제거
                                newValues = prevValues.filter(v => v !== UserGender.Male && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', UserGender.Male, UserGender.Female];
                                }
                              }
                              return { ...prev, gender: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="남성"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.gender.includes(UserGender.Female)}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.gender;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes(UserGender.Female)) {
                                  newValues.push(UserGender.Female);
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = [UserGender.Male, UserGender.Female];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== UserGender.Female && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', UserGender.Male, UserGender.Female];
                                }
                              }
                              return { ...prev, gender: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="여성"
                    />
                  </Box>
                </DescriptionItem>

                <DescriptionItem label="연령" span={2}>
                   <Box sx={{ width: '50%', px: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={simpleCondition.ageRange[0]}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          updateSimpleCondition(prev => ({ ...prev, ageRange: [val, Math.max(val, prev.ageRange[1])] }));
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">세</InputAdornment>,
                        }}
                        sx={{ width: '100px' }}
                        disabled={enabledConditionMode !== 0}
                      />
                      <Typography variant="body2" color="text.secondary">~</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={simpleCondition.ageRange[1]}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                          updateSimpleCondition(prev => ({ ...prev, ageRange: [Math.min(val, prev.ageRange[0]), val] }));
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">세</InputAdornment>,
                        }}
                        sx={{ width: '100px' }}
                        disabled={enabledConditionMode !== 0}
                      />
                    </Box>
                    <Slider
                      value={simpleCondition.ageRange}
                      onChange={(_e, newValue) => updateSimpleCondition(prev => ({ ...prev, ageRange: newValue as number[] }))}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100}
                      disabled={enabledConditionMode !== 0}
                    />
                  </Box>
                </DescriptionItem>

                <DescriptionItem label="가입 방식" span={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            simpleCondition.signupMethod.includes('ALL') ||
                            (simpleCondition.signupMethod.includes('email') &&
                             simpleCondition.signupMethod.includes('google') &&
                             simpleCondition.signupMethod.includes('facebook') &&
                             simpleCondition.signupMethod.includes('kakao'))
                          }
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              if (e.target.checked) {
                                return { ...prev, signupMethod: ['ALL', 'email', 'google', 'facebook', 'kakao'] };
                              } else {
                                return { ...prev, signupMethod: [] };
                              }
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="전체"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.signupMethod.includes('email')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.signupMethod;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('email')) {
                                  newValues.push('email');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['email', 'google', 'facebook', 'kakao'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'email' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'email', 'google', 'facebook', 'kakao'];
                                }
                              }
                              return { ...prev, signupMethod: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="이메일"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.signupMethod.includes('google')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.signupMethod;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('google')) {
                                  newValues.push('google');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['email', 'google', 'facebook', 'kakao'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'google' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'email', 'google', 'facebook', 'kakao'];
                                }
                              }
                              return { ...prev, signupMethod: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="구글"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.signupMethod.includes('facebook')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.signupMethod;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('facebook')) {
                                  newValues.push('facebook');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['email', 'google', 'facebook', 'kakao'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'facebook' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'email', 'google', 'facebook', 'kakao'];
                                }
                              }
                              return { ...prev, signupMethod: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="페이스북"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.signupMethod.includes('kakao')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.signupMethod;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('kakao')) {
                                  newValues.push('kakao');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['email', 'google', 'facebook', 'kakao'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'kakao' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'email', 'google', 'facebook', 'kakao'];
                                }
                              }
                              return { ...prev, signupMethod: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="카카오"
                    />
                  </Box>
                </DescriptionItem>

                <DescriptionItem label="가입 일자" span={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <DatePicker
                        label="시작일"
                        value={simpleCondition.signupDateRange[0]}
                        onChange={(newValue) => {
                          updateSimpleCondition((prev) => ({
                            ...prev,
                            signupDateRange: [newValue, prev.signupDateRange[1]],
                          }));
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { width: '200px' },
                          },
                        }}
                        disabled={enabledConditionMode !== 0}
                      />
                      <Typography variant="body2" color="text.secondary">~</Typography>
                      <DatePicker
                        label="종료일"
                        value={simpleCondition.signupDateRange[1]}
                        onChange={(newValue) => {
                          updateSimpleCondition((prev) => ({
                            ...prev,
                            signupDateRange: [prev.signupDateRange[0], newValue],
                          }));
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { width: '200px' },
                          },
                        }}
                        disabled={enabledConditionMode !== 0}
                        minDate={simpleCondition.signupDateRange[0] || undefined}
                      />
                    </Box>
                  </LocalizationProvider>
                </DescriptionItem>

                <DescriptionItem label="구독 여부" span={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            simpleCondition.subscriptionStatus.includes('ALL') ||
                            (simpleCondition.subscriptionStatus.includes('subscribed') &&
                             simpleCondition.subscriptionStatus.includes('unsubscribed'))
                          }
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              if (e.target.checked) {
                                return { ...prev, subscriptionStatus: ['ALL', 'subscribed', 'unsubscribed'] };
                              } else {
                                return { ...prev, subscriptionStatus: [] };
                              }
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="전체"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.subscriptionStatus.includes('subscribed')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.subscriptionStatus;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('subscribed')) {
                                  newValues.push('subscribed');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['subscribed', 'unsubscribed'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'subscribed' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'subscribed', 'unsubscribed'];
                                }
                              }
                              return { ...prev, subscriptionStatus: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="구독"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.subscriptionStatus.includes('unsubscribed')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.subscriptionStatus;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('unsubscribed')) {
                                  newValues.push('unsubscribed');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['subscribed', 'unsubscribed'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'unsubscribed' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'subscribed', 'unsubscribed'];
                                }
                              }
                              return { ...prev, subscriptionStatus: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="구독 해지"
                    />
                  </Box>
                </DescriptionItem>

                <DescriptionItem label="활동 여부" span={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            simpleCondition.activityStatus.includes('ALL') ||
                            (simpleCondition.activityStatus.includes('active') &&
                             simpleCondition.activityStatus.includes('inactive'))
                          }
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              if (e.target.checked) {
                                return { ...prev, activityStatus: ['ALL', 'active', 'inactive'] };
                              } else {
                                return { ...prev, activityStatus: [] };
                              }
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="전체"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.activityStatus.includes('active')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.activityStatus;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('active')) {
                                  newValues.push('active');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['active', 'inactive'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'active' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'active', 'inactive'];
                                }
                              }
                              return { ...prev, activityStatus: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="활동"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={simpleCondition.activityStatus.includes('inactive')}
                          onChange={(e) => {
                            updateSimpleCondition((prev) => {
                              const prevValues = prev.activityStatus;
                              let newValues: string[];

                              if (e.target.checked) {
                                newValues = prevValues.filter(v => v !== 'ALL');
                                if (!newValues.includes('inactive')) {
                                  newValues.push('inactive');
                                }
                                // 모든 개별 항목이 체크되어 있으면 'ALL' 추가
                                const allItems = ['active', 'inactive'];
                                if (allItems.every(item => newValues.includes(item))) {
                                  newValues.push('ALL');
                                }
                              } else {
                                newValues = prevValues.filter(v => v !== 'inactive' && v !== 'ALL');
                                // 모든 개별 항목이 해제되면 전체 선택 상태로 복귀
                                if (newValues.length === 0) {
                                  newValues = ['ALL', 'active', 'inactive'];
                                }
                              }
                              return { ...prev, activityStatus: newValues };
                            });
                          }}
                          disabled={enabledConditionMode !== 0}
                        />
                      }
                      label="비활동"
                    />
                  </Box>
                </DescriptionItem>
                </>
              )}

              {/* 상세 설정 UI */}
              {conditionMode === 1 && (
                <>
                  <DescriptionItem label="국적" span={2}>
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        value={simpleCondition.nationality}
                        onChange={(e) => {
                          const { value } = e.target;
                          const newValues = typeof value === 'string' ? value.split(',') : value;

                          updateSimpleCondition(prev => {
                            const prevValues = prev.nationality;
                            // 'ALL'이 선택된 상태에서 다른 것을 선택한 경우 -> 'ALL' 제거
                            if (prevValues.includes('ALL') && newValues.length > 1) {
                              return { ...prev, nationality: newValues.filter(v => v !== 'ALL') };
                            }
                            // 다른 것이 선택된 상태에서 'ALL'을 선택한 경우 -> 'ALL'만 선택
                            if (!prevValues.includes('ALL') && newValues.includes('ALL')) {
                              return { ...prev, nationality: ['ALL'] };
                            }
                            // 선택된 것이 없는 경우 -> 'ALL' 선택
                            if (newValues.length === 0) {
                              return { ...prev, nationality: ['ALL'] };
                            }
                            // 그 외의 경우 (다른 것 추가/제거)
                            return { ...prev, nationality: newValues.filter(v => v !== 'ALL') };
                          });
                        }}
                        renderValue={(selected) => {
                          if (selected.includes('ALL')) return '전체';
                          const labels: Record<string, string> = { 'KR': '한국 (KR)', 'US': '미국 (US)', 'VN': '베트남 (VN)' };
                          return selected.map(val => labels[val] || val).join(', ');
                        }}
                        sx={{ bgcolor: 'background.paper' }}
                        disabled={enabledConditionMode !== 1}
                      >
                        <MenuItem value="ALL">전체</MenuItem>
                        <MenuItem value="KR">한국 (KR)</MenuItem>
                        <MenuItem value="US">미국 (US)</MenuItem>
                        <MenuItem value="VN">베트남 (VN)</MenuItem>
                      </Select>
                    </FormControl>
                  </DescriptionItem>
                </>
              )}
            </Box>

            {/* 상세 설정 Query Builder 영역 */}
            {conditionMode === 1 && (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  opacity: enabledConditionMode === 1 ? 1 : 0.5,
                  pointerEvents: enabledConditionMode === 1 ? 'auto' : 'none',
                  mt: 2,
                  '& .ruleGroup': {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1.5,
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 2,
                  },
                  '& .rule': {
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .ruleGroup-addGroup': {
                    mt: 1,
                  },
                }}
              >
                <QueryBuilder
                controlElements={muiControlElements}
                operators={[
                  { name: '=', label: 'Equals' },
                  { name: '!=', label: 'Not Equals' },
                  { name: '<', label: 'Less Than' },
                  { name: '<=', label: 'Less Than Or Equal' },
                  { name: '>', label: 'Greater Than' },
                  { name: '>=', label: 'Greater Than Or Equal' },
                  { name: 'contains', label: 'Contains' },
                  { name: 'doesNotContain', label: 'Does Not Contain' },
                  { name: 'beginsWith', label: 'Begins With' },
                  { name: 'doesNotBeginWith', label: 'Does Not Begin With' },
                  { name: 'endsWith', label: 'Ends With' },
                  { name: 'doesNotEndWith', label: 'Does Not End With' },
                  { name: 'in', label: 'In' },
                  { name: 'notIn', label: 'Not In' },
                  { name: 'between', label: 'Between' },
                  { name: 'notBetween', label: 'Not Between' },
                  { name: 'null', label: 'Is Null' },
                  { name: 'notNull', label: 'Is Not Null' },
                ]}
                fields={[
                  {
                    name: 'userId',
                    label: 'User ID',
                  },
                  {
                    name: 'userName',
                    label: 'User Name',
                  },
                  {
                    name: 'userEmail',
                    label: 'Email',
                  },
                  {
                    name: 'userType',
                    label: 'User Type',
                    valueEditorType: 'select',
                    values: [
                      { name: UserType.Student, label: 'Student' },
                      { name: UserType.Instructor, label: 'Instructor' },
                      { name: UserType.Partner, label: 'Partner' },
                    ],
                  },
                  {
                    name: 'userGender',
                    label: 'Gender',
                    valueEditorType: 'select',
                    values: [
                      { name: UserGender.Male, label: 'Male' },
                      { name: UserGender.Female, label: 'Female' },
                      { name: UserGender.Other, label: 'Other' },
                    ],
                  },
                  {
                    name: 'userAge',
                    label: 'Age',
                    inputType: 'number',
                  },
                  {
                    name: 'birthDate',
                    label: 'Birth Date',
                    dataType: 'date',
                  },
                  {
                    name: 'createdAt',
                    label: 'Created At',
                    dataType: 'datetime',
                  },
                  {
                    name: 'updatedAt',
                    label: 'Updated At',
                    dataType: 'datetime',
                  },
                ]}
                query={query}
                onQueryChange={handleQueryChange}
                disabled={enabledConditionMode !== 1}
                translations={{
                  fields: { title: 'Field' },
                  operators: { title: 'Operator' },
                  value: { title: 'Value' },
                  removeRule: { label: getCommonText('removeRule', language) },
                  removeGroup: { label: getCommonText('removeGroup', language) },
                  addRule: { label: getCommonText('addRule', language) },
                  addGroup: { label: getCommonText('addQueryGroup', language) },
                  combinators: { title: 'Combinator' },
                }}
                combinators={[
                  { name: 'and', label: 'And' },
                  { name: 'or', label: 'Or' },
                ]}
                  />
                  {/* 변환 결과 표시 영역 */}
                  {query.rules.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {getCommonText('convertedQuery', language)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant={convertFormat === 'natural_language' ? 'contained' : 'outlined'}
                            startIcon={<Language />}
                            onClick={() => handleFormatChange('natural_language')}
                            sx={{ textTransform: 'none' }}
                          >
                            {getCommonText('convertToNaturalLanguage', language)}
                          </Button>
                          <Button
                            size="small"
                            variant={convertFormat === 'sql' ? 'contained' : 'outlined'}
                            startIcon={<Storage />}
                            onClick={() => handleFormatChange('sql')}
                            sx={{ textTransform: 'none' }}
                          >
                            {getCommonText('convertToSQL', language)}
                          </Button>
                          <Button
                            size="small"
                            variant={convertFormat === 'json' ? 'contained' : 'outlined'}
                            startIcon={<Code />}
                            onClick={() => handleFormatChange('json')}
                            sx={{ textTransform: 'none' }}
                          >
                            {getCommonText('convertToJSON', language)}
                          </Button>
                        </Box>
                      </Box>
                      {convertedQuery ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={convertedQuery}
                          variant="outlined"
                          onClick={handleCopyConvertedQuery}
                          sx={{
                            '& .MuiInputBase-root': {
                              cursor: 'pointer',
                            },
                            '& .MuiInputBase-input': {
                              cursor: 'pointer',
                            },
                          }}
                          InputProps={{
                            readOnly: true,
                            sx: {
                              fontFamily: convertFormat === 'sql' || convertFormat === 'json' ? 'monospace' : 'inherit',
                              fontSize: convertFormat === 'sql' || convertFormat === 'json' ? '0.875rem' : 'inherit',
                              bgcolor: 'background.default',
                              cursor: 'pointer',
                              '& input': {
                                cursor: 'pointer',
                              },
                              '& textarea': {
                                cursor: 'pointer',
                              },
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          {getCommonText('noConditionsToConvert', language)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
            )}
          </Box>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                onClick={handleCheckCount}
                disabled={isCheckingCount}
                startIcon={isCheckingCount ? <CircularProgress size={20} color="inherit" /> : <Search />}
                sx={{
                  minWidth: 100,
                  bgcolor: 'grey.800',
                  color: 'common.white',
                  '&:hover': {
                    bgcolor: 'grey.900',
                  },
                }}
              >
                {isCheckingCount ? '조회 중...' : '조회하기'}
              </Button>
            <Box display="flex" alignItems="center" gap={3} marginTop={2}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                현재 설정된 조건으로 예상 발송 인원을 조회합니다.
              </Typography>
              {memberCount !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    예상 발송 인원:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {memberCount.toLocaleString()}명
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ textTransform: 'none' }}>
            {getCommonText('cancel', language)}
          </Button>
          <Button
            ref={saveButtonRef}
            onClick={handleSave}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            {getCommonText('save', language)}
          </Button>
          {/* 경고 Popover */}
          <Popover
            open={Boolean(warningPopoverAnchor)}
            anchorEl={warningPopoverAnchor}
            onClose={() => setWarningPopoverAnchor(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            sx={{
              '& .MuiPaper-root': {
                maxWidth: 400,
                overflow: 'hidden',
              },
            }}
          >
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{
                bgcolor: 'warning.lighter',
                color: 'warning.darker',
                border: '1px solid',
                borderColor: 'warning.main',
                boxShadow: 2,
                m: 0,
                '& .MuiAlert-icon': {
                  color: 'warning.main',
                  fontSize: '1.5rem',
                },
                '& .MuiAlert-message': {
                  fontWeight: 600,
                  fontSize: '0.95rem',
                },
              }}
            >
              {(() => {
                // 상세 설정이 활성화되고 조건이 없는 경우
                if (enabledConditionMode === 1 && (!query.rules || query.rules.length === 0)) {
                  return '조건을 등록해주세요.';
                }
                return '저장하기 전에 반드시 조회하기를 통해 그룹의 수신자 수를 확인해주세요.';
              })()}
            </Alert>
          </Popover>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {getCommonText('deleteGroup', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {getCommonText('deleteGroupConfirm', language).replace(
              '{name}',
              deletingGroup?.name
                ? typeof deletingGroup.name === 'string'
                  ? deletingGroup.name
                  : deletingGroup.name[language]
                : ''
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} sx={{ textTransform: 'none' }}>
            {getCommonText('cancel', language)}
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            {getCommonText('delete', language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 위로 올라가는 플로팅 버튼 */}
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
          <Fab color="primary" size="medium" onClick={handleScrollTop} aria-label="scroll back to top">
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Zoom>
    </Box>
  );
};

export default MailGroupPage;
