import { Add, Clear, EditOutlined, KeyboardArrowUp, Preview, SendOutlined } from '@mui/icons-material';
import {
  Alert,
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
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../context/SnackbarContext';
import { autoMailGroups as initialAutoMailGroups, MailGroup, MailTemplate } from '../data/mockMailData';
import { getAutoMailGroups, getAutoSendSetting, getTemplate, saveAutoMailGroups, saveAutoSendSetting } from '../utils/storage';

const AutoMailPage = () => {
  const navigate = useNavigate();
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
  const [snackbars, setSnackbars] = useState<
    Array<{ id: string; message: string; severity: 'success' | 'info' }>
  >([]);
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSendTemplate, setTestSendTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ template: MailTemplate; groupId: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [templateNameError, setTemplateNameError] = useState('');

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
      setPreviewContent(savedTemplate.content);
    } else {
      setPreviewContent('<p>저장된 템플릿이 없습니다. 템플릿을 편집하여 저장해주세요.</p>');
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
    const templateName = template?.name || '템플릿';

    // 스낵바 메시지 추가
    const message = `${templateName}의 자동 발송이 ${newValue ? '활성화' : '비활성화'}되었습니다.`;
    const severity: 'success' | 'info' = newValue ? 'success' : 'info';
    const id = `${Date.now()}-${Math.random()}`;

    setSnackbars((prev) => [...prev, { id, message, severity }]);

    // 3초 후 자동으로 제거
    setTimeout(() => {
      setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
    }, 3000);
  };

  const handleCloseSnackbar = (id: string) => {
    setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setNewTemplateDialogOpen(true);
    setSelectedGroupId('');
    setNewTemplateName('');
    setNewTemplateTitle('');
    setNewTemplateDescription('');
    setTemplateNameError('');
  };

  const handleEditTemplate = (e: React.MouseEvent, template: MailTemplate, groupId: string) => {
    e.stopPropagation();
    setEditingTemplate({ template, groupId });
    setNewTemplateDialogOpen(true);
    setSelectedGroupId(groupId);
    setNewTemplateName(template.name);
    setNewTemplateTitle(template.title || '');
    setNewTemplateDescription(template.description || '');
    setTemplateNameError('');
  };

  const handleCloseNewTemplate = () => {
    setNewTemplateDialogOpen(false);
    setEditingTemplate(null);
    setSelectedGroupId('');
    setNewTemplateName('');
    setNewTemplateTitle('');
    setNewTemplateDescription('');
    setTemplateNameError('');
  };

  const handleSaveNewTemplate = () => {
    // 유효성 검사
    if (!selectedGroupId) {
      showSnackbar('템플릿 그룹을 선택해주세요.', 'error', 3000);
      return;
    }

    if (!newTemplateName.trim()) {
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
    const isDuplicate = selectedGroup.templates.some(
      (template) =>
        String(template.id) !== String(editingTemplate?.template.id) &&
        template.name.toLowerCase() === newTemplateName.trim().toLowerCase()
    );
    if (isDuplicate) {
      setTemplateNameError('이미 존재하는 템플릿 이름입니다.');
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
                    name: newTemplateName.trim(),
                    title: newTemplateTitle.trim() || undefined,
                    description: newTemplateDescription.trim() || undefined,
                  }
                : t
            ),
          };
        }
        return group;
      });

      setAutoMailGroups(updatedGroups);
      saveAutoMailGroups(updatedGroups as any);
      showSnackbar('템플릿이 수정되었습니다.', 'success', 3000);
    } else {
      // 새 템플릿 생성 (다음 ID 계산 - 숫자 ID 사용)
      const maxId = Math.max(...autoMailGroups.flatMap((g) => g.templates.map((t) => (typeof t.id === 'number' ? t.id : 0))), 0);
      const newTemplate: MailTemplate = {
        id: maxId + 1,
        name: newTemplateName.trim(),
        title: newTemplateTitle.trim() || undefined,
        description: newTemplateDescription.trim() || undefined,
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
            자동 메일
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            사용자에게 자동으로 발송되는 이메일 템플릿 목록입니다.
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
          새 템플릿 등록
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
                {group.name}
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
                            onClick={() => navigate(`/auto-mail/${group.id}/${template.id}`)}
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
                                  {template.name}
                                </Typography>
                              }
                              secondary={
                                template.description && (
                                  <Typography
                                    variant="body2"
                                    color={isEnabled ? 'text.secondary' : 'text.disabled'}
                                    sx={{ mt: 0.5 }}
                                  >
                                    {template.description}
                                  </Typography>
                                )
                              }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Switch
                                checked={autoSendSettings[`${group.id}-${template.id}`] ?? true}
                                onClick={(e) => handleAutoSendToggle(e, group.id, String(template.id))}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <Tooltip title="템플릿 수정">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleEditTemplate(e, template, group.id)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="나에게 보내기">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleTestSendClick(e, template, group.id)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <SendOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="템플릿을 미리 볼 수 있습니다.">
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
          <Typography variant="h6">{previewTemplate?.name}</Typography>
          {previewTemplate?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {previewTemplate.description}
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
                템플릿을 불러오는 중...
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
                showSnackbar(`테스트 메일이 ${email}로 발송되었습니다.`, 'success', 3000);
                setTestSendDialogOpen(false);
                setTestEmail('');
                setTestSendTemplate(null);
              }
            },
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            나에게 보내기
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            발송하기 전 나에게 미리 발송해보세요.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="이메일 주소"
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
          <Button onClick={handleCloseTestSend}>취소</Button>
          <Button type="submit">발송</Button>
        </DialogActions>
      </Dialog>

      {/* 새 템플릿 작성 다이얼로그 */}
      <Dialog open={newTemplateDialogOpen} onClose={handleCloseNewTemplate} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {editingTemplate ? '템플릿 수정' : '새 템플릿 작성'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="template-group-label">템플릿 그룹</InputLabel>
            <Select
              labelId="template-group-label"
              id="template-group"
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
              {autoMailGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            id="template-name"
            label="템플릿 이름"
            fullWidth
            variant="outlined"
            value={newTemplateName}
            onChange={(e) => {
              setNewTemplateName(e.target.value);
              if (templateNameError) {
                setTemplateNameError('');
              }
            }}
            error={!!templateNameError}
            helperText={templateNameError}
            sx={{ mt: 3 }}
          />
          <TextField
            margin="dense"
            id="template-title"
            label="이메일 제목 (선택사항)"
            fullWidth
            variant="outlined"
            value={newTemplateTitle}
            onChange={(e) => setNewTemplateTitle(e.target.value)}
            sx={{ mt: 3 }}
          />
          <TextField
            margin="dense"
            id="template-description"
            label="템플릿 설명 (선택사항)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTemplateDescription}
            onChange={(e) => setNewTemplateDescription(e.target.value)}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewTemplate}>취소</Button>
          <Button onClick={handleSaveNewTemplate} variant="contained">
            {editingTemplate ? '수정' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 쌓이는 스낵바 */}
      {snackbars.map((snackbar, index) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          autoHideDuration={3000}
          onClose={() => handleCloseSnackbar(snackbar.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            bottom: `${24 + index * 56}px !important`, // 각 스낵바를 위로 쌓기
          }}
        >
          <Alert
            onClose={() => handleCloseSnackbar(snackbar.id)}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      ))}

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
