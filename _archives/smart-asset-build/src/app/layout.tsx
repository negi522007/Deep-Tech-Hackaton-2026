import { hanken, jetbrains } from '@/lib/fonts';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Asset Intelligence',
  description: 'Industrial equipment diagnostics and spare parts management',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Asset',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${hanken.variable} ${jetbrains.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0e17" />
      </head>
      <body className="bg-surface-dark-0 text-ink-dark-base transition-colors duration-300 dark:bg-surface-dark-0">
        {children}
      </body>
    </html>
  );
}
