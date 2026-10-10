import {
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { redirect } from 'next/navigation';
import { login } from '@/lib/auth/actions';
import { getCurrentUser } from '@/lib/auth/current-user';
import { safeNextPath } from '@/lib/auth/route-guard';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: '登录失败，请检查邮箱和密码。',
  unavailable: '暂时无法登录，请稍后重试。',
  signout: '本机登录状态已清除，远端会话注销暂未确认。',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const next = safeNextPath(query.next);
  if (await getCurrentUser()) redirect(next);
  const message =
    typeof query.error === 'string' ? messages[query.error] : undefined;
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography component="h1" variant="h4">
            登录
          </Typography>
          {message && (
            <Typography role="alert" color="error">
              {message}
            </Typography>
          )}
          <form action={login}>
            <input type="hidden" name="next" value={next} />
            <Stack spacing={2}>
              <TextField
                label="邮箱"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
              <TextField
                label="密码"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <Button type="submit" variant="contained">
                登录
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
