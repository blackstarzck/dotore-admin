import { Add, Clear, EditOutlined, KeyboardArrowUp, Preview, SendOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  FormControl,
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
  Switch,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { autoMailGroups as initialAutoMailGroups, MailGroup, MailTemplate } from '../data/mockMailData';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText, getPageText } from '../utils/pageTexts';
import { getAutoMailGroups, getAutoSendSetting, getTemplate, saveAutoMailGroups, saveAutoSendSetting, saveTemplate } from '../utils/storage';

const AutoMailPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();

  // localStorage에서 저장된 그룹 불러오기, 없으면 초기 더미데이터 사용
  const storedGroups = getAutoMailGroups();
  const [autoMailGroups, setAutoMailGroups] = useState<MailGroup[]>(
    storedGroups || initialAutoMailGroups
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MailTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [autoSendSettings, setAutoSendSettings] = useState<Record<string, boolean>>({});
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [_testSendTemplate, setTestSendTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
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

  // 자동 발송 설정 불러오기
  useEffect(() => {
    const settings: Record<string, boolean> = {};
    autoMailGroups.forEach((group) => {
      group.templates.forEach((template) => {
        const key = `${group.id}-${template.id}`;
        settings[key] = getAutoSendSetting(group.id, String(template.id));
      });
    });
    setAutoSendSettings(settings);
  }, [autoMailGroups]);

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

  const handleAutoSendToggle = (e: React.MouseEvent, groupId: string, templateId: string) => {
    e.stopPropagation();
    const key = `${groupId}-${templateId}`;
    const newValue = !autoSendSettings[key];

    setAutoSendSettings((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    saveAutoSendSetting(groupId, String(templateId), newValue);

    // 템플릿 이름 찾기
    const group = autoMailGroups.find((g) => g.id === groupId);
    const template = group?.templates.find((t) => String(t.id) === String(templateId));
    const templateName = template?.name
      ? (typeof template.name === 'string' ? template.name : template.name[language])
      : '템플릿';

    // 스낵바 메시지 추가
    const message = `${templateName}의 자동 발송이 ${newValue ? '활성화' : '비활성화'}되었습니다.`;
    const severity: 'success' | 'info' = newValue ? 'success' : 'info';

    showSnackbar(message, severity, 3000);
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
    const selectedGroup = autoMailGroups.find((group) => group.id === selectedGroupId);
    if (!selectedGroup) {
      showSnackbar('선택한 그룹을 찾을 수 없습니다.', 'error', 3000);
      return;
    }

    // 템플릿 이름 중복 확인 (수정 모드일 때는 자기 자신 제외)
    // 한국어 이름으로 중복 확인 (하위 호환성 고려)
    const isDuplicate = selectedGroup.templates.some(
      (template) => {
        if (String(template.id) === String(editingTemplate?.template.id)) {
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

    if (editingTemplate) {
      // 템플릿 수정
      const updatedGroups = autoMailGroups.map((group) => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            templates: group.templates.map((t) =>
              String(t.id) === String(editingTemplate.template.id)
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

      setAutoMailGroups(updatedGroups);
      saveAutoMailGroups(updatedGroups as any);

      // 다국어 제목을 별도로 저장 (MailTemplatePage에서 사용)
      const savedTemplate = getTemplate(selectedGroupId, String(editingTemplate.template.id));
      if (savedTemplate) {
        // 기존 저장된 템플릿이 있으면 제목만 업데이트
        saveTemplate(selectedGroupId, String(editingTemplate.template.id), newTemplateTitle, savedTemplate.content);
      }

      showSnackbar('템플릿이 수정되었습니다.', 'success', 3000);
    } else {
      // 새 템플릿 생성 (다음 ID 계산 - 숫자 ID 사용)
      const maxId = Math.max(...autoMailGroups.flatMap((g) => g.templates.map((t) => (typeof t.id === 'number' ? t.id : 0))), 0);
      const newTemplate: MailTemplate = {
        id: maxId + 1,
        name: newTemplateName,
        title: newTemplateTitle,
        description: newTemplateDescription,
      };

      // 그룹에 템플릿 추가
      const updatedGroups = autoMailGroups.map((group) => {
        if (group.id === selectedGroupId) {
          return {
            ...group,
            templates: [...group.templates, newTemplate],
          };
        }
        return group;
      });

      setAutoMailGroups(updatedGroups);
      saveAutoMailGroups(updatedGroups as any);

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

    const isDuplicate = autoMailGroups.some((group) => {
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

    const updatedGroups = [...autoMailGroups, newGroup];
    setAutoMailGroups(updatedGroups);
    saveAutoMailGroups(updatedGroups as any);

    setSelectedGroupId(newGroup.id);
    showSnackbar('새 그룹이 추가되었습니다.', 'success', 3000);
    handleCloseNewGroup();
  };

  const handleTestSendClick = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setTestSendTemplate({ template, groupId });
    setTestSendDialogOpen(true);
  };

  const handleCloseTestSend = () => {
    setTestSendDialogOpen(false);
    setTestEmail('');
    setTestSendTemplate(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {getPageText('autoMail', language).title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {getPageText('autoMail', language).description}
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
          {autoMailGroups.map((group, groupIndex) => (
            <Box key={group.id} sx={{ mb: groupIndex < autoMailGroups.length - 1 ? 3 : 0 }}>
              <Typography variant="h4" sx={{ mb: 1.5, color: 'text.primary', fontWeight: 600 }}>
                {typeof group.name === 'string' ? group.name : group.name[language]}
              </Typography>
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <List sx={{ py: 0 }}>
                  {group.templates.map((template, templateIndex) => {
                    const isEnabled = autoSendSettings[`${group.id}-${template.id}`] ?? true;
                    return (
                      <Box key={template.id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            sx={{
                              py: 1.5,
                              pl: 2,
                              opacity: isEnabled ? 1 : 0.5,
                            }}
                            onClick={(e) => {
                              // Switch나 IconButton이 아닌 경우에만 네비게이션
                              const target = e.target as HTMLElement;
                              if (
                                target.closest('button') === null &&
                                target.closest('[role="switch"]') === null &&
                                target.closest('.MuiIconButton-root') === null
                              ) {
                                navigate(`/auto-mail/${group.id}/${template.id}`);
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 500,
                                    color: isEnabled ? 'text.primary' : 'text.disabled',
                                  }}
                                >
                                  {typeof template.name === 'string' ? template.name : template.name[language]}
                                </Typography>
                              }
                              secondary={
                                template.description && (
                                  <Typography
                                    variant="body2"
                                    color={isEnabled ? 'text.secondary' : 'text.disabled'}
                                    sx={{ mt: 0.5 }}
                                  >
                                    {typeof template.description === 'string' ? template.description : template.description[language]}
                                  </Typography>
                                )
                              }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Switch
                                checked={autoSendSettings[`${group.id}-${template.id}`] ?? true}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAutoSendToggle(e, group.id, String(template.id));
                                }}
                                size="small"
                                sx={{ mr: 1 }}
                              />
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
                            </Box>
                          </ListItemButton>
                        </ListItem>
                        {templateIndex < group.templates.length - 1 && <Divider />}
                      </Box>
                    );
                  })}
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
        onClose={handleCloseTestSend}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget as HTMLFormElement);
              const formJson = Object.fromEntries(formData.entries());
              const email = formJson.email as string;

              if (email) {
                // 테스트 발송 로직 (임시로 스낵바만 표시)
                showSnackbar(
                  getCommonText('testEmailSent', language).replace('{email}', email),
                  'success',
                  3000
                );
                setTestSendDialogOpen(false);
                setTestEmail('');
                setTestSendTemplate(null);
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestSend}>{getCommonText('cancel', language)}</Button>
          <Button type="submit">{getCommonText('send', language)}</Button>
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
                {autoMailGroups.map((group) => (
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

export default AutoMailPage;
