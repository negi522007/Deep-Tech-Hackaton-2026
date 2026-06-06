'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Basculer le thème"
      className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--hair)] bg-[var(--surface1)] text-[var(--steel)] hover:text-[var(--chalk)] hover:border-[var(--line)] transition-all"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
