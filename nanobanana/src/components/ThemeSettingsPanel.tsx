'use client';

import { useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Icons } from './Icons';

interface ThemeSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSettingsPanel({ isOpen, onClose }: ThemeSettingsPanelProps) {
  const { theme, toggleTheme, settings, updateSettings } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 检查文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateSettings({ backgroundImage: result });
    };
    reader.readAsDataURL(file);
  };

  // 清除背景图片
  const clearBackgroundImage = () => {
    updateSettings({ backgroundImage: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className="relative w-full max-w-lg mx-4 rounded-2xl shadow-2xl animate-fade-scale overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'var(--color-bg-primary)',
          border: '1px solid var(--border-light)'
        }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm"
          style={{ 
            borderColor: 'rgba(42, 36, 32, 0.08)',
            backgroundColor: 'rgba(var(--color-bg-primary-rgb, 250, 247, 242), 0.9)'
          }}
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

          {/* 分割线 */}
          <div className="border-t" style={{ borderColor: 'rgba(42, 36, 32, 0.08)' }} />

          {/* 背景图片 */}
          <div>
            <div 
              className="font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              背景图片
            </div>
            
            {/* 图片预览 */}
            {settings.backgroundImage ? (
              <div className="relative group">
                <div 
                  className="w-full h-32 rounded-xl bg-cover bg-center border"
                  style={{ 
                    backgroundImage: `url(${settings.backgroundImage})`,
                    borderColor: 'rgba(42, 36, 32, 0.1)'
                  }}
                />
                <button
                  onClick={clearBackgroundImage}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="移除背景"
                >
                  <div className="w-4 h-4 text-white">{Icons.trash}</div>
                </button>
              </div>
            ) : (
              <div 
                className="w-full h-32 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-[var(--color-accent-highlight)] transition-colors duration-200"
                style={{ borderColor: 'rgba(42, 36, 32, 0.2)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {Icons.image}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                    点击上传背景图片
                  </div>
                </div>
              </div>
            )}

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* 上传按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-3 py-2.5 rounded-xl font-mono text-sm transition-all duration-300"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)'
              }}
            >
              {settings.backgroundImage ? '更换图片' : '选择图片'}
            </button>
          </div>

          {/* 背景模糊 */}
          {settings.backgroundImage && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    背景模糊
                  </div>
                  <div 
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    模糊背景图片
                  </div>
                </div>
                <span 
                  className="font-mono text-lg font-bold"
                  style={{ color: 'var(--color-accent-highlight)' }}
                >
                  {settings.backgroundBlur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.backgroundBlur}
                onChange={(e) => updateSettings({ backgroundBlur: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-accent-highlight) ${settings.backgroundBlur / 20 * 100}%, var(--color-bg-tertiary) ${settings.backgroundBlur / 20 * 100}%)`
                }}
              />
            </div>
          )}

          {/* 分割线 */}
          <div className="border-t" style={{ borderColor: 'rgba(42, 36, 32, 0.08)' }} />

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
                为界面元素添加模糊背景
              </div>
            </div>
            <button
              onClick={() => updateSettings({ glassEffect: !settings.glassEffect })}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                settings.glassEffect ? '' : 'opacity-60'
              }`}
              style={{
                backgroundColor: settings.glassEffect ? 'var(--color-accent-highlight)' : 'var(--color-bg-tertiary)'
              }}
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
                background: `linear-gradient(to right, var(--color-accent-highlight) ${(settings.transparency - 30) / 70 * 100}%, var(--color-bg-tertiary) ${(settings.transparency - 30) / 70 * 100}%)`
              }}
            />
          </div>

          {/* 预览 */}
          <div 
            className="relative overflow-hidden rounded-xl border transition-all duration-300"
            style={{ 
              borderColor: 'rgba(42, 36, 32, 0.1)'
            }}
          >
            {/* 背景层 */}
            {settings.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${settings.backgroundImage})`,
                  filter: `blur(${settings.backgroundBlur}px)`,
                  transform: `scale(${settings.backgroundScale / 100})`
                }}
              />
            )}
            
            {/* 内容层 */}
            <div 
              className="relative p-4 transition-all duration-300"
              style={{ 
                backgroundColor: settings.backgroundImage 
                  ? `rgba(var(--color-bg-primary-rgb, 250, 247, 242), ${settings.transparency / 100})`
                  : 'var(--color-bg-secondary)',
                backdropFilter: settings.glassEffect ? 'blur(16px)' : 'none'
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
                {settings.glassEffect ? '毛玻璃' : '无毛玻璃'} · 透明度 {settings.transparency}%
                {settings.backgroundImage && ` · 背景模糊 ${settings.backgroundBlur}px`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="sticky bottom-0 px-6 py-4 border-t backdrop-blur-sm"
          style={{ 
            borderColor: 'rgba(42, 36, 32, 0.08)',
            backgroundColor: 'rgba(var(--color-bg-primary-rgb, 250, 247, 242), 0.9)'
          }}
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