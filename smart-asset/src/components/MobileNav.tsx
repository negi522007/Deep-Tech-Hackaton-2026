'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, AlertTriangle, Package, ShieldCheck } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Control', icon: LayoutDashboard },
  { href: '/equipments', label: 'Équip.', icon: Boxes },
  { href: '/failures', label: 'Pannes', icon: AlertTriangle },
  { href: '/parts', label: 'Pièces', icon: Package },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 glass flex rounded-2xl px-1 py-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] transition ${
              active ? 'text-ink bg-gradient-to-br from-cyan to-amber font-semibold' : 'text-steel'}`}>
            <Icon size={19} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
