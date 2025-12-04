import { Box, Button, CircularProgress, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const editorRefs = useRef<{ ko: any; en: any; vi: any }>({
    ko: null,
    en: null,
    vi: null,
  });
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
      setInitialContent(savedTemplate.content);
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

  const validateMultilingualTitle = (title: MultilingualContent): boolean => {
    if (!title || typeof title !== 'object') return false;
    const ko = typeof title.ko === 'string' ? title.ko : String(title.ko || '');
    const en = typeof title.en === 'string' ? title.en : String(title.en || '');
    const vi = typeof title.vi === 'string' ? title.vi : String(title.vi || '');
    return ko.trim() !== '' && en.trim() !== '' && vi.trim() !== '';
  };

  const getAllContent = (): MultilingualContent => {
    return {
      ko: editorRefs.current.ko?.getContent() || content.ko,
      en: editorRefs.current.en?.getContent() || content.en,
      vi: editorRefs.current.vi?.getContent() || content.vi,
    };
  };

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

  const renderEditor = (lang: 'ko' | 'en' | 'vi', index: number) => (
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
          {!isEditorReady[lang] && languageTab === index && (
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
          <Box sx={{ display: languageTab === index ? (isEditorReady[lang] ? 'block' : 'none') : 'none' }}>
            <Editor
              key={`editor-${lang}`}
              apiKey='txjxp10zi9jdxkgkn3vgnphatuze7hgqih2bmlatoix5fdvb'
              onInit={(_evt, editor) => {
                editorRefs.current[lang] = editor;
                setIsEditorReady((prev) => ({ ...prev, [lang]: true }));
                if (initialContent[lang]) {
                  editor.setContent(initialContent[lang]);
                  setContent((prev) => ({ ...prev, [lang]: initialContent[lang] }));
                } else {
                  const currentContent = editor.getContent();
                  setContent((prev) => ({ ...prev, [lang]: currentContent }));
                }
              }}
              onEditorChange={(_content) => {
                setContent((prev) => ({ ...prev, [lang]: _content }));
              }}
              initialValue={initialContent[lang]}
              init={{
                ...editorConfig,
                language: lang === 'ko' ? 'ko_KR' : lang,
              }}
            />
          </Box>
        </Box>
      </Box>
    </CustomTabPanel>
  );

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
