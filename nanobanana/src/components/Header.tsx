'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onApiClick: () => void;
  isApiConfigured: boolean;
  onThemeClick: () => void;
}

const SLOGANS = [
  '构建你的世界',
  '描绘你的梦境', 
  '释放你的想象',
  '创造独一无二',
  '视觉由此启程',
  '灵感即刻绽放',
];

type TypingPhase = 'typing' | 'deleting' | 'switching';

export default function Header({ onApiClick, isApiConfigured, onThemeClick }: HeaderProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<TypingPhase>('typing');
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 滚动检测
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 打字机效果
  useEffect(() => {
    const slogan = SLOGANS[currentSlogan];
    
    const runAnimation = () => {
      switch (phase) {
        case 'typing':
          if (displayText.length < slogan.length) {
            timeoutRef.current = setTimeout(() => {
              setDisplayText(slogan.slice(0, displayText.length + 1));
            }, 60);
          } else {
            timeoutRef.current = setTimeout(() => {
              setPhase('deleting');
            }, 2500);
          }
          break;
          
        case 'deleting':
          if (displayText.length > 0) {
            timeoutRef.current = setTimeout(() => {
              setDisplayText(slogan.slice(0, displayText.length - 1));
            }, 30);
          } else {
            setPhase('switching');
          }
          break;
          
        case 'switching':
          setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
          setPhase('typing');
          break;
      }
    };

    runAnimation();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, phase, currentSlogan]);

  return (
    <header 
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={{ 
        backgroundColor: scrolled ? 'rgba(var(--color-bg-primary-rgb, 250, 247, 242), 0.85)' : 'var(--color-bg-primary)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderColor: 'rgba(42, 36, 32, 0.08)'
      }}
    >
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, var(--color-banana-light) 0%, var(--color-banana-medium) 100%)`,
                boxShadow: '0 4px 16px rgba(255, 213, 79, 0.25)'
              }}
            >
              <span className="text-2xl">🍌</span>
            </div>
          </div>
          
          <div>
            <h1 
              className="text-xl lg:text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="font-mono">香蕉皮</span>
            </h1>
            <div className="h-5 flex items-center">
              <span 
                className="text-xs lg:text-sm font-mono overflow-hidden whitespace-nowrap"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {displayText}
                <span 
                  className={`inline-block w-0.5 h-4 ml-0.5 ${phase === 'typing' ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: 'var(--color-accent-highlight)' }}
                ></span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 lg:p-3 rounded-xl transition-all duration-300 group"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
            }}
            title={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
          >
            <div 
              className="w-5 h-5 transition-colors duration-300"
              style={{ color: 'var(--color-accent-highlight)' }}
            >
              {theme === 'light' ? Icons.moon : Icons.sun}
            </div>
          </button>

          {/* Theme Settings */}
          <button
            onClick={onThemeClick}
            className="p-2.5 lg:p-3 rounded-xl transition-all duration-300 group"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
            }}
            title="主题设置"
          >
            <div 
              className="w-5 h-5 transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {Icons.cog}
            </div>
          </button>

          {/* API Settings */}
          <button
            onClick={onApiClick}
            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl transition-all duration-300 group"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <div 
              className="w-5 h-5 transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {Icons.settings}
            </div>
            <span 
              className="hidden sm:inline font-mono text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              API 设置
            </span>
            {isApiConfigured && (
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/30"></div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}