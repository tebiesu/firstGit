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
    <header 
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
      style={{ 
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'rgba(var(--border-color-rgb, 42, 36, 32), 0.08)'
      }}
    >
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-4 lg:py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, var(--color-banana-light) 0%, var(--color-banana-medium) 100%)`
              }}
            >
              <span className="text-2xl">🍌</span>
            </div>
          </div>
          
          <div>
            <h1 
              className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span className="font-mono">NANOBANANA</span>
            </h1>
            <div className="h-5 flex items-center">
              <span 
                className="text-xs lg:text-sm font-mono overflow-hidden whitespace-nowrap"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {displayText}
                <span 
                  className={`inline-block w-0.5 h-4 ml-0.5 ${isTyping && !isPaused ? 'animate-pulse' : ''}`}
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
              className="w-5 h-5 transition-colors duration-300 group-hover:opacity-80"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {theme === 'light' ? Icons.moon : Icons.sun}
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