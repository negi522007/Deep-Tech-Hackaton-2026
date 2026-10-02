import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "AssetIQ — Industrial Asset Intelligence",
  description: "Plateforme de gestion d'actifs industriels et de pièces détachées, augmentée par l'IA.",
};

const ANTI_FOUC = `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.toggle('dark',t!=='light');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><script dangerouslySetInnerHTML={{ __html: ANTI_FOUC }} /></head>
      <body><Providers><Shell>{children}</Shell></Providers></body>
    </html>
  );
}
