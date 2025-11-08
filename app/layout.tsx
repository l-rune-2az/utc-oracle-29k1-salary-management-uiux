import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Lương Thưởng',
  description: 'Hệ thống quản lý lương thưởng cho công ty',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--gray-50)',
        }}>
          <Sidebar />
          <main style={{
            flex: 1,
            marginLeft: '220px',
            overflowY: 'auto',
            padding: 'var(--space-6)',
          }}>
            <div className="container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

