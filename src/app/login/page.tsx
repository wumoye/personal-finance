import { Container, Paper, Stack, Typography } from '@mui/material';
import { login } from '@/lib/auth/actions';
import { safeNextPath } from '@/lib/auth/route-guard';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const query = await searchParams;
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography component="h1" variant="h4">Sign in</Typography>
          {query.error && <Typography role="alert" color="error">Sign in failed. Please verify your credentials.</Typography>}
          <form action={login}>
            <input type="hidden" name="next" value={safeNextPath(query.next ?? null)} />
            <Stack spacing={2}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
              <button type="submit">Sign in</button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
