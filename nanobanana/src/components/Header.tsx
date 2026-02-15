'use client';

import { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onApiClick: () => void;
  isApiConfigured: boolean;
}

const SLOGANS = [
  '构建你的世界',
  '描绘你的梦境', 
  '释放你的想象',
  '创造独一无二',
  '视觉由此启程',
  '灵感即刻绽放',
];

export default function Header({ onApiClick, isApiConfigured }: HeaderProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  // 打字机效果
  useEffect(() => {
    const slogan = SLOGANS[currentSlogan];
    
    if (isTyping && !isPaused) {
      if (displayText.length < slogan.length) {
        typingRef.current = setTimeout(() => {
          setDisplayText(slogan.slice(0, displayText.length + 1));
        }, 80);
      } else {
        setIsPaused(true);
        typingRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsTyping(false);
        }, 2000);
      }
    } else if (!isTyping && !isPaused) {
      if (displayText.length > 0) {
        typingRef.current = setTimeout(() => {
          setDisplayText(slogan.slice(0, displayText.length - 1));
        }, 40);
      } else {
        setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [displayText, isTyping, isPaused, currentSlogan]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border-b border-[rgba(42,36,32,0.08)] dark:border-[rgba(245,240,232,0.08)] transition-all duration-300">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-2xl">🍌</span>
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[var(--color-banana-medium)] to-[var(--color-accent-highlight)] opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300 -z-10"></div>
          </div>
          
          <div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
              <span className="font-mono">NANOBANANA</span>
            </h1>
            <div className="h-5 flex items-center">
              <span className="text-xs lg:text-sm text-[var(--color-text-muted)] font-mono overflow-hidden whitespace-nowrap">
                {displayText}
                <span className={`inline-block w-0.5 h-4 ml-0.5 bg-[var(--color-accent-highlight)] ${isTyping && !isPaused ? 'animate-pulse' : ''}`}></span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 lg:p-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-all duration-300 group"
            title={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
          >
            <div className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-highlight)] transition-colors duration-300">
              {theme === 'light' ? Icons.moon : Icons.sun}
            </div>
          </button>

          {/* API Settings */}
          <button
            onClick={onApiClick}
            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-all duration-300 group"
          >
            <div className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-highlight)] transition-colors duration-300">
              {Icons.settings}
            </div>
            <span className="hidden sm:inline font-mono text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300">
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
