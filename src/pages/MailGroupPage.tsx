import { Add, AddCircle, Code, DeleteOutlined, EditOutlined, KeyboardArrowUp, Language, RemoveCircle, Storage } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
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
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTheme, useColorScheme } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import QueryBuilder, { formatQuery, RuleGroupType } from 'react-querybuilder';
import MainCard from '../components/MainCard';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { mockSendGroups, SendGroup } from '../data/mockSendGroups';
import { UserGender, UserType } from '../types/inquiry';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText, getPageText } from '../utils/pageTexts';

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
      id={`mail-group-tabpanel-${index}`}
      aria-labelledby={`mail-group-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 0 }}>{children}</Box>
    </div>
  );
}

const MailGroupPage = () => {
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const { mode } = useColorScheme();
  const [groups, setGroups] = useState<SendGroup[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SendGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SendGroup | null>(null);
  const [groupName, setGroupName] = useState<MultilingualContent>({ ko: '', en: '', vi: '' });
  const [groupDescription, setGroupDescription] = useState<MultilingualContent>({ ko: '', en: '', vi: '' });
  const [groupNameError, setGroupNameError] = useState('');
  const [languageTab, setLanguageTab] = useState<number>(0);
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [],
  });
  const [convertedQuery, setConvertedQuery] = useState('');
  const [convertFormat, setConvertFormat] = useState<'sql' | 'json' | 'natural_language'>('natural_language');

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
  };

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // 그룹 목록 불러오기
  useEffect(() => {
    loadGroups();
  }, []);

  // GNB 언어 설정에 따라 탭 자동 선택 (다이얼로그가 열려있지 않을 때만)
  useEffect(() => {
    if (!dialogOpen) {
      const getLanguageTabIndex = (lang: 'ko' | 'en' | 'vi'): number => {
        switch (lang) {
          case 'ko':
            return 0;
          case 'en':
            return 1;
          case 'vi':
            return 2;
          default:
            return 0;
        }
      };
      setLanguageTab(getLanguageTabIndex(language));
    }
  }, [language, dialogOpen]);

  // 탭 인덱스를 언어로 변환
  const getTabLanguage = (tabIndex: number): 'ko' | 'en' | 'vi' => {
    switch (tabIndex) {
      case 0:
        return 'ko';
      case 1:
        return 'en';
      case 2:
        return 'vi';
      default:
        return 'ko';
    }
  };

  // 다이얼로그 내에서 사용할 언어 (탭이 선택되어 있으면 탭 언어, 아니면 GNB 언어)
  const dialogLanguage = dialogOpen ? getTabLanguage(languageTab) : language;

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

  const loadGroups = () => {
    // 더미데이터에서 불러오기
    setGroups([...mockSendGroups]);
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
    setQuery({
      combinator: 'and',
      rules: [],
    });
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
    setQuery(group.query || { combinator: 'and', rules: [] });
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
    setQuery({ combinator: 'and', rules: [] });
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

  const validateGroupName = (name: MultilingualContent): boolean => {
    // 최소 하나의 언어에 값이 입력되어야 함
    const koTrimmed = (name.ko || '').trim();
    const enTrimmed = (name.en || '').trim();
    const viTrimmed = (name.vi || '').trim();

    // 입력된 값이 있는지 확인
    const hasAnyValue = koTrimmed || enTrimmed || viTrimmed;
    if (!hasAnyValue) {
      setGroupNameError(getCommonText('groupNameRequired', dialogLanguage));
      return false;
    }

    // 입력된 값이 있는 언어는 최소 2자 이상이어야 함
    if (koTrimmed && koTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', dialogLanguage));
      return false;
    }
    if (enTrimmed && enTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', dialogLanguage));
      return false;
    }
    if (viTrimmed && viTrimmed.length < 2) {
      setGroupNameError(getCommonText('groupNameMinLength', dialogLanguage));
      return false;
    }

    setGroupNameError('');
    return true;
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
    // 우선순위: 현재 언어 > 한국어 > 영어 > 베트남어
    const checkLanguage = trimmedName[dialogLanguage]
      ? dialogLanguage
      : trimmedName.ko
      ? 'ko'
      : trimmedName.en
      ? 'en'
      : 'vi';
    const currentLanguageName = trimmedName[checkLanguage];

    if (currentLanguageName) {
      const isDuplicate = groups.some((g) => {
        const existingName = typeof g.name === 'string'
          ? g.name
          : (g.name as MultilingualContent)[checkLanguage];
        return existingName === currentLanguageName && (!editingGroup || g.id !== editingGroup.id);
      });
      if (isDuplicate) {
        setGroupNameError(getCommonText('groupNameDuplicate', dialogLanguage));
        return;
      }
    }

    if (editingGroup) {
      // 수정
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: trimmedName,
                description: trimmedDescription.ko || trimmedDescription.en || trimmedDescription.vi ? trimmedDescription : undefined,
                query: query.rules.length > 0 ? query : undefined,
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
        memberCount: 0,
        query: query.rules.length > 0 ? query : undefined,
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
              onChange(e.target.value);
            }
          };
          const values = Array.isArray(props.fieldData?.values) ? props.fieldData.values : [];
          const menuItems = values.map((val: { name: string; label: string }) => (
            <MenuItem key={val.name} value={val.name}>
              {val.label}
            </MenuItem>
          ));
          return (
            <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
              <InputLabel>Value</InputLabel>
              <Select
                value={props.value || (isMultiple ? [] : '')}
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
          {getCommonText('addRule', dialogLanguage)}
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
          {getCommonText('addQueryGroup', dialogLanguage)}
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
    [dialogLanguage]
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{getCommonText('description', language)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{getCommonText('members', language)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {getCommonText('actions', language)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="text.secondary">
                        {getCommonText('noGroupsRegistered', language)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {typeof group.name === 'string' ? group.name : group.name[language]}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {group.description
                          ? typeof group.description === 'string'
                            ? group.description
                            : group.description[language]
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {group.memberCount?.toLocaleString() || 0} {getCommonText('memberCount', language)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title={getCommonText('edit', language)}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(group)}
                          sx={{ mr: 1 }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={getCommonText('delete', language)}>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(group)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
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
            {editingGroup ? getCommonText('editGroup', dialogLanguage) : getCommonText('addGroup', dialogLanguage)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Tabs value={languageTab} onChange={(_e, newValue) => setLanguageTab(newValue)}>
              <Tab label="한국어" />
              <Tab label="English" />
              <Tab label="Tiếng Việt" />
            </Tabs>
            <CustomTabPanel value={languageTab} index={0}>
              <TextField
                autoFocus={languageTab === 0}
                margin="dense"
                label="그룹 이름"
                fullWidth
                variant="outlined"
                value={groupName.ko || ''}
                onChange={(e) => {
                  setGroupName((prev) => ({ ...prev, ko: e.target.value }));
                  setGroupNameError('');
                }}
                error={!!groupNameError}
                helperText={groupNameError}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                label="설명 (선택사항)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={groupDescription.ko}
                onChange={(e) => setGroupDescription((prev) => ({ ...prev, ko: e.target.value }))}
                sx={{ mt: 2 }}
              />
            </CustomTabPanel>
            <CustomTabPanel value={languageTab} index={1}>
              <TextField
                autoFocus={languageTab === 1}
                margin="dense"
                label="Group Name"
                fullWidth
                variant="outlined"
                value={groupName.en || ''}
                onChange={(e) => {
                  setGroupName((prev) => ({ ...prev, en: e.target.value }));
                  setGroupNameError('');
                }}
                error={!!groupNameError}
                helperText={groupNameError}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                label="Description (Optional)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={groupDescription.en}
                onChange={(e) => setGroupDescription((prev) => ({ ...prev, en: e.target.value }))}
                sx={{ mt: 2 }}
              />
            </CustomTabPanel>
            <CustomTabPanel value={languageTab} index={2}>
              <TextField
                autoFocus={languageTab === 2}
                margin="dense"
                label="Tên nhóm"
                fullWidth
                variant="outlined"
                value={groupName.vi || ''}
                onChange={(e) => {
                  setGroupName((prev) => ({ ...prev, vi: e.target.value }));
                  setGroupNameError('');
                }}
                error={!!groupNameError}
                helperText={groupNameError}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                label="Mô tả (Tùy chọn)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={groupDescription.vi}
                onChange={(e) => setGroupDescription((prev) => ({ ...prev, vi: e.target.value }))}
                sx={{ mt: 2 }}
              />
            </CustomTabPanel>
          </Box>
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {getCommonText('queryBuilder', dialogLanguage)}
            </Typography>
            <Box
              sx={{
                bgcolor: 'background.paper',
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
                    name: 'userCountry',
                    label: 'Country',
                    valueEditorType: 'select',
                    values: [
                      { name: 'KR', label: 'Korea' },
                      { name: 'US', label: 'United States' },
                      { name: 'VN', label: 'Vietnam' },
                    ],
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
                      {getCommonText('convertedQuery', dialogLanguage)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={convertFormat === 'natural_language' ? 'contained' : 'outlined'}
                        startIcon={<Language />}
                        onClick={() => handleFormatChange('natural_language')}
                        sx={{ textTransform: 'none' }}
                      >
                        {getCommonText('convertToNaturalLanguage', dialogLanguage)}
                      </Button>
                      <Button
                        size="small"
                        variant={convertFormat === 'sql' ? 'contained' : 'outlined'}
                        startIcon={<Storage />}
                        onClick={() => handleFormatChange('sql')}
                        sx={{ textTransform: 'none' }}
                      >
                        {getCommonText('convertToSQL', dialogLanguage)}
                      </Button>
                      <Button
                        size="small"
                        variant={convertFormat === 'json' ? 'contained' : 'outlined'}
                        startIcon={<Code />}
                        onClick={() => handleFormatChange('json')}
                        sx={{ textTransform: 'none' }}
                      >
                        {getCommonText('convertToJSON', dialogLanguage)}
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
                      {getCommonText('noConditionsToConvert', dialogLanguage)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ textTransform: 'none' }}>
            {getCommonText('cancel', dialogLanguage)}
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ textTransform: 'none' }}>
            {getCommonText('save', dialogLanguage)}
          </Button>
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
