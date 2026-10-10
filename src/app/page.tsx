import { Container, Paper, Stack, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: { xs: 6, md: 12 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="overline" color="primary">
            Personal Finance Manager
          </Typography>
          <Typography component="h1" variant="h4">
            个人资金管理
          </Typography>
          <Typography color="text.secondary">
            欢迎使用个人资金管理系统。
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
