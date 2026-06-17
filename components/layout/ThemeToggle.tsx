'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeOptional } from '@/components/layout/ThemeProvider';

export default function ThemeToggle() {
  const theme = useThemeOptional();
  if (!theme) return null;

  const isDark = theme.theme === 'dark';

  return (
    <button
      type="button"
      onClick={theme.toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-xl border border-outline-variant/50 bg-surface-container/50 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
