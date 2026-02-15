'use client';

import { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  onApiClick: () => void;
  isApiConfigured: boolean;
}

const SLOGANS = [
  '构建你的世界',
  '描绘你的梦境',
  '释放你的想象',
  '创造无限可能',
  '让灵感具象化',
  '艺术从此开始',
];

export default function Header({ onApiClick, isApiConfigured }: HeaderProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 打字机效果
  useEffect(() => {
    const slogan = SLOGANS[currentSlogan];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // 打字
      if (displayText.length < slogan.length) {
        timeout = setTimeout(() => {
          setDisplayText(slogan.slice(0, displayText.length + 1));
        }, 100);
      } else {
        // 打完字后等待
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    } else {
      // 删除
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        // 删除完毕，切换到下一个标语
        setIsDeleting(false);
        setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentSlogan]);

  return (
    <header className="relative overflow-hidden backdrop-blur-sm">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-banana-light)] via-[#fff8e1] to-[var(--color-banana-light)]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--color-accent-highlight)]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[var(--color-banana-medium)]/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232a2420' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex items-center justify-between px-10 py-6">
        {/* Logo */}
        <div className="flex items-center gap-6 animate-slide-left">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-3 bg-gradient-to-br from-[var(--color-banana-light)] to-transparent rounded-full opacity-60 animate-pulse" />
            <span 
              className="relative text-5xl animate-float drop-shadow-lg inline-block"
              style={{ animationDelay: '0.2s' }}
            >
              🍌
            </span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[var(--color-text-primary)] via-[var(--color-accent-highlight)] to-[var(--color-text-primary)] bg-clip-text text-transparent">
                NANOBANANA
              </span>
            </h1>
            {/* Typewriter slogan */}
            <div className="h-5 flex items-center overflow-hidden">
              <span className="text-sm font-mono text-[var(--color-text-secondary)] tracking-wider">
                {displayText}
                <span className="inline-block w-0.5 h-4 bg-[var(--color-accent-highlight)] ml-0.5 animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 animate-slide-right">
          {/* API Status Indicator */}
          <button
            onClick={onApiClick}
            className="group flex items-center gap-3 px-5 py-3 bg-white/60 hover:bg-white border border-[rgba(42,36,32,0.08)] hover:border-[var(--color-accent-highlight)] rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <span className="relative flex h-3 w-3">
              <span 
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isApiConfigured ? 'bg-green-400 animate-ping' : 'bg-red-300'
                }`} 
              />
              <span 
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isApiConfigured ? 'bg-green-500' : 'bg-red-400'
                }`} 
              />
            </span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-highlight)] transition-colors">
                {Icons.settings}
              </div>
              <span className="hidden sm:inline font-medium text-sm group-hover:text-[var(--color-accent-highlight)] transition-colors">
                API 设置
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--color-banana-medium)] to-transparent opacity-50" />
    </header>
  );
}