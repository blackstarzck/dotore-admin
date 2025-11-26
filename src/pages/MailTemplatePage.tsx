import { Clear } from '@mui/icons-material';
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputAdornment, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, TextField, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSendingStatus } from '../context/SendingStatusContext';
import { useSnackbar } from '../context/SnackbarContext';
import { autoMailGroups, MailTemplate, manualMailGroups } from '../data/mockMailData';
import { generateRecipients, MailHistory } from '../data/mockMailHistory';
import { mockSendGroups } from '../data/mockSendGroups';
import { getAutoMailGroups, getManualMailGroups, getTemplate, saveTemplate } from '../utils/storage';

const AVAILABLE_VARIABLES = [
  { label: '사용자 이름', value: '{{userName}}' },
  { label: '이메일', value: '{{userEmail}}' },
  { label: '날짜', value: '{{date}}' },
  { label: '주문 번호', value: '{{orderId}}' },
  { label: '회사명', value: '{{companyName}}' },
];

const MailTemplatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { templateId, groupId } = useParams<{ groupId: string; templateId: string }>();
  const [title, setTitle] = useState('');
  const [initialContent, setInitialContent] = useState('<p>템플릿 내용을 입력하세요.</p>');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [content, setContent] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const editorRef = useRef<any>(null);
  const { showSnackbar } = useSnackbar();
  const { showSendingStatus, updateSendingStatus } = useSendingStatus();

  // URL 경로에서 type 추출
  const type = location.pathname.startsWith('/auto-mail') ? 'auto' : 'manual';

  // 발송 그룹 목록 (발송 그룹 관리 데이터와 동기화)
  const sendGroups = mockSendGroups;

  // 템플릿 데이터 찾기 (메모이제이션)
  const templateData = useMemo(() => {
    if (type === 'auto') {
      // 자동 메일은 localStorage에서 불러온 데이터와 더미데이터 병합
      const storedGroups = getAutoMailGroups();
      const groups = storedGroups || autoMailGroups;
      for (const group of groups) {
        const template = group.templates.find((t: MailTemplate) => {
          // 자동 메일도 숫자 ID로 변경됨
          return String(t.id) === templateId;
        });
        if (template) return { template, group };
      }
    } else {
      // 수동 메일은 localStorage에서 불러온 데이터와 더미데이터 병합
      const storedGroups = getManualMailGroups();
      const groups = storedGroups || manualMailGroups;
      for (const group of groups) {
        const template = group.templates.find((t: MailTemplate) => {
          // 수동 메일은 숫자 ID
          return String(t.id) === templateId;
        });
        if (template) return { template, group };
      }
    }
    return null;
  }, [type, templateId]);

  const template = templateData?.template || null;
  const group = templateData?.group || null;

  const [isInitialized, setIsInitialized] = useState(false);
  const prevTemplateIdRef = useRef<string | undefined>(templateId);
  const prevGroupIdRef = useRef<string | undefined>(groupId);

  useEffect(() => {
    // templateId나 groupId가 변경된 경우에만 초기화
    const templateIdChanged = prevTemplateIdRef.current !== templateId;
    const groupIdChanged = prevGroupIdRef.current !== groupId;

    if (templateIdChanged || groupIdChanged) {
      setIsInitialized(false);
      prevTemplateIdRef.current = templateId;
      prevGroupIdRef.current = groupId;
    }

    if (!template || !groupId || isInitialized) return;

    // 저장된 템플릿 불러오기
    const savedTemplate = getTemplate(groupId, templateId || '');
    if (savedTemplate) {
      setTitle(savedTemplate.title || template?.title || '');
      setInitialContent(savedTemplate.content);
    } else {
      setTitle(template?.title || '');
      setInitialContent('<p>템플릿 내용을 입력하세요.</p>');
    }
    setIsInitialized(true);
  }, [template, groupId, templateId, isInitialized]);

  const handleSave = () => {
    if (!groupId || !templateId) return;

    // 저장 로직
    const content = editorRef.current ? editorRef.current.getContent() : '';
    saveTemplate(groupId, templateId, title, content);

    // 전역 스낵바 표시
    showSnackbar('템플릿이 저장되었습니다.', 'success', 5000);

    // 즉시 상위 페이지로 이동
    navigate(type === 'auto' ? '/auto-mail' : '/manual-mail');
  };

  const handleSend = async () => {
    if (!groupId || !templateId) return;

    // 수동 메일인 경우 발송 그룹 선택 필수
    if (type === 'manual' && selectedGroupIds.length === 0) {
      showSnackbar('발송 대상을 선택해주세요.', 'error', 3000);
      return;
    }

    // 템플릿 저장
    const content = editorRef.current ? editorRef.current.getContent() : '';
    saveTemplate(groupId, templateId, title, content);

    // 발송 상태 시작
    showSendingStatus();
    updateSendingStatus('request');

    // 요청 상태 유지 (짧은 지연)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 발송중 상태로 변경
    updateSendingStatus('sending');

    // 발송 시뮬레이션 (2-3초)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    // 발송 완료 처리
    const selectedGroups = sendGroups.filter((g) => selectedGroupIds.includes(g.id));
    const recipientCount = selectedGroups.reduce((sum, group) => sum + group.memberCount, 0);
    const sentCount = Math.floor(recipientCount * 0.9); // 90% 성공 가정
    const failedCount = recipientCount - sentCount;

    // 그룹 이름들을 쉼표로 구분하여 표시
    const groupNames = selectedGroups.map((g) => g.name).join(', ');

    // 새로운 발송 이력 ID 생성
    const newHistoryId = `history-${Date.now()}`;

    // 발송 이력 생성 (임시로 localStorage에 저장 - 실제로는 API 호출)
    const sentAt = new Date().toISOString();
    const templateName = title || template?.name || '';
    const newHistory: MailHistory = {
      id: newHistoryId,
      templateName,
      groupName: groupNames,
      recipientCount,
      sentCount,
      failedCount,
      status: failedCount === 0 ? 'success' : failedCount === recipientCount ? 'failed' : 'partial',
      sentAt,
      sentBy: '관리자',
      type: 'manual',
      successfulRecipients: generateRecipients(newHistoryId, sentCount, sentAt, 'manual', templateName, 'success'),
      failedRecipients: generateRecipients(newHistoryId, failedCount, sentAt, 'manual', templateName, 'failed'),
    };

    // localStorage에 발송 이력 저장 (임시)
    const existingHistory = localStorage.getItem('manual_mail_history');
    const historyArray: MailHistory[] = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray.unshift(newHistory); // 최신 이력을 맨 앞에 추가
    localStorage.setItem('manual_mail_history', JSON.stringify(historyArray));

    // 발송 완료 상태로 변경 (historyId와 통계 정보 전달)
    updateSendingStatus('completed', newHistoryId, {
      totalRecipients: recipientCount,
      sentCount,
      failedCount,
    });

    // 다이얼로그 닫기
    setConfirmDialogOpen(false);
  };

  const handleBack = () => {
    navigate(type === 'auto' ? '/auto-mail' : '/manual-mail');
  };

  // 템플릿 변수를 TinyMCE 형식으로 변환
  const templateVariables = AVAILABLE_VARIABLES.map((variable) => ({
    text: variable.label,
    value: variable.value,
  }));

  if (!template) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          템플릿을 찾을 수 없습니다
        </Typography>
        <Button onClick={handleBack}>
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        {group && (
          <Typography variant="body2" color="text.secondary">
            {group.name}
          </Typography>
        )}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {template.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          - {template.description}
        </Typography>
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              제목
            </Typography>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="이메일 제목을 입력하세요"
              variant="outlined"
            />
          </Box>

          {type === 'manual' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                발송 대상
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={selectedGroupIds}
                  displayEmpty
                  renderValue={(selected: string[]) => {
                    if (selected.length === 0) {
                      return <span style={{ color: '#9e9e9e' }}>발송 그룹 선택</span>;
                    }
                    if (selected.length === sendGroups.length) {
                      return '전체';
                    }
                    return selected
                      .map((id: string) => {
                        const group = sendGroups.find((g) => g.id === id);
                        return group ? `${group.name} (${group.memberCount.toLocaleString()}명)` : '';
                      })
                      .join(', ');
                  }}
                  onChange={(e: SelectChangeEvent<string[]>) => {
                    const value = e.target.value;
                    const newValue = typeof value === 'string' ? value.split(',') : value;

                    // "전체" 옵션 처리
                    if (newValue.includes('all')) {
                      if (selectedGroupIds.length === sendGroups.length) {
                        // 전체가 이미 선택되어 있으면 모두 해제
                        setSelectedGroupIds([]);
                      } else {
                        // 전체 선택
                        setSelectedGroupIds(sendGroups.map((g) => g.id));
                      }
                    } else {
                      setSelectedGroupIds(newValue);
                    }
                  }}
                >
                  <MenuItem value="all">
                    <Checkbox checked={selectedGroupIds.length === sendGroups.length} />
                    <ListItemText primary="전체" />
                  </MenuItem>
                  {sendGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      <Checkbox checked={selectedGroupIds.indexOf(group.id) > -1} />
                      <ListItemText primary={`${group.name} (${group.memberCount.toLocaleString()}명)`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              본문
            </Typography>
            <Box
              sx={{
                position: 'relative',
                minHeight: 500,
                // '& .tox-tinymce': {
                //   border: 'none',
                // },
              }}
            >
              {!isEditorReady && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <Box sx={{ visibility: isEditorReady ? 'visible' : 'hidden' }}>
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY || ''}
                  onInit={(_evt, editor) => {
                    editorRef.current = editor;
                    setIsEditorReady(true);
                    // 초기 내용 설정
                    const initialContent = editor.getContent();
                    setContent(initialContent);
                  }}
                  onEditorChange={(_content) => {
                    // 에디터 내용 변경 시 상태 업데이트
                    setContent(_content);
                  }}
                  initialValue={initialContent}
                init={{
                  height: 500,
                  menubar: 'file edit view insert format tools table help',
                  language: 'ko_KR', // 에디터 언어를 한국어로 설정
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'wordcount',
                  ],
                  toolbar:
                    'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | templateVariables | preview | code | help', // 미리보기 버튼 추가
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  // 파일 메뉴 커스터마이징 - preview만 표시
                  menu: {
                    file: { title: '파일', items: 'preview' },
                    edit: {
                      title: '편집',
                      items: 'undo redo | cut copy paste | selectall | searchreplace',
                    },
                    view: {
                      title: '보기',
                      items: 'code | visualaid visualchars visualblocks | spellchecker | fullscreen',
                    },
                    insert: {
                      title: '삽입',
                      items:
                        'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
                    },
                    format: {
                      title: '서식',
                      items:
                        'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
                    },
                    tools: { title: '도구', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                    table: { title: '표', items: 'inserttable | cell row column | tableprops deletetable' },
                    help: { title: '도움말', items: 'help' },
                  },
                  // 템플릿 변수 드롭다운 메뉴 설정
                  setup: (editor) => {
                    // 템플릿 변수 버튼 추가
                    editor.ui.registry.addMenuButton('templateVariables', {
                      text: '템플릿 변수',
                      fetch: (callback) => {
                        const items = templateVariables.map((variable) => ({
                          type: 'menuitem' as const,
                          text: variable.text,
                          onAction: () => {
                            editor.insertContent(`&nbsp;${variable.value}&nbsp;`);
                          },
                        }));
                        callback(items);
                      },
                    });
                  },
                }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleSave}>
              저장
            </Button>
            {type === 'manual' && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setTestSendDialogOpen(true)}
                >
                  나에게 보내기
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={
                    !title.trim() ||
                    selectedGroupIds.length === 0 ||
                    !content ||
                    content.replace(/<[^>]*>/g, '').trim() === '' ||
                    content.replace(/<[^>]*>/g, '').trim() === '템플릿 내용을 입력하세요.'
                  }
                >
                  발송
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* 발송 컨펌 다이얼로그 */}
      <Dialog
        fullScreen={fullScreen}
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          <Typography variant="h5" fontWeight="bold">
            발송 확인
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedGroupIds.length > 0 ? (
              `총 ${sendGroups
                .filter((g) => selectedGroupIds.includes(g.id))
                .reduce((sum, group) => sum + group.memberCount, 0)
                .toLocaleString()}명에게 발송하시겠습니까?`
            ) : (
              '발송 대상이 선택되지 않았습니다.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSend} autoFocus>
            발송
          </Button>
        </DialogActions>
      </Dialog>

      {/* 나에게 보내기 다이얼로그 */}
      <Dialog
        open={testSendDialogOpen}
        onClose={() => setTestSendDialogOpen(false)}
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
          <Button type="submit">발송</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MailTemplatePage;
