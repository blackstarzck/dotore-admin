import { Clear } from '@mui/icons-material';
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputAdornment, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, Tab, Tabs, TextField, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSendingStatus } from '../context/SendingStatusContext';
import { useSnackbar } from '../context/SnackbarContext';
import { autoMailGroups, MailTemplate, manualMailGroups } from '../data/mockMailData';
import { generateRecipients, MailHistory } from '../data/mockMailHistory';
import { mockSendGroups } from '../data/mockSendGroups';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText } from '../utils/pageTexts';
import { getAutoMailGroups, getManualMailGroups, getTemplate, saveTemplate } from '../utils/storage';

const AVAILABLE_VARIABLES = [
  { label: '사용자 이름', value: '{{userName}}' },
  { label: '이메일', value: '{{userEmail}}' },
  { label: '날짜', value: '{{date}}' },
  { label: '주문 번호', value: '{{orderId}}' },
  { label: '회사명', value: '{{companyName}}' },
];

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
      id={`mail-template-tabpanel-${index}`}
      aria-labelledby={`mail-template-tab-${index}`}
      {...other}
    >
      <Box sx={{ p: 0 }}>{children}</Box>
    </div>
  );
}

const MailTemplatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { templateId, groupId } = useParams<{ groupId: string; templateId: string }>();
  const { language } = useLanguage();

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

  const [languageTab, setLanguageTab] = useState<number>(getLanguageTabIndex(language));
  const [title, setTitle] = useState<MultilingualContent>({
    ko: '',
    en: '',
    vi: '',
  });
  const [initialContent, setInitialContent] = useState<MultilingualContent>({
    ko: '<p>템플릿 내용을 입력하세요.</p>',
    en: '<p>Please enter template content.</p>',
    vi: '<p>Vui lòng nhập nội dung mẫu.</p>',
  });
  const [isEditorReady, setIsEditorReady] = useState<{ ko: boolean; en: boolean; vi: boolean }>({
    ko: false,
    en: false,
    vi: false,
  });
  const [content, setContent] = useState<MultilingualContent>({
    ko: '',
    en: '',
    vi: '',
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const editorRefs = useRef<{ ko: any; en: any; vi: any }>({
    ko: null,
    en: null,
    vi: null,
  });
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
  const prevLanguageRef = useRef<'ko' | 'en' | 'vi'>(language);

  // GNB에서 언어가 변경되면 탭도 자동으로 변경
  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      setLanguageTab(getLanguageTabIndex(language));
      prevLanguageRef.current = language;
    }
  }, [language]);

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
      setTitle(savedTemplate.title);
      setInitialContent(savedTemplate.content);
      setContent(savedTemplate.content);
    } else {
      // template.title이 MultilingualContent인 경우 처리
      const defaultTitle = template?.title
        ? typeof template.title === 'string'
          ? template.title
          : template.title[language] || template.title.ko || ''
        : '';
      setTitle(
        template?.title && typeof template.title === 'object'
          ? template.title
          : {
              ko: defaultTitle,
              en: defaultTitle,
              vi: defaultTitle,
            }
      );
      const defaultContent = {
        ko: '<p>템플릿 내용을 입력하세요.</p>',
        en: '<p>Please enter template content.</p>',
        vi: '<p>Vui lòng nhập nội dung mẫu.</p>',
      };
      setInitialContent(defaultContent);
      setContent(defaultContent);
    }
    setIsInitialized(true);
  }, [template, groupId, templateId, isInitialized, language]);

  // initialContent가 변경되면 에디터에 내용 설정
  useEffect(() => {
    if (editorRefs.current.ko && isEditorReady.ko && initialContent.ko) {
      const currentContent = editorRefs.current.ko.getContent();
      if (currentContent !== initialContent.ko) {
        editorRefs.current.ko.setContent(initialContent.ko);
        setContent((prev) => ({ ...prev, ko: initialContent.ko }));
      }
    }
  }, [initialContent.ko, isEditorReady.ko]);

  useEffect(() => {
    if (editorRefs.current.en && isEditorReady.en && initialContent.en) {
      const currentContent = editorRefs.current.en.getContent();
      if (currentContent !== initialContent.en) {
        editorRefs.current.en.setContent(initialContent.en);
        setContent((prev) => ({ ...prev, en: initialContent.en }));
      }
    }
  }, [initialContent.en, isEditorReady.en]);

  useEffect(() => {
    if (editorRefs.current.vi && isEditorReady.vi && initialContent.vi) {
      const currentContent = editorRefs.current.vi.getContent();
      if (currentContent !== initialContent.vi) {
        editorRefs.current.vi.setContent(initialContent.vi);
        setContent((prev) => ({ ...prev, vi: initialContent.vi }));
      }
    }
  }, [initialContent.vi, isEditorReady.vi]);

  // 다국어 제목 검증
  const validateMultilingualTitle = (title: MultilingualContent): boolean => {
    if (!title || typeof title !== 'object') return false;
    const ko = typeof title.ko === 'string' ? title.ko : String(title.ko || '');
    const en = typeof title.en === 'string' ? title.en : String(title.en || '');
    const vi = typeof title.vi === 'string' ? title.vi : String(title.vi || '');
    return ko.trim() !== '' && en.trim() !== '' && vi.trim() !== '';
  };

  // 모든 언어의 에디터에서 컨텐츠 가져오기
  const getAllContent = (): MultilingualContent => {
    return {
      ko: editorRefs.current.ko?.getContent() || content.ko,
      en: editorRefs.current.en?.getContent() || content.en,
      vi: editorRefs.current.vi?.getContent() || content.vi,
    };
  };

  // 모든 언어의 에디터에서 텍스트만 가져오기 (검증용)
  const getAllContentText = (): MultilingualContent => {
    const fullContent = getAllContent();
    return {
      ko: editorRefs.current.ko?.getContent({ format: 'text' }) || fullContent.ko.replace(/<[^>]*>/g, '').trim(),
      en: editorRefs.current.en?.getContent({ format: 'text' }) || fullContent.en.replace(/<[^>]*>/g, '').trim(),
      vi: editorRefs.current.vi?.getContent({ format: 'text' }) || fullContent.vi.replace(/<[^>]*>/g, '').trim(),
    };
  };

  const handleSave = () => {
    if (!groupId || !templateId) return;

    // 검증
    if (!validateMultilingualTitle(title)) {
      showSnackbar('모든 언어에 대한 제목을 입력해주세요.', 'error', 3000);
      return;
    }

    const allContent = getAllContent();
    const allContentText = getAllContentText();

    // 빈 컨텐츠 검증
    if (!allContentText.ko || !allContentText.en || !allContentText.vi) {
      showSnackbar('모든 언어에 대한 컨텐츠를 입력해주세요.', 'error', 3000);
      return;
    }

    // 저장 로직
    saveTemplate(groupId, templateId, title, allContent);

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

    // 검증
    if (!validateMultilingualTitle(title)) {
      showSnackbar('모든 언어에 대한 제목을 입력해주세요.', 'error', 3000);
      return;
    }

    const allContent = getAllContent();
    const allContentText = getAllContentText();

    // 빈 컨텐츠 검증
    if (!allContentText.ko || !allContentText.en || !allContentText.vi) {
      showSnackbar('모든 언어에 대한 컨텐츠를 입력해주세요.', 'error', 3000);
      return;
    }

    // 템플릿 저장
    saveTemplate(groupId, templateId, title, allContent);

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
    const groupNames = selectedGroups
      .map((g) => {
        const name = g.name;
        return typeof name === 'string' ? name : (name as MultilingualContent)[language] || (name as MultilingualContent).ko || '';
      })
      .join(', ');

    // 새로운 발송 이력 ID 생성
    const newHistoryId = `history-${Date.now()}`;

    // 발송 이력 생성 (임시로 localStorage에 저장 - 실제로는 API 호출)
    const sentAt = new Date().toISOString();
    // 다국어 제목 중 현재 언어에 맞는 값을 사용
    const templateName =
      title[language] ||
      (template?.name
        ? typeof template.name === 'string'
          ? template.name
          : template.name[language] || template.name.ko || ''
        : '');
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
            {typeof group.name === 'string' ? group.name : group.name[language]}
          </Typography>
        )}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {typeof template.name === 'string' ? template.name : template.name[language]}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          - {typeof template.description === 'string' ? template.description : template.description?.[language] || ''}
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
          <Tabs value={languageTab} onChange={(_e, newValue) => setLanguageTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="한국어" />
            <Tab label="English" />
            <Tab label="Tiếng Việt" />
          </Tabs>

          <CustomTabPanel value={languageTab} index={0}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                제목
              </Typography>
              <TextField
                fullWidth
                value={title.ko}
                onChange={(e) => setTitle((prev) => ({ ...prev, ko: e.target.value }))}
                placeholder="이메일 제목을 입력하세요 (한국어)"
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
                }}
              >
                {!isEditorReady.ko && languageTab === 0 && (
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
                <Box sx={{ display: languageTab === 0 ? (isEditorReady.ko ? 'block' : 'none') : 'none' }}>
                  <Editor
                    key="editor-ko-KR"
                    apiKey='txjxp10zi9jdxkgkn3vgnphatuze7hgqih2bmlatoix5fdvb'
                    onInit={(_evt, editor) => {
                      editorRefs.current.ko = editor;
                      setIsEditorReady((prev) => ({ ...prev, ko: true }));
                      // initialContent가 있으면 에디터에 설정
                      if (initialContent.ko) {
                        editor.setContent(initialContent.ko);
                        setContent((prev) => ({ ...prev, ko: initialContent.ko }));
                      } else {
                        const currentContent = editor.getContent();
                        setContent((prev) => ({ ...prev, ko: currentContent }));
                      }
                    }}
                    onEditorChange={(_content) => {
                      setContent((prev) => ({ ...prev, ko: _content }));
                    }}
                    initialValue={initialContent.ko}
                    init={{
                      height: 500,
                      menubar: 'file edit view insert format tools table help',
                      language: 'ko-KR',
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
                        'removeformat | templateVariables | preview | code | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
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
                      setup: (editor) => {
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
          </CustomTabPanel>

          <CustomTabPanel value={languageTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                제목
              </Typography>
              <TextField
                fullWidth
                value={title.en}
                onChange={(e) => setTitle((prev) => ({ ...prev, en: e.target.value }))}
                placeholder="Enter email subject (English)"
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
                }}
              >
                {!isEditorReady.en && languageTab === 1 && (
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
                <Box sx={{ display: languageTab === 1 ? (isEditorReady.en ? 'block' : 'none') : 'none' }}>
                  <Editor
                    key="editor-en"
                    apiKey='txjxp10zi9jdxkgkn3vgnphatuze7hgqih2bmlatoix5fdvb'
                    onInit={(_evt, editor) => {
                      editorRefs.current.en = editor;
                      setIsEditorReady((prev) => ({ ...prev, en: true }));
                      // initialContent가 있으면 에디터에 설정
                      if (initialContent.en) {
                        editor.setContent(initialContent.en);
                        setContent((prev) => ({ ...prev, en: initialContent.en }));
                      } else {
                        const currentContent = editor.getContent();
                        setContent((prev) => ({ ...prev, en: currentContent }));
                      }
                    }}
                    onEditorChange={(_content) => {
                      setContent((prev) => ({ ...prev, en: _content }));
                    }}
                    initialValue={initialContent.en}
                    init={{
                      height: 500,
                      menubar: 'file edit view insert format tools table help',
                      language: 'en',
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
                        'removeformat | templateVariables | preview | code | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                      menu: {
                        file: { title: 'File', items: 'preview' },
                        edit: {
                          title: 'Edit',
                          items: 'undo redo | cut copy paste | selectall | searchreplace',
                        },
                        view: {
                          title: 'View',
                          items: 'code | visualaid visualchars visualblocks | spellchecker | fullscreen',
                        },
                        insert: {
                          title: 'Insert',
                          items:
                            'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
                        },
                        format: {
                          title: 'Format',
                          items:
                            'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
                        },
                        tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                        table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
                        help: { title: 'Help', items: 'help' },
                      },
                      setup: (editor) => {
                        editor.ui.registry.addMenuButton('templateVariables', {
                          text: 'Template Variables',
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
          </CustomTabPanel>

          <CustomTabPanel value={languageTab} index={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                제목
              </Typography>
              <TextField
                fullWidth
                value={title.vi}
                onChange={(e) => setTitle((prev) => ({ ...prev, vi: e.target.value }))}
                placeholder="Nhập tiêu đề email (Tiếng Việt)"
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
                }}
              >
                {!isEditorReady.vi && languageTab === 2 && (
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
                <Box sx={{ display: languageTab === 2 ? (isEditorReady.vi ? 'block' : 'none') : 'none' }}>
                  <Editor
                    key="editor-vi"
                    apiKey='txjxp10zi9jdxkgkn3vgnphatuze7hgqih2bmlatoix5fdvb'
                    onInit={(_evt, editor) => {
                      editorRefs.current.vi = editor;
                      setIsEditorReady((prev) => ({ ...prev, vi: true }));
                      // initialContent가 있으면 에디터에 설정
                      if (initialContent.vi) {
                        editor.setContent(initialContent.vi);
                        setContent((prev) => ({ ...prev, vi: initialContent.vi }));
                      } else {
                        const currentContent = editor.getContent();
                        setContent((prev) => ({ ...prev, vi: currentContent }));
                      }
                    }}
                    onEditorChange={(_content) => {
                      setContent((prev) => ({ ...prev, vi: _content }));
                    }}
                    initialValue={initialContent.vi}
                    init={{
                      height: 500,
                      menubar: 'file edit view insert format tools table help',
                      language: 'vi',
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
                        'removeformat | templateVariables | preview | code | help',
                      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                      menu: {
                        file: { title: 'Tệp', items: 'preview' },
                        edit: {
                          title: 'Chỉnh sửa',
                          items: 'undo redo | cut copy paste | selectall | searchreplace',
                        },
                        view: {
                          title: 'Xem',
                          items: 'code | visualaid visualchars visualblocks | spellchecker | fullscreen',
                        },
                        insert: {
                          title: 'Chèn',
                          items:
                            'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
                        },
                        format: {
                          title: 'Định dạng',
                          items:
                            'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
                        },
                        tools: { title: 'Công cụ', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                        table: { title: 'Bảng', items: 'inserttable | cell row column | tableprops deletetable' },
                        help: { title: 'Trợ giúp', items: 'help' },
                      },
                      setup: (editor) => {
                        editor.ui.registry.addMenuButton('templateVariables', {
                          text: 'Biến mẫu',
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
          </CustomTabPanel>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={handleSave}>
              {getCommonText('save', language)}
            </Button>
            {type === 'manual' && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setTestSendDialogOpen(true)}
                >
                  {getCommonText('sendToMe', language)}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={
                    !validateMultilingualTitle(title) ||
                    selectedGroupIds.length === 0 ||
                    (() => {
                      const allContentText = getAllContentText();
                      return !allContentText.ko || !allContentText.en || !allContentText.vi;
                    })()
                  }
                >
                  {getCommonText('send', language)}
                </Button>
              </>
            )}
          </Box>

      {/* 발송 컨펌 다이얼로그 */}
      <Dialog
        fullScreen={fullScreen}
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          <Typography variant="h5" fontWeight="bold" component="div">
            {getCommonText('sendConfirm', language)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedGroupIds.length > 0 ? (
              getCommonText('sendConfirmMessage', language).replace(
                '{count}',
                sendGroups
                  .filter((g) => selectedGroupIds.includes(g.id))
                  .reduce((sum, group) => sum + group.memberCount, 0)
                  .toLocaleString()
              )
            ) : (
              getCommonText('noRecipientsSelected', language)
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSend} autoFocus>
            {getCommonText('send', language)}
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
                showSnackbar(
                  getCommonText('testEmailSent', language).replace('{email}', email),
                  'success',
                  3000
                );
                setTestSendDialogOpen(false);
                setTestEmail('');
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
          <Button type="submit">{getCommonText('send', language)}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MailTemplatePage;
