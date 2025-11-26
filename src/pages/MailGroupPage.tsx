import { Add, DeleteOutlined, EditOutlined, KeyboardArrowUp } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useScrollTrigger,
  Zoom,
} from '@mui/material';
import { useEffect, useState } from 'react';
import MainCard from '../components/MainCard';
import { useSnackbar } from '../context/SnackbarContext';
import { mockSendGroups, SendGroup } from '../data/mockSendGroups';

const MailGroupPage = () => {
  const { showSnackbar } = useSnackbar();
  const [groups, setGroups] = useState<SendGroup[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SendGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<SendGroup | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupNameError, setGroupNameError] = useState('');

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // 그룹 목록 불러오기
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    // 더미데이터에서 불러오기
    setGroups([...mockSendGroups]);
  };

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleAddClick = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setGroupNameError('');
    setDialogOpen(true);
  };

  const handleEditClick = (group: SendGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setGroupNameError('');
    setDialogOpen(true);
  };

  const handleDeleteClick = (group: SendGroup) => {
    setDeletingGroup(group);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGroup(null);
    setGroupName('');
    setGroupDescription('');
    setGroupNameError('');
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeletingGroup(null);
  };

  const validateGroupName = (name: string): boolean => {
    if (!name.trim()) {
      setGroupNameError('그룹 이름을 입력해주세요.');
      return false;
    }
    if (name.trim().length < 2) {
      setGroupNameError('그룹 이름은 최소 2자 이상이어야 합니다.');
      return false;
    }
    setGroupNameError('');
    return true;
  };

  const handleSave = () => {
    if (!validateGroupName(groupName)) {
      return;
    }

    const trimmedName = groupName.trim();
    const trimmedDescription = groupDescription.trim() || undefined;

    // 중복 체크 (편집 중인 경우 자기 자신 제외)
    const isDuplicate = groups.some(
      (g) => g.name === trimmedName && (!editingGroup || g.id !== editingGroup.id)
    );
    if (isDuplicate) {
      setGroupNameError('이미 존재하는 그룹 이름입니다.');
      return;
    }

    if (editingGroup) {
      // 수정
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: trimmedName,
                description: trimmedDescription,
                updatedAt: new Date().toISOString(),
              }
            : g
        )
      );
      showSnackbar('발송그룹이 수정되었습니다.', 'success', 3000);
    } else {
      // 추가
      const newGroup: SendGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: trimmedName,
        description: trimmedDescription,
        memberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGroups((prev) => [...prev, newGroup]);
      showSnackbar('발송그룹이 추가되었습니다.', 'success', 3000);
    }

    handleDialogClose();
  };

  const handleDeleteConfirm = () => {
    if (!deletingGroup) return;

    setGroups((prev) => prev.filter((g) => g.id !== deletingGroup.id));
    showSnackbar('발송그룹이 삭제되었습니다.', 'success', 3000);

    handleDeleteDialogClose();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        발송그룹 관리
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        메일 발송 그룹을 생성, 수정, 삭제할 수 있습니다.
      </Typography>
      <Paper
        sx={{
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <MainCard>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClick}
              sx={{ textTransform: 'none' }}
            >
              그룹 추가
            </Button>
          </Box>
          <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>그룹 이름</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>설명</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>인원</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="text.secondary">
                        등록된 그룹이 없습니다.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {group.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {group.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" noWrap>
                        {group.memberCount?.toLocaleString() || 0}명
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title="수정">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(group)}
                          sx={{ mr: 1 }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(group)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </TableContainer>
        </MainCard>
      </Paper>

      {/* 그룹 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGroup ? '그룹 수정' : '그룹 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="그룹 이름"
            fullWidth
            variant="outlined"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              if (groupNameError) {
                setGroupNameError('');
              }
            }}
            error={!!groupNameError}
            helperText={groupNameError}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="설명 (선택사항)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ textTransform: 'none' }}>
            {editingGroup ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>그룹 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 <strong>{deletingGroup?.name}</strong> 그룹을 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} sx={{ textTransform: 'none' }}>
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ textTransform: 'none' }}>
            삭제
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
          <Fab color="primary" size="medium" onClick={handleScrollTop} aria-label="scroll back to top">
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Zoom>
    </Box>
  );
};

export default MailGroupPage;
