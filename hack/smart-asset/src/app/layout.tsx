import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { StoreProvider } from '@/lib/store';

// Anti-FOUC : applique le bon thème avant le premier paint, évite le flash
const ANTI_FOUC = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();`;

export const metadata: Metadata = {
  title: 'AssetIQ — Industrial Asset Intelligence',
  description: 'Plateforme d\'intelligence de maintenance industrielle & pièces de rechange. PWA, diagnostic IA, 3D.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AssetIQ' },
};

export const viewport: Viewport = {
  themeColor: '#0E1013', width: 'device-width', initialScale: 1, viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
