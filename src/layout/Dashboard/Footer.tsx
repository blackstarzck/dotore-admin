import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Footer() {
  return (
    <Box
      sx={{
        mt: 'auto',
        pt: 3,
        pb: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" align="center" display="block">
        &copy; {new Date().getFullYear()} Dotore Admin. All rights reserved.
      </Typography>
    </Box>
  );
}
