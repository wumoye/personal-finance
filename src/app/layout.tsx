import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/app-providers';

export const metadata: Metadata = {
  title: 'Personal Finance Manager',
  description: '个人资金管理系统',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
