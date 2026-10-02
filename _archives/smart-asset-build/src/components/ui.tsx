'use client';

import { useAppStore } from '@/lib/store';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-surface-dark-1 hover:bg-surface-dark-2 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-accent-dark" />
      ) : (
        <Moon className="w-5 h-5 text-accent-light" />
      )}
    </button>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const baseClasses = 'font-medium transition-all rounded-lg focus-visible:outline-2 focus-visible:outline-accent-dark';
  
  const variants = {
    primary: 'bg-accent-dark text-surface-dark-0 hover:bg-orange-600',
    secondary: 'bg-surface-dark-2 text-ink-dark-base hover:bg-surface-dark-3',
    ghost: 'text-ink-dark-base hover:bg-surface-dark-1',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface-dark-1 rounded-lg border border-surface-dark-2 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status, text }: { status: 'success' | 'warning' | 'error' | 'info'; text: string }) {
  const colors = {
    success: 'bg-status-success text-black',
    warning: 'bg-status-warning text-black',
    error: 'bg-status-error text-white',
    info: 'bg-status-info text-white',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {text}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-surface-dark-2 border-t-accent-dark rounded-full animate-spin" />
    </div>
  );
}
