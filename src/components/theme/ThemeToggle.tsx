'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-9 w-[3.25rem] shrink-0 items-center rounded-full border border-surface-600 bg-surface-800 p-0.5 transition-colors dark:border-surface-600 dark:bg-surface-800 light:border-surface-300 light:bg-surface-200"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow transition-transform duration-200 ${
          isDark ? 'translate-x-0' : 'translate-x-[1.35rem]'
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}
