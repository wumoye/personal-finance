'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { safeNextPath } from './route-guard';

export async function login(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const next = safeNextPath(typeof formData.get('next') === 'string' ? String(formData.get('next')) : null);
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) redirect('/login?error=invalid');
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=invalid');
  redirect(next);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}
