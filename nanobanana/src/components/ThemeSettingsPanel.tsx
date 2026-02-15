'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from './Icons';

interface ThemeSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSettingsPanel({ isOpen, onClose }: ThemeSettingsPanelProps) {
  const { theme, toggleTheme, settings, updateSettings } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl animate-fade-scale overflow-hidden"
        style={{ 
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(42, 36, 32, 0.08)' }}
        >
          <h2 
            className="text-lg font-bold font-mono"
            style={{ color: 'var(--color-text-primary)' }}
          >
            主题设置
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-black/5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div className="w-5 h-5">{Icons.close}</div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 主题切换 */}
          <div className="flex items-center justify-between">
            <div>
              <div 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                外观模式
              </div>
              <div 
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {theme === 'light' ? '当前：日间模式' : '当前：夜间模式'}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <div className="w-5 h-5">
                {theme === 'light' ? Icons.moon : Icons.sun}
              </div>
              <span className="font-mono text-sm">
                {theme === 'light' ? '夜间' : '日间'}
              </span>
            </button>
          </div>

          {/* 毛玻璃效果 */}
          <div className="flex items-center justify-between">
            <div>
              <div 
                className="font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                毛玻璃效果
              </div>
              <div 
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                为界面添加模糊背景效果
              </div>
            </div>
            <button
              onClick={() => updateSettings({ glassEffect: !settings.glassEffect })}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                settings.glassEffect ? 'bg-[var(--color-accent-highlight)]' : 'bg-gray-300'
              }`}
            >
              <div 
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  settings.glassEffect ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 透明度滑块 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div 
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  背景透明度
                </div>
                <div 
                  className="text-sm mt-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  调整界面背景的透明程度
                </div>
              </div>
              <span 
                className="font-mono text-lg font-bold"
                style={{ color: 'var(--color-accent-highlight)' }}
              >
                {settings.transparency}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={settings.transparency}
              onChange={(e) => updateSettings({ transparency: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-accent-highlight) ${settings.transparency}%, var(--color-bg-tertiary) ${settings.transparency}%)`
              }}
            />
            <div className="flex justify-between mt-2">
              <span 
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                透明
              </span>
              <span 
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                不透明
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div 
            className="p-4 rounded-xl border transition-all duration-300"
            style={{ 
              backgroundColor: `rgba(var(--preview-bg, 250, 247, 242), ${settings.transparency / 100})`,
              backdropFilter: settings.glassEffect ? 'blur(16px)' : 'none',
              borderColor: 'rgba(42, 36, 32, 0.1)'
            }}
          >
            <div 
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              效果预览
            </div>
            <div 
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {settings.glassEffect ? '毛玻璃已开启' : '毛玻璃已关闭'} · 透明度 {settings.transparency}%
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t"
          style={{ borderColor: 'rgba(42, 36, 32, 0.08)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-mono font-bold transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
