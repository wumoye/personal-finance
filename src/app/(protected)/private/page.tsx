import { Button, Container, Paper, Stack, Typography } from '@mui/material';
import { requireCurrentUser } from '@/lib/auth/current-user';
import { signOut } from '@/lib/auth/actions';

export default async function PrivatePage() {
  const user = await requireCurrentUser();
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">Protected area</Typography>
          <Typography>Signed in as {user.email ?? user.id}</Typography>
          <form action={signOut}><Button type="submit" variant="outlined">Sign out</Button></form>
        </Stack>
      </Paper>
    </Container>
  );
}
