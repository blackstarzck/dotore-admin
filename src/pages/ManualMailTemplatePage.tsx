import { Clear, Warning } from '@mui/icons-material';
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, IconButton, InputAdornment, ListItemText, MenuItem, Paper, Select, SelectChangeEvent, Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSendingStatus } from '../context/SendingStatusContext';
import { useSnackbar } from '../context/SnackbarContext';
import { MailTemplate, manualMailGroups } from '../data/mockMailData';
import { generateRecipients, MailHistory } from '../data/mockMailHistory';
import { mockSendGroups } from '../data/mockSendGroups';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText } from '../utils/pageTexts';
import { getManualMailGroups, getTemplate, saveManualMailGroups, saveTemplate } from '../utils/storage';

const AVAILABLE_VARIABLES = [
  { label: '사용자 이름', value: '{{userName}}' },
  { label: '이메일', value: '{{userEmail}}' },
  { label: '날짜', value: '{{date}}' },
  { label: '주문 번호', value: '{{orderId}}' },
  { label: '회사명', value: '{{companyName}}' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: string | number;
  value: string | number;
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

const ManualMailTemplatePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { templateId, groupId } = useParams<{ groupId: string; templateId: string }>();
  const { language } = useLanguage();

  // 국적 탭 관리 (KR, US, VN)
  const nationalityLabels: Record<string, string> = {
    KR: '한국',
    US: '미국',
    VN: '베트남',
  };
  const nationalityLanguages: Record<string, 'ko' | 'en' | 'vi'> = {
    KR: 'ko',
    US: 'en',
    VN: 'vi',
  };

  const [nationalityTab, setNationalityTab] = useState<string>('KR');
  const [title, setTitle] = useState<Record<string, string>>({
    KR: '',
    US: '',
    VN: '',
  });
  const [initialContent, setInitialContent] = useState<Record<string, string>>({
    KR: '<p>템플릿 내용을 입력하세요.</p>',
    US: '<p>Please enter template content.</p>',
    VN: '<p>Vui lòng nhập nội dung mẫu.</p>',
  });
  const [isEditorReady, setIsEditorReady] = useState<{ KR: boolean; US: boolean; VN: boolean }>({
    KR: false,
    US: false,
    VN: false,
  });
  const [content, setContent] = useState<Record<string, string>>({
    KR: '',
    US: '',
    VN: '',
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [testSendDialogOpen, setTestSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]); // 나에게 보내기 모달에서 선택된 국적
  // 유효성 검사 상태
  const [titleErrors, setTitleErrors] = useState<Record<string, boolean>>({});
  const [contentErrors, setContentErrors] = useState<Record<string, boolean>>({});
  const [shouldValidate, setShouldValidate] = useState(false); // 버튼 클릭 시 유효성 검사 시작
  const [titleTouched, setTitleTouched] = useState<Record<string, boolean>>({}); // 제목 필드 포커스 아웃 여부
  const [contentTouched, setContentTouched] = useState<Record<string, boolean>>({}); // 본문 필드 포커스 아웃 여부
  const editorRefs = useRef<{ KR: any; US: any; VN: any }>({
    KR: null,
    US: null,
    VN: null,
  });
  const { showSnackbar } = useSnackbar();
  const { showSendingStatus, updateSendingStatus } = useSendingStatus();

  // 발송 그룹 목록 (발송 그룹 관리 데이터와 동기화)
  const sendGroups = mockSendGroups;

  // 선택된 그룹들의 국적 추출
  const availableNationalities = useMemo(() => {
    if (selectedGroupIds.length === 0) {
      return [];
    }

    const nationalitiesSet = new Set<string>();

    selectedGroupIds.forEach((groupId) => {
      const group = sendGroups.find((g) => g.id === groupId);
      if (group?.query?.rules) {
        group.query.rules.forEach((rule: any) => {
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
      }
    });

    // KR, US, VN 순서로 정렬
    const ordered = ['KR', 'US', 'VN'];
    return ordered.filter((nat) => nationalitiesSet.has(nat));
  }, [selectedGroupIds, sendGroups]);

  // 템플릿 데이터 찾기 (메모이제이션)
  const templateData = useMemo(() => {
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
    return null;
  }, [templateId]);

  const template = templateData?.template || null;
  const group = templateData?.group || null;

  const [isInitialized, setIsInitialized] = useState(false);
  const prevTemplateIdRef = useRef<string | undefined>(templateId);
  const prevGroupIdRef = useRef<string | undefined>(groupId);

  useEffect(() => {
    const templateIdChanged = prevTemplateIdRef.current !== templateId;
    const groupIdChanged = prevGroupIdRef.current !== groupId;

    if (templateIdChanged || groupIdChanged) {
      setIsInitialized(false);
      prevTemplateIdRef.current = templateId;
      prevGroupIdRef.current = groupId;
    }

    if (!template || !groupId || isInitialized) return;

    const savedTemplate = getTemplate(groupId, templateId || '');
    if (savedTemplate) {
      // 저장된 템플릿이 MultilingualContent 형식인 경우 Record로 변환
      const savedTitle = typeof savedTemplate.title === 'object' && 'ko' in savedTemplate.title
        ? {
            KR: savedTemplate.title.ko || '',
            US: savedTemplate.title.en || '',
            VN: savedTemplate.title.vi || '',
          }
        : {
            KR: typeof savedTemplate.title === 'string' ? savedTemplate.title : '',
            US: typeof savedTemplate.title === 'string' ? savedTemplate.title : '',
            VN: typeof savedTemplate.title === 'string' ? savedTemplate.title : '',
          };

      const savedContent = typeof savedTemplate.content === 'object' && 'ko' in savedTemplate.content
        ? {
            KR: savedTemplate.content.ko || '<p>템플릿 내용을 입력하세요.</p>',
            US: savedTemplate.content.en || '<p>Please enter template content.</p>',
            VN: savedTemplate.content.vi || '<p>Vui lòng nhập nội dung mẫu.</p>',
          }
        : {
            KR: typeof savedTemplate.content === 'string' ? savedTemplate.content : '<p>템플릿 내용을 입력하세요.</p>',
            US: typeof savedTemplate.content === 'string' ? savedTemplate.content : '<p>Please enter template content.</p>',
            VN: typeof savedTemplate.content === 'string' ? savedTemplate.content : '<p>Vui lòng nhập nội dung mẫu.</p>',
          };

      setTitle(savedTitle);
      setInitialContent(savedContent);
      setContent(savedContent);
    } else {
      const defaultTitle = template?.title
        ? typeof template.title === 'string'
          ? template.title
          : template.title[language] || template.title.ko || ''
        : '';
      setTitle({
        KR: defaultTitle,
        US: defaultTitle,
        VN: defaultTitle,
      });
      const defaultContent = {
        KR: '<p>템플릿 내용을 입력하세요.</p>',
        US: '<p>Please enter template content.</p>',
        VN: '<p>Vui lòng nhập nội dung mẫu.</p>',
      };
      setInitialContent(defaultContent);
      setContent(defaultContent);
    }
    setIsInitialized(true);
  }, [template, groupId, templateId, isInitialized, language]);

  // 각 국적별 에디터 초기화
  useEffect(() => {
    availableNationalities.forEach((nationality) => {
      const editor = editorRefs.current[nationality as 'KR' | 'US' | 'VN'];
      if (editor && isEditorReady[nationality as 'KR' | 'US' | 'VN'] && initialContent[nationality]) {
        const currentContent = editor.getContent();
        if (currentContent !== initialContent[nationality]) {
          editor.setContent(initialContent[nationality]);
          setContent((prev) => ({ ...prev, [nationality]: initialContent[nationality] }));
        }
      }
    });
  }, [initialContent, isEditorReady, availableNationalities]);

  // availableNationalities 변경 시 유효성 검사 상태 초기화
  useEffect(() => {
    const newTitleErrors: Record<string, boolean> = {};
    const newContentErrors: Record<string, boolean> = {};
    const newTitleTouched: Record<string, boolean> = {};
    const newContentTouched: Record<string, boolean> = {};
    availableNationalities.forEach((nationality) => {
      newTitleErrors[nationality] = false;
      newContentErrors[nationality] = false;
      newTitleTouched[nationality] = false;
      newContentTouched[nationality] = false;
    });
    setTitleErrors(newTitleErrors);
    setContentErrors(newContentErrors);
    setTitleTouched(newTitleTouched);
    setContentTouched(newContentTouched);
  }, [availableNationalities]);

  const validateNationalityTitles = (titles: Record<string, string>): boolean => {
    if (availableNationalities.length === 0) return false;
    return availableNationalities.every((nationality) => {
      const title = titles[nationality] || '';
      return title.trim() !== '';
    });
  };

  const getAllContent = (): Record<string, string> => {
    const result: Record<string, string> = {};
    availableNationalities.forEach((nationality) => {
      result[nationality] = editorRefs.current[nationality as 'KR' | 'US' | 'VN']?.getContent() || content[nationality] || '';
    });
    return result;
  };

  const getAllContentText = (): Record<string, string> => {
    const fullContent = getAllContent();
    const result: Record<string, string> = {};
    availableNationalities.forEach((nationality) => {
      const editor = editorRefs.current[nationality as 'KR' | 'US' | 'VN'];
      result[nationality] = editor?.getContent({ format: 'text' }) || fullContent[nationality].replace(/<[^>]*>/g, '').trim();
    });
    return result;
  };

  // 제목 유효성 검사
  const validateTitle = (nationality: string, titleValue: string): boolean => {
    const isValid = titleValue.trim() !== '';
    setTitleErrors((prev) => ({ ...prev, [nationality]: !isValid }));
    return isValid;
  };

  // 본문 유효성 검사
  const validateContent = (nationality: string): boolean => {
    const editor = editorRefs.current[nationality as 'KR' | 'US' | 'VN'];
    const contentText = editor?.getContent({ format: 'text' }) || '';
    const isValid = contentText.trim() !== '';
    setContentErrors((prev) => ({ ...prev, [nationality]: !isValid }));
    return isValid;
  };

  // 모든 필드 유효성 검사
  const validateAllFields = (): boolean => {
    let isValid = true;

    // 제목 검사
    availableNationalities.forEach((nationality) => {
      if (!validateTitle(nationality, title[nationality] || '')) {
        isValid = false;
      }
    });

    // 본문 검사
    availableNationalities.forEach((nationality) => {
      if (!validateContent(nationality)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // 템플릿 저장 유효성 검사
  const validateForSave = (): { isValid: boolean; errorMessage?: string } => {
    if (!validateNationalityTitles(title)) {
      return { isValid: false, errorMessage: '모든 국적에 대한 제목을 입력해주세요.' };
    }

    const allContentText = getAllContentText();
    const missingContent = availableNationalities.find((nationality) => !allContentText[nationality]);
    if (missingContent) {
      return { isValid: false, errorMessage: '모든 국적에 대한 컨텐츠를 입력해주세요.' };
    }

    return { isValid: true };
  };

  // 나에게 보내기 유효성 검사
  const validateForTestSend = (): { isValid: boolean; errorMessage?: string } => {
    if (selectedGroupIds.length === 0) {
      return { isValid: false, errorMessage: '발송 대상을 선택해주세요.' };
    }

    if (availableNationalities.length === 0) {
      return { isValid: false, errorMessage: '선택한 발송 대상에 해당하는 국적이 없습니다.' };
    }

    if (!validateNationalityTitles(title)) {
      return { isValid: false, errorMessage: '모든 국적에 대한 제목을 입력해주세요.' };
    }

    const allContentText = getAllContentText();
    const missingContent = availableNationalities.find((nationality) => !allContentText[nationality]);
    if (missingContent) {
      return { isValid: false, errorMessage: '모든 국적에 대한 컨텐츠를 입력해주세요.' };
    }

    return { isValid: true };
  };

  // 발송 유효성 검사
  const validateForSend = (): { isValid: boolean; errorMessage?: string } => {
    if (selectedGroupIds.length === 0) {
      return { isValid: false, errorMessage: '발송 대상을 선택해주세요.' };
    }

    if (availableNationalities.length === 0) {
      return { isValid: false, errorMessage: '선택한 발송 대상에 해당하는 국적이 없습니다.' };
    }

    if (!validateNationalityTitles(title)) {
      return { isValid: false, errorMessage: '모든 국적에 대한 제목을 입력해주세요.' };
    }

    const allContentText = getAllContentText();
    const missingContent = availableNationalities.find((nationality) => !allContentText[nationality]);
    if (missingContent) {
      return { isValid: false, errorMessage: '모든 국적에 대한 컨텐츠를 입력해주세요.' };
    }

    return { isValid: true };
  };

  // 템플릿 저장
  const handleSave = () => {
    if (!groupId || !templateId) return;

    setShouldValidate(true);
    if (!validateAllFields()) {
      showSnackbar('제목과 본문을 모두 입력해주세요.', 'error', 3000);
      return;
    }

    const validation = validateForSave();
    if (!validation.isValid) {
      showSnackbar(validation.errorMessage || '템플릿을 저장할 수 없습니다.', 'error', 3000);
      return;
    }

    // 템플릿 이름 가져오기
    const templateName = template
      ? (typeof template.name === 'string' ? template.name : template.name.ko || '')
      : '';

    if (!templateName.trim()) {
      showSnackbar('템플릿 이름이 없습니다.', 'error', 3000);
      return;
    }

    const allContent = getAllContent();

    // MultilingualContent 형식으로 변환하여 저장 (선택된 국적만 저장)
    const multilingualTitle: MultilingualContent = {
      ko: title.KR || '',
      en: title.US || '',
      vi: title.VN || '',
    };
    const multilingualContent: MultilingualContent = {
      ko: allContent.KR || '',
      en: allContent.US || '',
      vi: allContent.VN || '',
    };

    // 템플릿 저장
    saveTemplate(groupId, templateId, multilingualTitle, multilingualContent);

    // 템플릿 이름 업데이트
    const storedGroups = getManualMailGroups();
    const groups = storedGroups || manualMailGroups;
    const targetGroup = groups.find((g) => g.id === groupId);
    if (targetGroup) {
      const targetTemplate = targetGroup.templates.find((t: MailTemplate) => String(t.id) === templateId);
      if (targetTemplate) {
        // 템플릿 이름 업데이트 (한국어만 저장)
        targetTemplate.name = templateName;
        saveManualMailGroups(groups);
      }
    }

    showSnackbar('템플릿이 저장되었습니다.', 'success', 5000);
    navigate('/manual-mail');
  };

  // 나에게 보내기 다이얼로그 열기
  const handleTestSend = () => {
    setShouldValidate(true);
    if (!validateAllFields()) {
      showSnackbar('제목과 본문을 모두 입력해주세요.', 'error', 3000);
      return;
    }

    const validation = validateForTestSend();
    if (!validation.isValid) {
      showSnackbar(validation.errorMessage || '나에게 보낼 수 없습니다.', 'error', 3000);
      return;
    }

    // 모달 열 때 선택된 국적을 availableNationalities로 초기화
    setSelectedNationalities([...availableNationalities]);
    setTestSendDialogOpen(true);
  };


  const handleSend = async () => {
    if (!groupId || !templateId) return;

    setShouldValidate(true);
    if (!validateAllFields()) {
      showSnackbar('제목과 본문을 모두 입력해주세요.', 'error', 3000);
      return;
    }

    if (selectedGroupIds.length === 0) {
      showSnackbar('발송 대상을 선택해주세요.', 'error', 3000);
      return;
    }

    if (!validateNationalityTitles(title)) {
      showSnackbar('모든 국적에 대한 제목을 입력해주세요.', 'error', 3000);
      return;
    }

    const allContent = getAllContent();
    const allContentText = getAllContentText();

    // 선택된 국적에 대한 컨텐츠 검증
    const missingContent = availableNationalities.find((nationality) => !allContentText[nationality]);
    if (missingContent) {
      showSnackbar('모든 국적에 대한 컨텐츠를 입력해주세요.', 'error', 3000);
      return;
    }

    // MultilingualContent 형식으로 변환하여 저장 (선택된 국적만 저장)
    const multilingualTitle: MultilingualContent = {
      ko: title.KR || '',
      en: title.US || '',
      vi: title.VN || '',
    };
    const multilingualContent: MultilingualContent = {
      ko: allContent.KR || '',
      en: allContent.US || '',
      vi: allContent.VN || '',
    };

    saveTemplate(groupId, templateId, multilingualTitle, multilingualContent);

    showSendingStatus();
    updateSendingStatus('request');

    await new Promise((resolve) => setTimeout(resolve, 500));
    updateSendingStatus('sending');
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

    const selectedGroups = sendGroups.filter((g) => selectedGroupIds.includes(g.id));
    const recipientCount = selectedGroups.reduce((sum, group) => sum + group.memberCount, 0);
    const sentCount = Math.floor(recipientCount * 0.9);
    const failedCount = recipientCount - sentCount;

    const groupNames = selectedGroups
      .map((g) => {
        const name = g.name;
        return typeof name === 'string' ? name : (name as MultilingualContent)[language] || (name as MultilingualContent).ko || '';
      })
      .join(', ');

    const newHistoryId = `history-${Date.now()}`;
    const sentAt = new Date().toISOString();

    const templateName =
      title[nationalityLanguages[nationalityTab] || 'KR'] ||
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

    const existingHistory = localStorage.getItem('manual_mail_history');
    const historyArray: MailHistory[] = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray.unshift(newHistory);
    localStorage.setItem('manual_mail_history', JSON.stringify(historyArray));

    updateSendingStatus('completed', newHistoryId, {
      totalRecipients: recipientCount,
      sentCount,
      failedCount,
    });

    setConfirmDialogOpen(false);
  };

  const handleBack = () => {
    navigate('/manual-mail');
  };

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

  const editorConfig = {
    height: 500,
    menubar: 'file edit view insert format tools table help',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount',
    ],
    toolbar:
      'undo redo | formatselect | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | templateVariables | preview | code | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    setup: (editor: any) => {
      editor.ui.registry.addMenuButton('templateVariables', {
        text: '변수',
        fetch: (callback: any) => {
          const items = templateVariables.map((variable) => ({
            type: 'menuitem',
            text: variable.text,
            onAction: () => {
              editor.insertContent(`&nbsp;${variable.value}&nbsp;`);
            },
          }));
          callback(items);
        },
      });
    },
  };

  const renderEditor = (nationality: string) => (
    <CustomTabPanel value={nationalityTab} index={nationality}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          제목
        </Typography>
        <TextField
          fullWidth
          value={title[nationality]}
          onChange={(e) => {
            const newValue = e.target.value;
            setTitle((prev) => ({ ...prev, [nationality]: newValue }));
            // 입력할 때마다 유효성 검사
            validateTitle(nationality, newValue);
          }}
          onBlur={() => {
            // 포커스 아웃 시 유효성 검사 및 touched 상태 설정
            setTitleTouched((prev) => ({ ...prev, [nationality]: true }));
            validateTitle(nationality, title[nationality] || '');
          }}
          placeholder={`이메일 제목을 입력하세요 (${nationalityLabels[nationality]})`}
          variant="outlined"
          error={(shouldValidate || titleTouched[nationality]) && titleErrors[nationality]}
          helperText={(shouldValidate || titleTouched[nationality]) && titleErrors[nationality] ? '제목을 입력해주세요.' : ''}
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          본문
        </Typography>
        <Box sx={{ position: 'relative', minHeight: 500 }}>
          {!isEditorReady[nationality as 'KR' | 'US' | 'VN'] && nationalityTab === nationality && (
            <Box
              sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'background.paper', zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <Box sx={{ display: nationalityTab === nationality ? (isEditorReady[nationality as 'KR' | 'US' | 'VN'] ? 'block' : 'none') : 'none' }}>
            <Editor
              key={`editor-${nationality}`}
              apiKey='txjxp10zi9jdxkgkn3vgnphatuze7hgqih2bmlatoix5fdvb'
              onInit={(_evt, editor) => {
                editorRefs.current[nationality as 'KR' | 'US' | 'VN'] = editor;
                setIsEditorReady((prev) => ({ ...prev, [nationality]: true }));
                if (initialContent[nationality]) {
                  editor.setContent(initialContent[nationality]);
                  setContent((prev) => ({ ...prev, [nationality]: initialContent[nationality] }));
                } else {
                  const currentContent = editor.getContent();
                  setContent((prev) => ({ ...prev, [nationality]: currentContent }));
                }
                // blur 이벤트 등록
                editor.on('blur', () => {
                  setContentTouched((prev) => ({ ...prev, [nationality]: true }));
                  validateContent(nationality);
                });
              }}
              onEditorChange={(_content) => {
                setContent((prev) => ({ ...prev, [nationality]: _content }));
                // 에디터 내용 변경 시 유효성 검사 (shouldValidate가 true일 때만)
                if (shouldValidate || contentErrors[nationality]) {
                  setTimeout(() => {
                    validateContent(nationality);
                  }, 0);
                }
              }}
              initialValue={initialContent[nationality]}
              init={{
                ...editorConfig,
                language: nationalityLanguages[nationality] === 'ko' ? 'ko-KR' : nationalityLanguages[nationality] === 'vi' ? 'vi-VN' : 'en',
              }}
            />
          </Box>
        </Box>
      </Box>
    </CustomTabPanel>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box sx={{ mb: 3, flexShrink: 0 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
        {(() => {
          const saveValidation = validateForSave();
          const saveButton = (
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={!saveValidation.isValid}
            >
              {getCommonText('saveTemplate', language)}
            </Button>
          );

          if (saveValidation.isValid) {
            return saveButton;
          }

          return (
            <Tooltip title={saveValidation.errorMessage || '템플릿을 저장할 수 없습니다.'} arrow>
              <span style={{ display: 'inline-block' }}>{saveButton}</span>
            </Tooltip>
          );
        })()}

        {(() => {
          const testSendValidation = validateForTestSend();
          const testSendButton = (
            <Button
              variant="outlined"
              onClick={handleTestSend}
              disabled={!testSendValidation.isValid}
            >
              {getCommonText('sendToMe', language)}
            </Button>
          );

          if (testSendValidation.isValid) {
            return testSendButton;
          }

          return (
            <Tooltip title={testSendValidation.errorMessage || '나에게 보낼 수 없습니다.'} arrow>
              <span style={{ display: 'inline-block' }}>{testSendButton}</span>
            </Tooltip>
          );
        })()}
      </Box>
      {/* 발송 대상 및 국적 탭 (Paper 컴포넌트) */}
      <Paper
        sx={{
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {/* 발송 대상 선택 필드 */}
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
                      const groupName = typeof group?.name === 'string' ? group.name : group?.name?.[language] || '';
                      return group ? `${groupName} (${group.memberCount.toLocaleString()}명)` : '';
                    })
                    .join(', ');
                }}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const value = e.target.value;
                  const newValue = typeof value === 'string' ? value.split(',') : value;

                  if (newValue.includes('all')) {
                    if (selectedGroupIds.length === sendGroups.length) {
                      setSelectedGroupIds([]);
                    } else {
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
                {sendGroups.map((group) => {
                  const groupName = typeof group.name === 'string' ? group.name : group.name?.[language] || '';
                  return (
                    <MenuItem key={group.id} value={group.id}>
                      <Checkbox checked={selectedGroupIds.indexOf(group.id) > -1} />
                      <ListItemText primary={`${groupName} (${group.memberCount.toLocaleString()}명)`} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          {/* 국적 탭 (선택된 그룹이 있을 때만 표시) */}
          {selectedGroupIds.length > 0 && availableNationalities.length > 0 && (
            <>
              <Tabs
                value={availableNationalities.includes(nationalityTab) ? nationalityTab : availableNationalities[0]}
                onChange={(_e, newValue) => setNationalityTab(newValue)}
                sx={{ mb: 3 }}
              >
                {availableNationalities.map((nationality) => {
                  const hasError = ((shouldValidate || contentTouched[nationality]) && contentErrors[nationality]);
                  return (
                    <Tab
                      key={nationality}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography component="span">{nationalityLabels[nationality]}</Typography>
                          {hasError && (
                            <Warning
                              sx={{
                                fontSize: 18,
                                color: 'error.main',
                              }}
                            />
                          )}
                        </Box>
                      }
                      value={nationality}
                      sx={{
                        ...(hasError && {
                          color: 'error.main',
                          '&.Mui-selected': {
                            color: 'error.main',
                          },
                        }),
                      }}
                    />
                  );
                })}
              </Tabs>

              {availableNationalities.map((nationality) => renderEditor(nationality))}
            </>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        {(() => {
          const sendValidation = validateForSend();
          const sendButton = (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShouldValidate(true);
                if (validateAllFields()) {
                  setConfirmDialogOpen(true);
                } else {
                  showSnackbar('제목과 본문을 모두 입력해주세요.', 'error', 3000);
                }
              }}
              disabled={!sendValidation.isValid}
            >
              {getCommonText('send', language)}
            </Button>
          );

          if (sendValidation.isValid) {
            return sendButton;
          }

          return (
            <Tooltip title={sendValidation.errorMessage || '발송할 수 없습니다.'} arrow>
              <span style={{ display: 'inline-block' }}>{sendButton}</span>
            </Tooltip>
          );
        })()}
      </Box>

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

    </Box>
  );
};

export default ManualMailTemplatePage;
