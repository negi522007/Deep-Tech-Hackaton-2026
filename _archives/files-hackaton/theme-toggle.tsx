"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/* Bouton de bascule de thème.
   ⚠️ Anti-FOUC : ajoute ce script INLINE dans <head> de app/layout.tsx,
   AVANT tout rendu, pour éviter le flash de thème :

   <script dangerouslySetInnerHTML={{ __html: `
     (function(){
       try {
         var t = localStorage.getItem('theme')
           || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
         document.documentElement.classList.toggle('dark', t === 'dark');
       } catch(e){}
     })();
   `}} />
*/

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("theme", next); } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      className="grid h-10 w-10 place-items-center rounded-btn border border-hair
                 text-ink-soft transition-colors duration-200 ease-out-quart
                 hover:text-ink hover:border-strong"
    >
      {theme === "dark" ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
    </button>
  );
}
