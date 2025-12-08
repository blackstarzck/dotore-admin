import { Box, Button, CircularProgress, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { autoMailGroups, MailTemplate } from '../data/mockMailData';
import { MultilingualContent } from '../types/multilingual';
import { getCommonText } from '../utils/pageTexts';
import { getAutoMailGroups, getTemplate, saveTemplate } from '../utils/storage';

const AVAILABLE_VARIABLES = [
  { label: '사용자 이름', value: '{{userName}}' },
  { label: '이메일', value: '{{userEmail}}' },
  { label: '날짜', value: '{{date}}' },
  { label: '주문 번호', value: '{{orderId}}' },
  { label: '회사명', value: '{{companyName}}' },
];

const DEFAULT_CONTENT: MultilingualContent = {
  ko: '<p>템플릿 내용을 입력하세요.</p>',
  en: '<p>Please enter template content.</p>',
  vi: '<p>Vui lòng nhập nội dung mẫu.</p>',
};

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

const AutoMailTemplatePage = () => {
  const navigate = useNavigate();
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
  const [isEditorReady, setIsEditorReady] = useState<{ ko: boolean; en: boolean; vi: boolean }>({
    ko: false,
    en: false,
    vi: false,
  });
  const [content, setContent] = useState<MultilingualContent>(DEFAULT_CONTENT);
  const { showSnackbar } = useSnackbar();

  // 템플릿 데이터 찾기 (메모이제이션)
  const templateData = useMemo(() => {
    // 자동 메일은 localStorage에서 불러온 데이터와 더미데이터 병합
    const storedGroups = getAutoMailGroups();
    const groups = storedGroups || autoMailGroups;
    for (const group of groups) {
      const template = group.templates.find((t: MailTemplate) => {
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
  const prevLanguageRef = useRef<'ko' | 'en' | 'vi'>(language);

  // GNB에서 언어가 변경되면 탭도 자동으로 변경
  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      setLanguageTab(getLanguageTabIndex(language));
      prevLanguageRef.current = language;
    }
  }, [language]);

  useEffect(() => {
    const activeLang = languageTab === 0 ? 'ko' : languageTab === 1 ? 'en' : 'vi';
    setIsEditorReady((prev) => (prev[activeLang] ? { ...prev, [activeLang]: false } : prev));
  }, [languageTab]);

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
      setTitle(savedTemplate.title);
      setContent(savedTemplate.content);
    } else {
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
      setContent(DEFAULT_CONTENT);
    }
    setIsInitialized(true);
  }, [template, groupId, templateId, isInitialized, language]);

  const validateMultilingualTitle = (title: MultilingualContent): boolean => {
    if (!title || typeof title !== 'object') return false;
    const ko = typeof title.ko === 'string' ? title.ko : String(title.ko || '');
    const en = typeof title.en === 'string' ? title.en : String(title.en || '');
    const vi = typeof title.vi === 'string' ? title.vi : String(title.vi || '');
    return ko.trim() !== '' && en.trim() !== '' && vi.trim() !== '';
  };

  const getAllContent = (): MultilingualContent => {
    return {
      ko: content.ko,
      en: content.en,
      vi: content.vi,
    };
  };

  const getAllContentText = (): MultilingualContent => {
    return {
      ko: (content.ko || '').replace(/<[^>]*>/g, '').trim(),
      en: (content.en || '').replace(/<[^>]*>/g, '').trim(),
      vi: (content.vi || '').replace(/<[^>]*>/g, '').trim(),
    };
  };

  const handleSave = () => {
    if (!groupId || !templateId) return;

    if (!validateMultilingualTitle(title)) {
      showSnackbar('모든 언어에 대한 제목을 입력해주세요.', 'error', 3000);
      return;
    }

    const allContent = getAllContent();
    const allContentText = getAllContentText();

    if (!allContentText.ko || !allContentText.en || !allContentText.vi) {
      showSnackbar('모든 언어에 대한 컨텐츠를 입력해주세요.', 'error', 3000);
      return;
    }

    saveTemplate(groupId, templateId, title, allContent);
    showSnackbar('템플릿이 저장되었습니다.', 'success', 5000);
    navigate('/auto-mail');
  };

  const handleBack = () => {
    navigate('/auto-mail');
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

  const renderEditor = (lang: 'ko' | 'en' | 'vi', index: number) => {
    const isActive = languageTab === index;

    return (
      <CustomTabPanel value={languageTab} index={index}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            제목
          </Typography>
          <TextField
            fullWidth
            value={title[lang]}
            onChange={(e) => setTitle((prev) => ({ ...prev, [lang]: e.target.value }))}
            placeholder={`이메일 제목을 입력하세요 (${lang})`}
            variant="outlined"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            본문
          </Typography>
          <Box sx={{ position: 'relative', minHeight: 500 }}>
            {isActive && !isEditorReady[lang] && (
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
            {isActive && (
              <Editor
                key={`editor-${lang}`}
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={content[lang]}
                onInit={(_evt, editor) => {
                  setIsEditorReady((prev) => ({ ...prev, [lang]: true }));
                }}
                onEditorChange={(updatedContent) => {
                  setContent((prev) => ({ ...prev, [lang]: updatedContent }));
                }}
                init={{
                  ...editorConfig,
                  language: lang === 'ko' ? 'ko-KR' : lang,
                }}
              />
            )}
          </Box>
        </Box>
      </CustomTabPanel>
    );
  };

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

          {renderEditor('ko', 0)}
          {renderEditor('en', 1)}
          {renderEditor('vi', 2)}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={handleSave}>
          {getCommonText('save', language)}
        </Button>
      </Box>
    </Box>
  );
};

export default AutoMailTemplatePage;
