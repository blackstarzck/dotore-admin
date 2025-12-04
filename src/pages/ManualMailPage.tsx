import { Add, Clear, DeleteOutlined, EditOutlined, KeyboardArrowUp, Preview, SendOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { manualMailGroups as initialManualMailGroups, MailGroup, MailTemplate } from '../data/mockMailData';
import { mockSendGroups } from '../data/mockSendGroups';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText, getPageText } from '../utils/pageTexts';
import { getManualMailGroups, getSendGroups, getTemplate, saveManualMailGroups, saveTemplate } from '../utils/storage';

const ManualMailPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();

  // localStorage에서 저장된 그룹 불러오기, 없으면 초기 더미데이터 사용
  const storedGroups = getManualMailGroups();
  const [manualMailGroups, setManualMailGroups] = useState<MailGroup[]>(
    storedGroups || initialManualMailGroups
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MailTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSendTemplate, setTestSendTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]); // 나에게 보내기 모달에서 선택된 국적
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState<MultilingualContent>({
    ko: '',
    en: '',
    vi: '',
  });
  const [newTemplateTitle, setNewTemplateTitle] = useState<MultilingualContent>({
    ko: '',
    en: '',
    vi: '',
  });
  const [newTemplateDescription, setNewTemplateDescription] = useState<MultilingualContent>({
    ko: '',
    en: '',
    vi: '',
  });
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [templateNameError, setTemplateNameError] = useState('');
  const [groupNameError, setGroupNameError] = useState('');

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

  const handlePreviewClick = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setPreviewTemplate(template);

    // 저장된 템플릿 내용 불러오기
    const savedTemplate = getTemplate(groupId, String(template.id));
    if (savedTemplate && savedTemplate.content) {
      // MultilingualContent에서 현재 언어에 맞는 컨텐츠 가져오기
      const content = typeof savedTemplate.content === 'string'
        ? savedTemplate.content
        : savedTemplate.content[language];
      setPreviewContent(content);
    } else {
      setPreviewContent(`<p>${getCommonText('noSavedTemplate', language)}</p>`);
    }

    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewTemplate(null);
    setPreviewContent('');
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setNewTemplateDialogOpen(true);
    setSelectedGroupId('');
    setNewTemplateName({ ko: '', en: '', vi: '' });
    setNewTemplateTitle({ ko: '', en: '', vi: '' });
    setNewTemplateDescription({ ko: '', en: '', vi: '' });
    setTemplateNameError('');
  };

  const handleEditTemplate = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setEditingTemplate({ template, groupId });
    setNewTemplateDialogOpen(true);
    setSelectedGroupId(groupId);

    // 템플릿 이름 다국어 처리
    if (typeof template.name === 'string') {
      // 하위 호환성: 단일 문자열을 다국어로 변환
      setNewTemplateName({
        ko: template.name,
        en: template.name,
        vi: template.name,
      });
    } else {
      setNewTemplateName(template.name);
    }

    // 저장된 템플릿에서 다국어 제목 불러오기
    const savedTemplate = getTemplate(groupId, String(template.id));
    if (savedTemplate && savedTemplate.title) {
      setNewTemplateTitle(savedTemplate.title);
    } else {
      // 기존 단일 문자열 제목을 다국어로 변환
      if (typeof template.title === 'string') {
        const defaultTitle = template.title || '';
        setNewTemplateTitle({
          ko: defaultTitle,
          en: defaultTitle,
          vi: defaultTitle,
        });
      } else if (template.title) {
        setNewTemplateTitle(template.title);
      } else {
        setNewTemplateTitle({ ko: '', en: '', vi: '' });
      }
    }

    // 템플릿 설명 다국어 처리
    if (typeof template.description === 'string') {
      // 하위 호환성: 단일 문자열을 다국어로 변환
      const defaultDescription = template.description || '';
      setNewTemplateDescription({
        ko: defaultDescription,
        en: defaultDescription,
        vi: defaultDescription,
      });
    } else if (template.description) {
      setNewTemplateDescription(template.description as MultilingualContent);
    } else {
      setNewTemplateDescription({ ko: '', en: '', vi: '' });
    }
    setTemplateNameError('');
  };

  const handleCloseNewTemplate = () => {
    setNewTemplateDialogOpen(false);
    setEditingTemplate(null);
    setSelectedGroupId('');
    setNewTemplateName({ ko: '', en: '', vi: '' });
    setNewTemplateTitle({ ko: '', en: '', vi: '' });
    setNewTemplateDescription({ ko: '', en: '', vi: '' });
    setTemplateNameError('');
  };

  const handleSaveNewTemplate = () => {
    // 유효성 검사
    if (!selectedGroupId) {
      showSnackbar('템플릿 그룹을 선택해주세요.', 'error', 3000);
      return;
    }

    // 다국어 템플릿 이름 검증
    const validateMultilingualName = (name: MultilingualContent): boolean => {
      return name.ko.trim() !== '' && name.en.trim() !== '' && name.vi.trim() !== '';
    };

    if (!validateMultilingualName(newTemplateName)) {
      setTemplateNameError('템플릿 이름을 입력해주세요.');
      return;
    }

    // 선택된 그룹 찾기
    const selectedGroup = manualMailGroups.find((group) => group.id === selectedGroupId);
    if (!selectedGroup) {
      showSnackbar('선택한 그룹을 찾을 수 없습니다.', 'error', 3000);
      return;
    }

    // 템플릿 이름 중복 확인 (수정 모드일 때는 자기 자신 제외)
    // 한국어 이름으로 중복 확인 (하위 호환성 고려)
    const isDuplicate = selectedGroup.templates.some(
      (template) => {
        if (template.id === editingTemplate?.template.id) {
          return false;
        }
        const existingName = typeof template.name === 'string' ? template.name : template.name.ko;
        return existingName.toLowerCase() === newTemplateName.ko.trim().toLowerCase();
      }
    );
    if (isDuplicate) {
      setTemplateNameError('이미 존재하는 템플릿 이름입니다.');
      return;
    }

    // 다국어 제목 검증
    const validateMultilingualTitle = (title: MultilingualContent): boolean => {
      if (!title || typeof title !== 'object') return false;
      const ko = typeof title.ko === 'string' ? title.ko : String(title.ko || '');
      const en = typeof title.en === 'string' ? title.en : String(title.en || '');
      const vi = typeof title.vi === 'string' ? title.vi : String(title.vi || '');
      return ko.trim() !== '' && en.trim() !== '' && vi.trim() !== '';
    };

    if (!validateMultilingualTitle(newTemplateTitle)) {
      showSnackbar('이메일 제목을 입력해주세요.', 'error', 3000);
      return;
    }

    // 선택한 그룹이 SendGroup인지 확인하고, 조회하기를 눌렀는지 및 memberCount가 0 이상인지 검증
    const sendGroups = getSendGroups();
    const matchedSendGroup = sendGroups.find((sg) => sg.id === selectedGroupId);

    if (matchedSendGroup) {
      // SendGroup인 경우, 조회하기를 눌렀는지 확인 (memberCountCheckedAt이 있어야 함)
      if (!matchedSendGroup.memberCountCheckedAt) {
        showSnackbar('저장하기 전에 반드시 조회하기를 통해 그룹의 수신자 수를 확인해주세요.', 'error', 3000);
        return;
      }

      // memberCount가 0 이상인지 확인
      if (matchedSendGroup.memberCount === undefined || matchedSendGroup.memberCount === null || matchedSendGroup.memberCount <= 0) {
        showSnackbar('설정한 그룹의 수신자 수가 0명입니다. 수신자가 1명 이상인 그룹을 선택해주세요.', 'error', 3000);
        return;
      }
    }

    if (editingTemplate) {
      // 템플릿 수정
      const updatedGroups = manualMailGroups.map((group) => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            templates: group.templates.map((t) =>
              t.id === editingTemplate.template.id
                ? {
                    ...t,
                    name: newTemplateName,
                    title: newTemplateTitle,
                    description: newTemplateDescription,
                  }
                : t
            ),
          };
        }
        return group;
      });

      setManualMailGroups(updatedGroups);
      saveManualMailGroups(updatedGroups as any);

      // 다국어 제목을 별도로 저장 (MailTemplatePage에서 사용)
      const savedTemplate = getTemplate(selectedGroupId, String(editingTemplate.template.id));
      if (savedTemplate) {
        // 기존 저장된 템플릿이 있으면 제목만 업데이트
        saveTemplate(selectedGroupId, String(editingTemplate.template.id), newTemplateTitle, savedTemplate.content);
      }

      showSnackbar('템플릿이 수정되었습니다.', 'success', 3000);
    } else {
      // 새 템플릿 생성 (다음 ID 계산)
      const maxId = Math.max(...manualMailGroups.flatMap((g) => g.templates.map((t) => (typeof t.id === 'number' ? t.id : 0))), 0);
      const newTemplate: MailTemplate = {
        id: maxId + 1,
        name: newTemplateName,
        title: newTemplateTitle,
        description: newTemplateDescription,
      };

      // 그룹에 템플릿 추가
      const updatedGroups = manualMailGroups.map((group) => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            templates: [...group.templates, newTemplate],
          };
        }
        return group;
      });

      setManualMailGroups(updatedGroups);
      saveManualMailGroups(updatedGroups as any);

      // 다국어 제목을 별도로 저장 (MailTemplatePage에서 사용)
      const defaultContent: MultilingualContent = {
        ko: '<p>템플릿 내용을 입력하세요.</p>',
        en: '<p>Please enter template content.</p>',
        vi: '<p>Vui lòng nhập nội dung mẫu.</p>',
      };
      saveTemplate(selectedGroupId, String(newTemplate.id), newTemplateTitle, defaultContent);

      showSnackbar('템플릿이 추가되었습니다.', 'success', 3000);
    }

    handleCloseNewTemplate();
  };

  const handleCloseNewGroup = () => {
    setNewGroupDialogOpen(false);
    setNewGroupName('');
    setGroupNameError('');
  };

  const handleSaveNewGroup = () => {
    if (!newGroupName.trim()) {
      setGroupNameError('그룹 이름을 입력해주세요.');
      return;
    }

    const isDuplicate = manualMailGroups.some((group) => {
      const existingName = typeof group.name === 'string' ? group.name : group.name.ko;
      return existingName.toLowerCase() === newGroupName.trim().toLowerCase();
    });

    if (isDuplicate) {
      setGroupNameError('이미 존재하는 그룹 이름입니다.');
      return;
    }

    const newGroup: MailGroup = {
      id: `group-${Date.now()}`,
      name: {
        ko: newGroupName,
        en: newGroupName,
        vi: newGroupName,
      },
      templates: [],
    };

    const updatedGroups = [...manualMailGroups, newGroup];
    setManualMailGroups(updatedGroups);
    saveManualMailGroups(updatedGroups as any);

    setSelectedGroupId(newGroup.id);
    showSnackbar('새 그룹이 추가되었습니다.', 'success', 3000);
    handleCloseNewGroup();
  };

  // 국적 라벨
  const nationalityLabels: Record<string, string> = {
    KR: '한국',
    US: '미국',
    VN: '베트남',
  };

  // 발송 그룹 목록 (발송 그룹 관리 데이터와 동기화)
  const sendGroups = mockSendGroups;

  // 템플릿이 속한 그룹의 국적 추출
  const availableNationalities = useMemo(() => {
    if (!testSendTemplate) {
      return [];
    }

    const matchedSendGroup = sendGroups.find((sg) => sg.id === testSendTemplate.groupId);

    if (!matchedSendGroup || !matchedSendGroup.query?.rules) {
      return [];
    }

    const nationalitiesSet = new Set<string>();

    matchedSendGroup.query.rules.forEach((rule: any) => {
      if (rule.field === 'userCountry') {
        if (rule.operator === '=') {
          // 단일 값
          nationalitiesSet.add(rule.value);
        } else if (rule.operator === 'in') {
          // 여러 값 (문자열 또는 배열)
          if (typeof rule.value === 'string') {
            rule.value.split(',').forEach((v: string) => {
              const trimmed = v.trim();
              if (trimmed) nationalitiesSet.add(trimmed);
            });
          } else if (Array.isArray(rule.value)) {
            rule.value.forEach((v: string) => {
              if (v) nationalitiesSet.add(v);
            });
          }
        }
      }
    });

    // KR, US, VN 순서로 정렬
    const ordered = ['KR', 'US', 'VN'];
    return ordered.filter((nat) => nationalitiesSet.has(nat));
  }, [testSendTemplate, sendGroups]);

  const handleTestSendClick = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setTestSendTemplate({ template, groupId });
    setTestSendDialogOpen(true);
  };

  // testSendTemplate이 변경되고 모달이 열릴 때 선택된 국적 초기화
  useEffect(() => {
    if (testSendDialogOpen && testSendTemplate && availableNationalities.length > 0) {
      setSelectedNationalities([...availableNationalities]);
    }
  }, [testSendDialogOpen, testSendTemplate, availableNationalities]);

  const handleCloseTestSend = () => {
    setTestSendDialogOpen(false);
    setTestEmail('');
    setTestSendTemplate(null);
    setSelectedNationalities([]);
  };

  const handleDeleteTemplateClick = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setTemplateToDelete({ template, groupId });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleConfirmDeleteTemplate = () => {
    if (!templateToDelete) return;

    const { template, groupId } = templateToDelete;

    // 그룹에서 템플릿 제거
    const updatedGroups = manualMailGroups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          templates: group.templates.filter((t) => t.id !== template.id),
        };
      }
      return group;
    });

    setManualMailGroups(updatedGroups);
    saveManualMailGroups(updatedGroups as any);

    // localStorage에 저장된 템플릿도 삭제
    try {
      const stored = localStorage.getItem('mail_templates');
      if (stored) {
        const templates = JSON.parse(stored) as Array<{ groupId: string; templateId: string }>;
        const filtered = templates.filter(
          (t) => !(t.groupId === groupId && t.templateId === String(template.id))
        );
        if (filtered.length !== templates.length) {
          localStorage.setItem('mail_templates', JSON.stringify(filtered));
        }
      }
    } catch (error) {
      console.warn('Failed to delete template from localStorage:', error);
    }

    const templateNameText =
      typeof template.name === 'string' ? template.name : template.name[language] || template.name.ko;

    showSnackbar(
      getCommonText('templateDeleted', language).replace('{name}', templateNameText),
      'success',
      3000,
    );

    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {getPageText('manualMail', language).title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {getPageText('manualMail', language).description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Add />}
          onClick={handleNewTemplate}
          sx={{
            minWidth: 'auto',
            px: 2,
            whiteSpace: 'nowrap',
          }}
        >
          {getCommonText('newTemplateRegister', language)}
        </Button>
      </Box>

      <Paper
        sx={{
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box sx={{ p: 3 }}>
          {manualMailGroups.map((group, groupIndex) => (
            <Box key={group.id} sx={{ mb: groupIndex < manualMailGroups.length - 1 ? 3 : 0 }}>
              <Typography variant="h4" sx={{ mb: 1.5, color: 'text.primary', fontWeight: 600 }}>
                {typeof group.name === 'string' ? group.name : group.name[language]}
              </Typography>
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <List sx={{ py: 0 }}>
                  {group.templates.map((template, templateIndex) => (
                    <Box key={template.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          sx={{
                            py: 1.5,
                            pl: 2,
                          }}
                          onClick={(e) => {
                            // IconButton이 아닌 경우에만 네비게이션
                            const target = e.target as HTMLElement;
                            if (
                              target.closest('button') === null &&
                              target.closest('.MuiIconButton-root') === null
                            ) {
                              navigate(`/manual-mail/${group.id}/${template.id}`);
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                {typeof template.name === 'string' ? template.name : template.name[language]}
                              </Typography>
                            }
                            secondary={
                              template.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {typeof template.description === 'string' ? template.description : template.description[language]}
                                </Typography>
                              )
                            }
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={getCommonText('templateEditTooltip', language)}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleEditTemplate(e, template, group.id)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={getCommonText('sendToMe', language)}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleTestSendClick(e, template, group.id)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <SendOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={getCommonText('previewTemplate', language)}>
                              <IconButton
                                size="small"
                                onClick={(e) => handlePreviewClick(e, template, group.id)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <Preview fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={getCommonText('delete', language)}>
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteTemplateClick(e, template, group.id)}
                                sx={{ color: 'text.secondary' }}
                              >
                                <DeleteOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemButton>
                      </ListItem>
                      {templateIndex < group.templates.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {typeof previewTemplate?.name === 'string'
              ? previewTemplate.name
              : previewTemplate?.name[language]}
          </Typography>
          {previewTemplate?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {typeof previewTemplate.description === 'string'
                ? previewTemplate.description
                : previewTemplate.description[language]}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              minHeight: 400,
              backgroundColor: 'background.paper',
            }}
          >
            {previewContent ? (
              <Box
                sx={{
                  '& p': {
                    margin: '0 0 1em 0',
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    margin: '0 0 0.5em 0',
                  },
                  '& ul, & ol': {
                    margin: '0 0 1em 0',
                    paddingLeft: '1.5em',
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {getCommonText('loadingTemplate', language)}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* 나에게 보내기 다이얼로그 */}
      <Dialog
        open={testSendDialogOpen}
        onClose={() => {
          setTestSendDialogOpen(false);
          setTestEmail('');
          setSelectedNationalities([]);
        }}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget as HTMLFormElement);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email as string;

              if (email) {
                showSnackbar(
                  getCommonText('testEmailSent', language).replace('{email}', email),
                  'success',
                  3000
                );
                setTestSendDialogOpen(false);
                setTestEmail('');
                setSelectedNationalities([]);
              }
            },
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" component="div">
            {getCommonText('sendToMe', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getCommonText('sendToMeDescription', language)}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label={getCommonText('emailAddress', language)}
            type="email"
            fullWidth
            variant="standard"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiInput-root': {
                backgroundColor: 'transparent !important',
                '&:hover:not(.Mui-disabled):before': {
                  borderBottomColor: 'divider',
                },
                '&:after': {
                  borderBottomColor: 'primary.main',
                },
                '&:hover': {
                  backgroundColor: 'transparent !important',
                },
                '&.Mui-focused': {
                  backgroundColor: 'transparent !important',
                },
                '&.Mui-filled': {
                  backgroundColor: 'transparent !important',
                },
              },
              '& .MuiInputBase-root': {
                backgroundColor: 'transparent !important',
                '&:hover': {
                  backgroundColor: 'transparent !important',
                },
                '&.Mui-focused': {
                  backgroundColor: 'transparent !important',
                },
                '&.Mui-filled': {
                  backgroundColor: 'transparent !important',
                },
              },
              '& .MuiInputBase-input': {
                backgroundColor: 'transparent !important',
                '&:hover': {
                  backgroundColor: 'transparent !important',
                },
                '&:focus': {
                  backgroundColor: 'transparent !important',
                },
                '&.MuiInputBase-input': {
                  backgroundColor: 'transparent !important',
                },
              },
            }}
            InputProps={{
              endAdornment: testEmail && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setTestEmail('')}
                    edge="end"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* 선택된 그룹의 국적별 정보 체크박스 */}
          {availableNationalities.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                발송할 국적 선택
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1.5 }}>
                {/* 전체 체크박스 */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        availableNationalities.length > 0 &&
                        availableNationalities.every((nat) => selectedNationalities.includes(nat))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNationalities([...availableNationalities]);
                        } else {
                          setSelectedNationalities([]);
                        }
                      }}
                    />
                  }
                  label="전체"
                />
                {availableNationalities.map((nationality) => (
                  <FormControlLabel
                    key={nationality}
                    control={
                      <Checkbox
                        checked={selectedNationalities.includes(nationality)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNationalities((prev) => [...prev, nationality]);
                          } else {
                            setSelectedNationalities((prev) => prev.filter((n) => n !== nationality));
                          }
                        }}
                      />
                    }
                    label={nationalityLabels[nationality]}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            disabled={!testEmail.trim() || selectedNationalities.length === 0}
          >
            {getCommonText('send', language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 새 템플릿 작성 다이얼로그 */}
      <Dialog open={newTemplateDialogOpen} onClose={handleCloseNewTemplate} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" component="div">
            {editingTemplate ? getCommonText('templateEdit', language) : getCommonText('newTemplateCreate', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="template-group-label">템플릿 그룹</InputLabel>
              <Select
                labelId="template-group-label"
                id="template-group"
                value={selectedGroupId}
                label="템플릿 그룹"
                onChange={(e: SelectChangeEvent<string>) => {
                  const value = e.target.value;
                  if (value === 'add_new_group') {
                    setNewGroupDialogOpen(true);
                    return;
                  }
                  setSelectedGroupId(value);
                  if (templateNameError) {
                    setTemplateNameError('');
                  }
                }}
              >
                {manualMailGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {typeof group.name === 'string' ? group.name : group.name.ko}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem value="add_new_group" disabled={!!editingTemplate} sx={{ color: 'primary.main', fontWeight: 600 }}>
                  <Add sx={{ mr: 1, fontSize: 20 }} />
                  그룹 추가하기
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="템플릿 이름"
              value={newTemplateName.ko}
              onChange={(e) => {
                const value = e.target.value;
                setNewTemplateName({ ko: value, en: value, vi: value });
                if (templateNameError) {
                  setTemplateNameError('');
                }
              }}
              placeholder="템플릿 이름을 입력하세요"
              variant="outlined"
              error={!!templateNameError}
              helperText={templateNameError}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="이메일 제목"
              value={newTemplateTitle.ko}
              onChange={(e) => {
                const value = e.target.value;
                setNewTemplateTitle({ ko: value, en: value, vi: value });
              }}
              placeholder="이메일 제목을 입력하세요"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="템플릿 설명 (선택사항)"
              multiline
              rows={3}
              value={newTemplateDescription.ko}
              onChange={(e) => {
                const value = e.target.value;
                setNewTemplateDescription({ ko: value, en: value, vi: value });
              }}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewTemplate}>{getCommonText('cancel', language)}</Button>
          <Button onClick={handleSaveNewTemplate} variant="contained">
            {editingTemplate ? getCommonText('edit', language) : getCommonText('save', language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 새 그룹 추가 다이얼로그 */}
      <Dialog open={newGroupDialogOpen} onClose={handleCloseNewGroup} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" component="div">
            새 그룹 추가
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="그룹 이름"
              value={newGroupName}
              onChange={(e) => {
                setNewGroupName(e.target.value);
                setGroupNameError('');
              }}
              placeholder="그룹 이름을 입력하세요"
              variant="outlined"
              error={!!groupNameError}
              helperText={groupNameError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewGroup}>{getCommonText('cancel', language)}</Button>
          <Button onClick={handleSaveNewGroup} variant="contained">
            {getCommonText('save', language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 템플릿 삭제 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {getCommonText('delete', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getCommonText('deleteTemplateConfirm', language).replace(
              '{name}',
              templateToDelete?.template
                ? typeof templateToDelete.template.name === 'string'
                  ? templateToDelete.template.name
                  : templateToDelete.template.name[language] || templateToDelete.template.name.ko
                : '',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>{getCommonText('cancel', language)}</Button>
          <Button onClick={handleConfirmDeleteTemplate} color="error" variant="contained">
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

export default ManualMailPage;
