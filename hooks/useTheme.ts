import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void; effectiveTheme: 'light' | 'dark' } {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'system';
    }
    return (localStorage.getItem('muchu_theme') as Theme) || 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((selectedTheme: Theme) => {
    let currentEffectiveTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      currentEffectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      currentEffectiveTheme = selectedTheme;
    }

    setEffectiveTheme(currentEffectiveTheme);

    if (currentEffectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    // Set initial state based on system preference if theme is 'system'
    if (theme === 'system') {
        handleChange();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('muchu_theme', newTheme);
    setThemeState(newTheme);
  };

  return { theme, setTheme, effectiveTheme };
}
