import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// React cache deduplicates within one server render, never across user requests.
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return error ? null : user;
  } catch {
    return null;
  }
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=%2Fprivate');
  return user;
}
