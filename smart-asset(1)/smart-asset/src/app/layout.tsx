import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'AssetIQ — Industrial Asset Intelligence',
  description: 'Plateforme d\'intelligence de maintenance industrielle & pièces de rechange. PWA, diagnostic IA, 3D.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AssetIQ' },
};

export const viewport: Viewport = {
  themeColor: '#05070A', width: 'device-width', initialScale: 1, viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen font-sans antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
