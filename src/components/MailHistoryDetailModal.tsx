import { Clear, Close, Search } from '@mui/icons-material';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { MailHistory } from '../data/mockMailHistory';

interface MailHistoryDetailModalProps {
  open: boolean;
  history: MailHistory | null;
  onClose: () => void;
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

const MailHistoryDetailModal = ({ open, history, onClose }: MailHistoryDetailModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!history) return null;

  // 검색어나 history가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setPage(0);
  }, [searchQuery, history?.id]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // 검색 필터링된 수신자 목록 (성공 + 실패 모두 포함)
  const filteredRecipients = useMemo(() => {
    const allRecipients = [
      ...(history.successfulRecipients || []),
      ...(history.failedRecipients || []),
    ];
    if (!searchQuery.trim()) return allRecipients;

    const query = searchQuery.toLowerCase();
    return allRecipients.filter((recipient) => {
      return (
        recipient.userId.toLowerCase().includes(query) ||
        recipient.userName.toLowerCase().includes(query) ||
        recipient.userEmail.toLowerCase().includes(query)
      );
    });
  }, [history.successfulRecipients, history.failedRecipients, searchQuery]);

  // 페이지네이션된 수신자 목록
  const paginatedRecipients = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRecipients.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecipients, page, rowsPerPage]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1); // Pagination은 1부터 시작하므로 0-based index로 변환
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusChip = (status: MailHistory['status']) => {
    switch (status) {
      case 'success':
        return <Chip label="성공" color="success" size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
      case 'partial':
        return <Chip label="부분 성공" color="warning" size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
      case 'failed':
        return <Chip label="실패" color="error" size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          height: '100%',
          maxHeight: '80vh',
          m: 0,
        },
      }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              발송 이력 상세 정보
            </Typography>
            {getStatusChip(history.status)}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
            기본 정보
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
            <DescriptionItem label="템플릿 이름">
              {history.templateName}
            </DescriptionItem>
            <DescriptionItem label="그룹 이름">
              {history.groupName}
            </DescriptionItem>

            <DescriptionItem label="수신자 수">
              {history.recipientCount.toLocaleString()}명
            </DescriptionItem>
            {history.type === 'manual' ? (
              <DescriptionItem label="유형">수동</DescriptionItem>
            ) : (
              <DescriptionItem label="유형">자동</DescriptionItem>
            )}

            <DescriptionItem label="발송 성공">
              {history.sentCount.toLocaleString()}명
            </DescriptionItem>
            {history.type === 'manual' && (
              <DescriptionItem label="상태">
                {getStatusChip(history.status)}
              </DescriptionItem>
            )}

            {history.type === 'manual' && (
              <>
                <DescriptionItem label="발송 실패">
                  {history.failedCount.toLocaleString()}명
                </DescriptionItem>
                <DescriptionItem label="발송자">
                  {history.sentBy}
                </DescriptionItem>
                <DescriptionItem label="발송일" span={2}>
                  {formatDateOnly(history.sentAt)}
                </DescriptionItem>
              </>
            )}
            {history.type === 'auto' && (
              <DescriptionItem label="발송 실패">
                {history.failedCount.toLocaleString()}명
              </DescriptionItem>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
            수신자 목록
            {filteredRecipients.length > 0 && (
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({filteredRecipients.length}명)
              </Typography>
            )}
          </Typography>

            {/* 검색 입력 필드 */}
            {history.successfulRecipients && history.successfulRecipients.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="사용자 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearSearch} edge="end" size="small">
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {(history.successfulRecipients && history.successfulRecipients.length > 0) ||
            (history.failedRecipients && history.failedRecipients.length > 0) ? (
              <Paper
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                }}
              >
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>사용자 ID</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>사용자명</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>이메일</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>유형</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>템플릿 이름</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>수신 상태</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>발송일</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRecipients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" color="text.secondary">
                                {filteredRecipients.length === 0
                                  ? (history.successfulRecipients && history.successfulRecipients.length > 0) ||
                                    (history.failedRecipients && history.failedRecipients.length > 0)
                                    ? '검색 결과가 없습니다.'
                                    : '수신자 목록이 없습니다.'
                                  : '수신자 목록이 없습니다.'}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRecipients.map((recipient) => (
                        <TableRow key={recipient.id} hover>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {recipient.userId}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {recipient.userName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {recipient.userEmail}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {recipient.type === 'auto' ? '자동' : '수동'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {recipient.templateName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {recipient.status === 'success' ? (
                              <Chip label="성공" color="success" size="small" />
                            ) : (
                              <Chip label="실패" color="error" size="small" />
                            )}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Typography variant="body2" noWrap>
                              {formatDateOnly(recipient.sentAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* 페이지네이션 영역 */}
                {filteredRecipients.length > 0 && (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        페이지당 행 수:
                      </Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={handleChangeRowsPerPage}
                        size="small"
                        sx={{
                          minWidth: 80,
                          '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                        }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </Box>
                    <Pagination
                      count={Math.ceil(filteredRecipients.length / rowsPerPage)}
                      page={page + 1} // 0-based index를 1-based로 변환
                      onChange={handleChangePage}
                      variant="outlined"
                      shape="rounded"
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </Paper>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  수신자 목록이 없습니다.
                </Typography>
              </Box>
            )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MailHistoryDetailModal;
