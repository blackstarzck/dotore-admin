import { Clear } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSnackbar } from '../context/SnackbarContext';
import { getCommonText } from '../utils/pageTexts';

interface NationalityOption {
  value: string;
  label: string;
}

interface TestSendDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (email: string, selectedNationalities?: string[]) => void;
  nationalities?: NationalityOption[];
  selectedNationalities?: string[];
  onNationalitiesChange?: (nationalities: string[]) => void;
}

const TestSendDialog = ({
  open,
  onClose,
  onSubmit,
  nationalities,
  selectedNationalities: externalSelectedNationalities,
  onNationalitiesChange,
}: TestSendDialogProps) => {
  const { language } = useLanguage();
  const { showSnackbar } = useSnackbar();
  const [testEmail, setTestEmail] = useState('');
  const [internalSelectedNationalities, setInternalSelectedNationalities] = useState<string[]>([]);

  // 외부에서 selectedNationalities를 관리하는 경우와 내부에서 관리하는 경우 구분
  const selectedNationalities = externalSelectedNationalities !== undefined
    ? externalSelectedNationalities
    : internalSelectedNationalities;

  const handleNationalitiesChange = (newNationalities: string[]) => {
    if (onNationalitiesChange) {
      onNationalitiesChange(newNationalities);
    } else {
      setInternalSelectedNationalities(newNationalities);
    }
  };

  const handleClose = () => {
    setTestEmail('');
    if (!externalSelectedNationalities) {
      setInternalSelectedNationalities([]);
    }
    onClose();
  };

  // 유효성 검사
  const isValid = () => {
    // 이메일 필수
    if (!testEmail.trim()) {
      return false;
    }
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail.trim())) {
      return false;
    }
    // 국적이 있으면 최소 1개 선택 필수
    if (nationalities && nationalities.length > 0 && selectedNationalities.length === 0) {
      return false;
    }
    return true;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 유효성 검사
    if (!isValid()) {
      if (!testEmail.trim()) {
        showSnackbar('이메일을 입력해주세요.', 'error', 3000);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testEmail.trim())) {
        showSnackbar('올바른 이메일 형식을 입력해주세요.', 'error', 3000);
        return;
      }
      if (nationalities && nationalities.length > 0 && selectedNationalities.length === 0) {
        showSnackbar('발송할 국적을 최소 1개 이상 선택해주세요.', 'error', 3000);
        return;
      }
      return;
    }

    const email = testEmail.trim();

    if (onSubmit) {
      onSubmit(email, nationalities ? selectedNationalities : undefined);
    } else {
      // 기본 동작: 스낵바 표시
      showSnackbar(
        getCommonText('testEmailSent', language).replace('{email}', email),
        'success',
        3000
      );
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
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
        {nationalities && nationalities.length > 0 && (
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
                      nationalities.length > 0 &&
                      nationalities.every((nat) => selectedNationalities.includes(nat.value))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleNationalitiesChange(nationalities.map((nat) => nat.value));
                      } else {
                        handleNationalitiesChange([]);
                      }
                    }}
                  />
                }
                label="전체"
              />
              {nationalities.map((nationality) => (
                <FormControlLabel
                  key={nationality.value}
                  control={
                    <Checkbox
                      checked={selectedNationalities.includes(nationality.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleNationalitiesChange([...selectedNationalities, nationality.value]);
                        } else {
                          handleNationalitiesChange(selectedNationalities.filter((n) => n !== nationality.value));
                        }
                      }}
                    />
                  }
                  label={nationality.label}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{getCommonText('cancel', language)}</Button>
        <Button
          type="submit"
          disabled={!isValid()}
        >
          {getCommonText('send', language)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestSendDialog;
