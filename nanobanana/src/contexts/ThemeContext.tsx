'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeSettings {
  glassEffect: boolean;    // 毛玻璃效果
  transparency: number;    // 透明度 0-100
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_SETTINGS: ThemeSettings = {
  glassEffect: true,
  transparency: 80,
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // 初始化主题和设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('nanobanana-theme') as Theme;
    const savedSettings = localStorage.getItem('nanobanana-theme-settings');
    
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Ignore parse errors
      }
    }
    
    setMounted(true);
  }, []);

  // 主题变化时更新 DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nanobanana-theme', theme);
  }, [theme, mounted]);

  // 设置变化时保存
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('nanobanana-theme-settings', JSON.stringify(settings));
    
    // 应用 CSS 变量
    const root = document.documentElement;
    root.style.setProperty('--glass-blur', settings.glassEffect ? '16px' : '0px');
    root.style.setProperty('--bg-opacity', String(settings.transparency / 100));
  }, [settings, mounted]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
