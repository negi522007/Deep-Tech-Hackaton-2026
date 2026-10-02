"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button className="icon-btn" onClick={toggle} aria-label="Changer de thème">
      {dark ? <Sun size={18} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}
    </button>
  );
}
