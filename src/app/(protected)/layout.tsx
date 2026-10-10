import type { ReactNode } from 'react';
import { requireCurrentUser } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireCurrentUser();
  return children;
}
