import { Close, ContentCopy, Download } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Snackbar,
    Tooltip,
    Typography,
} from '@mui/material';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { Inquiry, InquiryCategory, InquiryStatus, UserType } from '../types/inquiry';

interface InquiryDetailModalProps {
  open: boolean;
  inquiry: Inquiry;
  onClose: () => void;
  onAnswerSubmit: (inquiryId: string, answer: string) => void;
  onAnswerSubmitSuccess?: () => void;
}

// Ant Design Descriptions 스타일을 위한 컴포넌트
const DescriptionItem = ({
  label,
  children,
  span = 1,
  labelWidth = '120px',
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
  labelWidth?: string;
}) => (
  <Box
    sx={{
      display: 'flex',
      gridColumn: `span ${span}`,
      borderBottom: '1px solid',
      borderRight: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      sx={{
        width: labelWidth,
        minWidth: labelWidth,
        bgcolor: 'grey.50',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        borderRight: '1px solid',
        borderColor: 'divider',
        fontWeight: 500,
        color: 'text.primary',
        fontSize: '0.875rem',
      }}
    >
      {label}
    </Box>
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        color: 'text.secondary',
        fontSize: '0.875rem',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  </Box>
);

const InquiryDetailModal = ({
  open,
  inquiry,
  onClose,
  onAnswerSubmit,
  onAnswerSubmitSuccess,
}: InquiryDetailModalProps) => {
  const [answer, setAnswer] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  // Snackbar 상태 추가
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    // Dialog가 열리고 Pending 상태일 때만 초기화
    if (open && inquiry.status === InquiryStatus.Pending) {
      // DOM이 렌더링될 시간을 조금 확보하기 위해 setTimeout 사용
      const timer = setTimeout(() => {
        if (editorRef.current && !quillInstance.current) {
          const quill = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: '답변 내용을 입력하세요',
            modules: {
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            },
          });

          quill.on('text-change', () => {
            setAnswer(quill.root.innerHTML);
          });

          quillInstance.current = quill;
        }
      }, 100); // 100ms 지연

      return () => clearTimeout(timer);
    }
  }, [open, inquiry.status]);

  // Reset quill instance when modal closes
  useEffect(() => {
    if (!open) {
      quillInstance.current = null;
    }
  }, [open]);

  const getCategoryLabel = (category: InquiryCategory) => {
    const labels: Record<InquiryCategory, string> = {
      [InquiryCategory.Learning]: '학습',
      [InquiryCategory.Payment]: '결제',
      [InquiryCategory.Instructor]: '강사',
      [InquiryCategory.Content]: '콘텐츠',
      [InquiryCategory.AI_Chatbot]: 'AI챗봇',
      [InquiryCategory.Test]: '테스트 관련',
      [InquiryCategory.Dashboard]: '대시보드 관련',
      [InquiryCategory.InstructorSupport]: '강사 지원 관련',
      [InquiryCategory.PackageEvent]: '패키지/이벤트 관련',
    };
    return labels[category];
  };

  const getUserTypeLabel = (userType: UserType) => {
    const labels: Record<UserType, string> = {
      [UserType.Student]: '학생',
      [UserType.Instructor]: '강사',
      [UserType.Partner]: '제휴',
    };
    return labels[userType];
  };

  const getCountryLabel = (countryCode: string) => {
    const labels: Record<string, string> = {
      KR: '대한민국',
      US: '미국',
      JP: '일본',
      CN: '중국',
      VN: '베트남',
      TH: '태국',
      ID: '인도네시아',
      PH: '필리핀',
      SG: '싱가포르',
      TW: '대만',
      HK: '홍콩',
      MY: '말레이시아',
      IN: '인도',
      AU: '호주',
      GB: '영국',
      CA: '캐나다',
    };
    return labels[countryCode] || countryCode;
  };

  const formatDate = (dateString: string) => {
    return dateString.replace('T', ' ').substring(0, 16);
  };

  const handleSubmit = () => {
    // 빈 태그만 있는 경우(예: <p><br></p>)도 체크
    const isContentEmpty = (content: string) => {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        return temp.textContent?.trim() === '';
    };

    if (answer.trim() && !isContentEmpty(answer)) {
      onAnswerSubmit(inquiry.id, answer);
      setAnswer('');
      // 부모 컴포넌트의 스낵바를 표시하도록 콜백 호출
      if (onAnswerSubmitSuccess) {
        onAnswerSubmitSuccess();
      }
      // 모달 닫기
      onClose();
    } else {
      setSnackbarMessage('답변 내용을 입력해주세요.');
      setSnackbarOpen(true);
    }
  };

  // 이메일 복사 핸들러
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setSnackbarMessage('이메일이 클립보드에 복사되었습니다.');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              문의 상세 정보
            </Typography>
            <Chip
              label={inquiry.status === InquiryStatus.Answered ? '답변완료' : '미답변'}
              color={inquiry.status === InquiryStatus.Answered ? 'success' : 'error'}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
            기본 및 작성자 정보
          </Typography>
          {/* Descriptions Container */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)', // 2열 그리드
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          >
            <DescriptionItem label="카테고리">
              {getCategoryLabel(inquiry.category)}
            </DescriptionItem>
            <DescriptionItem label="등록일시">
              {formatDate(inquiry.created_at)}
            </DescriptionItem>

            <DescriptionItem label="유형">
               {getUserTypeLabel(inquiry.user_type)}
            </DescriptionItem>
            <DescriptionItem label="국적">
              {getCountryLabel(inquiry.user_country)}
            </DescriptionItem>

            <DescriptionItem label="이름 (아이디)">
              {inquiry.user_name || '-'} ({inquiry.user_id})
            </DescriptionItem>
            <DescriptionItem label="닉네임">
              {inquiry.user_nickname || '-'}
            </DescriptionItem>
            <DescriptionItem label="이메일" span={2}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Typography variant="body2" color="text.secondary">
                        {inquiry.user_email}
                    </Typography>
                    <Tooltip title="이메일 복사">
                        <IconButton
                            size="small"
                            onClick={() => handleCopyEmail(inquiry.user_email)}
                            sx={{ p: 0.5 }}
                        >
                            <ContentCopy fontSize="small" sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </DescriptionItem>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
            문의 내용
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          >
            <DescriptionItem label="제목" labelWidth="120px">
              <Typography variant="body2">{inquiry.title}</Typography>
            </DescriptionItem>
            <DescriptionItem label="내용" labelWidth="120px">
              <Box
                sx={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'grey.500',
                    },
                  },
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {inquiry.content}
                </Typography>
              </Box>
            </DescriptionItem>
            {inquiry.has_attachment && (
               <DescriptionItem label="첨부파일" labelWidth="120px">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {inquiry.attachments && inquiry.attachments.length > 0 ? (
                    inquiry.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        startIcon={<Download />}
                        size="small"
                        onClick={() => alert(`첨부파일 다운로드: ${attachment.filename}`)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {attachment.filename}
                        {attachment.size && (
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            ({(attachment.size / 1024).toFixed(0)} KB)
                          </Typography>
                        )}
                      </Button>
                    ))
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      size="small"
                      onClick={() => alert('첨부파일 다운로드 기능')}
                    >
                      {inquiry.attachment_filename || '첨부파일 다운로드'}
                    </Button>
                  )}
                </Box>
              </DescriptionItem>
            )}
          </Box>
        </Box>

        {inquiry.status === InquiryStatus.Answered && inquiry.answer_content && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }} color="primary">
              답변 정보
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                borderTop: '1px solid',
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              <DescriptionItem label="답변자">
                {inquiry.answerer_id}
              </DescriptionItem>
              <DescriptionItem label="답변일시">
                {inquiry.answered_at && formatDate(inquiry.answered_at)}
              </DescriptionItem>
              <DescriptionItem label="답변 내용" span={2}>
                 <Box
                    sx={{
                      '& p': { m: 0 },
                      '& a': { color: 'primary.main' },
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                      '& ul, & ol': { pl: 2, my: 0.5 },
                    }}
                    dangerouslySetInnerHTML={{ __html: inquiry.answer_content || '' }}
                 />
              </DescriptionItem>
            </Box>
          </Box>
        )}

        {inquiry.status === InquiryStatus.Pending && (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
              답변 작성
            </Typography>
            <Box sx={{ height: '250px', mb: 2 }}>
                <div ref={editorRef} style={{ height: '200px' }} />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">
          닫기
        </Button>
        {inquiry.status === InquiryStatus.Pending && (
          <Button onClick={handleSubmit} variant="contained" disabled={!answer.trim()} disableElevation>
            답변 등록
          </Button>
        )}
      </DialogActions>
    </Dialog>

    <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: 1400 }}
    >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
    </Snackbar>
    </>
  );
};

export default InquiryDetailModal;
