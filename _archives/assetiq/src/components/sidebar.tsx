"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Boxes, AlertTriangle, PackageSearch, BarChart3, Shield } from "lucide-react";

const NAV = [
  { href: "/", label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/equipment", label: "Équipements", Icon: Boxes },
  { href: "/declare", label: "Déclarer", Icon: AlertTriangle },
  { href: "/requests", label: "Demandes", Icon: PackageSearch },
  { href: "/analytics", label: "Analytique", Icon: BarChart3 },
  { href: "/admin", label: "Administration", Icon: Shield },
];

export function Sidebar() {
  const path = usePathname();
  const isOn = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <div className="logo">◆</div>
        <div><div className="brand-name">ASSET<span>IQ</span></div><div className="brand-sub mono">industrial intelligence</div></div>
      </Link>
      <nav>
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={"nav-item" + (isOn(href) ? " on" : "")}>
            <Icon size={17} strokeWidth={1.6} /><span className="nav-text">{label}</span>
            {isOn(href) && <span className="nav-bar" />}
          </Link>
        ))}
      </nav>
      <div className="side-foot mono sm muted">v0.9 · prototype</div>
    </aside>
  );
}
