import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`
        relative w-12 h-12 rounded-2xl border-2 transition-all duration-500 ease-in-out
        ${theme === 'light'
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-xl'
        }
        group overflow-hidden
      `}
    >
      {/* Background gradient animation */}
      <div className={`
        absolute inset-0 rounded-2xl transition-all duration-500 ease-in-out
        ${theme === 'light'
          ? 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20 opacity-0 group-hover:opacity-100'
          : 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 opacity-0 group-hover:opacity-100'
        }
      `} />

      {/* Sun Icon */}
      <Sun className={`
        absolute w-5 h-5 transition-all duration-500 ease-in-out
        ${theme === 'light'
          ? 'text-blue-600 rotate-0 scale-100 opacity-100'
          : 'text-yellow-400 rotate-90 scale-75 opacity-0'
        }
      `} />

      {/* Moon Icon */}
      <Moon className={`
        absolute w-5 h-5 transition-all duration-500 ease-in-out
        ${theme === 'dark'
          ? 'text-slate-200 rotate-0 scale-100 opacity-100'
          : 'text-slate-600 -rotate-90 scale-75 opacity-0'
        }
      `} />

      {/* Animated background particles */}
      <div className={`
        absolute inset-0 rounded-2xl transition-all duration-500 ease-in-out
        ${theme === 'light'
          ? 'bg-gradient-to-br from-yellow-200/30 to-orange-200/30'
          : 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30'
        }
        opacity-0 group-hover:opacity-100
      `} />

      {/* Ripple effect */}
      <div className={`
        absolute inset-0 rounded-2xl transition-all duration-300 ease-out
        ${theme === 'light'
          ? 'bg-blue-400/20'
          : 'bg-slate-400/20'
        }
        scale-0 group-active:scale-100 opacity-0 group-active:opacity-100
      `} />
    </Button>
  );
};