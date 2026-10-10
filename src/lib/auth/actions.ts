'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  createServerSupabaseClient,
  clearSupabaseSessionCookies,
} from '@/lib/supabase/server';
import { safeNextPath } from './route-guard';

const credentials = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(4096),
});

export async function login(formData: FormData) {
  const next = safeNextPath(formData.get('next'));
  const invalid = `/login?${new URLSearchParams({ error: 'invalid', next })}`;
  const unavailable = `/login?${new URLSearchParams({ error: 'unavailable', next })}`;
  const parsed = credentials.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) redirect(invalid);

  let authenticated = false;
  try {
    const supabase = await createServerSupabaseClient({ writable: true });
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    authenticated = !error && !!data.user && !!data.session;
  } catch {
    redirect(unavailable);
  }
  if (!authenticated) redirect(invalid);
  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signOut() {
  let failed = false;
  try {
    const supabase = await createServerSupabaseClient({ writable: true });
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    failed = !!error;
  } catch {
    failed = true;
  }
  // Always clear the current project's local cookies, even if Auth is unavailable.
  // Cookie write failures here propagate: never claim logout without local cleanup.
  await clearSupabaseSessionCookies();
  revalidatePath('/', 'layout');
  redirect(failed ? '/login?error=signout' : '/login');
}
