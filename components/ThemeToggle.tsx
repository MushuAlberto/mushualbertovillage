import React from 'react';
import { useTheme, Theme } from '../hooks/useTheme';
import { SunIcon, MoonIcon, SystemIcon } from './icons';
import { Button } from './shared/Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <SunIcon className="w-4 h-4" /> },
    { value: 'dark', label: 'Oscuro', icon: <MoonIcon className="w-4 h-4" /> },
    { value: 'system', label: 'Sistema', icon: <SystemIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center space-x-1 p-0.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => setTheme(option.value)}
          variant={theme === option.value ? 'primary' : 'ghost'}
          size="sm"
          className={`px-2 py-1 !text-xs transition-colors duration-150
            ${theme === option.value 
              ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-sm' 
              : 'bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
            }`}
          title={`Cambiar a tema ${option.label.toLowerCase()}`}
        >
          {option.icon}
          <span className="hidden sm:inline ml-1">{option.label}</span>
        </Button>
      ))}
    </div>
  );
};
