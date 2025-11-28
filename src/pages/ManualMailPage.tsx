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
  Tab, Tabs,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { manualMailGroups as initialManualMailGroups, MailGroup, MailTemplate } from '../data/mockMailData';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText, getPageText } from '../utils/pageTexts';
import { getManualMailGroups, getTemplate, saveManualMailGroups, saveTemplate } from '../utils/storage';

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
      id={`manual-mail-tabpanel-${index}`}
      aria-labelledby={`manual-mail-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 0 }}>{children}</Box>
    </div>
  );
}

const ManualMailPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();

  // 언어에 따라 탭 인덱스 매핑: ko -> 0, en -> 1, vi -> 2
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
  const [_testSendTemplate, setTestSendTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [languageTab, setLanguageTab] = useState<number>(getLanguageTabIndex(language));
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
  const [templateNameError, setTemplateNameError] = useState('');
  const prevLanguageRef = useRef<'ko' | 'en' | 'vi'>(language);

  // GNB에서 언어가 변경되면 탭도 자동으로 변경
  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      setLanguageTab(getLanguageTabIndex(language));
      prevLanguageRef.current = language;
    }
  }, [language]);

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
      setNewTemplateDescription(template.description);
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
      setTemplateNameError('모든 언어에 대한 템플릿 이름을 입력해주세요.');
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
      showSnackbar('모든 언어에 대한 이메일 제목을 입력해주세요.', 'error', 3000);
      return;
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
            <Tabs value={languageTab} onChange={(_e, newValue) => setLanguageTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="한국어" />
              <Tab label="English" />
              <Tab label="Tiếng Việt" />
            </Tabs>
            <CustomTabPanel value={languageTab} index={0}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="template-group-label-ko">템플릿 그룹</InputLabel>
                <Select
                  labelId="template-group-label-ko"
                  id="template-group-ko"
                  value={selectedGroupId}
                  label="템플릿 그룹"
                  disabled={!!editingTemplate}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setSelectedGroupId(e.target.value);
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
                </Select>
              </FormControl>
              <TextField
                autoFocus
                fullWidth
                label="템플릿 이름"
                value={newTemplateName.ko}
                onChange={(e) => {
                  setNewTemplateName((prev) => ({ ...prev, ko: e.target.value }));
                  if (templateNameError) {
                    setTemplateNameError('');
                  }
                }}
                placeholder="템플릿 이름을 입력하세요 (한국어)"
                variant="outlined"
                error={!!templateNameError}
                helperText={templateNameError}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="이메일 제목"
                value={newTemplateTitle.ko}
                onChange={(e) => setNewTemplateTitle((prev) => ({ ...prev, ko: e.target.value }))}
                placeholder="이메일 제목을 입력하세요 (한국어)"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="템플릿 설명 (선택사항)"
                multiline
                rows={3}
                value={newTemplateDescription.ko}
                onChange={(e) => setNewTemplateDescription((prev) => ({ ...prev, ko: e.target.value }))}
                variant="outlined"
              />
            </CustomTabPanel>
            <CustomTabPanel value={languageTab} index={1}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="template-group-label-en">Template Group</InputLabel>
                <Select
                  labelId="template-group-label-en"
                  id="template-group-en"
                  value={selectedGroupId}
                  label="Template Group"
                  disabled={!!editingTemplate}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setSelectedGroupId(e.target.value);
                    if (templateNameError) {
                      setTemplateNameError('');
                    }
                  }}
                >
                  {manualMailGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {typeof group.name === 'string' ? group.name : group.name.en}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Template Name"
                value={newTemplateName.en}
                onChange={(e) => {
                  setNewTemplateName((prev) => ({ ...prev, en: e.target.value }));
                  if (templateNameError) {
                    setTemplateNameError('');
                  }
                }}
                placeholder="Enter template name (English)"
                variant="outlined"
                error={!!templateNameError}
                helperText={templateNameError}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email Subject"
                value={newTemplateTitle.en}
                onChange={(e) => setNewTemplateTitle((prev) => ({ ...prev, en: e.target.value }))}
                placeholder="Enter email subject (English)"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Template Description (Optional)"
                multiline
                rows={3}
                value={newTemplateDescription.en}
                onChange={(e) => setNewTemplateDescription((prev) => ({ ...prev, en: e.target.value }))}
                variant="outlined"
              />
            </CustomTabPanel>
            <CustomTabPanel value={languageTab} index={2}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="template-group-label-vi">Nhóm mẫu</InputLabel>
                <Select
                  labelId="template-group-label-vi"
                  id="template-group-vi"
                  value={selectedGroupId}
                  label="Nhóm mẫu"
                  disabled={!!editingTemplate}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setSelectedGroupId(e.target.value);
                    if (templateNameError) {
                      setTemplateNameError('');
                    }
                  }}
                >
                  {manualMailGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {typeof group.name === 'string' ? group.name : group.name.vi}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tên mẫu"
                value={newTemplateName.vi}
                onChange={(e) => {
                  setNewTemplateName((prev) => ({ ...prev, vi: e.target.value }));
                  if (templateNameError) {
                    setTemplateNameError('');
                  }
                }}
                placeholder="Nhập tên mẫu (Tiếng Việt)"
                variant="outlined"
                error={!!templateNameError}
                helperText={templateNameError}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Tiêu đề email"
                value={newTemplateTitle.vi}
                onChange={(e) => setNewTemplateTitle((prev) => ({ ...prev, vi: e.target.value }))}
                placeholder="Nhập tiêu đề email (Tiếng Việt)"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mô tả mẫu (Tùy chọn)"
                multiline
                rows={3}
                value={newTemplateDescription.vi}
                onChange={(e) => setNewTemplateDescription((prev) => ({ ...prev, vi: e.target.value }))}
                variant="outlined"
              />
            </CustomTabPanel>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewTemplate}>{getCommonText('cancel', language)}</Button>
          <Button onClick={handleSaveNewTemplate} variant="contained">
            {editingTemplate ? getCommonText('edit', language) : getCommonText('save', language)}
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
