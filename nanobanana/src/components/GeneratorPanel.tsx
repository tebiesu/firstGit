'use client';

import { useState, useEffect } from 'react';
import type { GenerationParams, ApiConfig } from '@/app/page';
import { Icons } from './Icons';

interface GeneratorPanelProps {
  params: GenerationParams;
  onChange: (params: GenerationParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  apiConfig: ApiConfig;
  availableModels: string[];
  onOpenOptimizer: () => void;
}

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', desc: '正方形' },
  { value: '4:3', label: '4:3', desc: '标准屏' },
  { value: '3:4', label: '3:4', desc: '竖屏' },
  { value: '16:9', label: '16:9', desc: '宽屏' },
  { value: '9:16', label: '9:16', desc: '手机' },
  { value: '2:3', label: '2:3', desc: '海报' },
  { value: '3:2', label: '3:2', desc: '摄影' },
  { value: '21:9', label: '21:9', desc: '超宽' },
  { value: '9:21', label: '9:21', desc: '长图' },
];

const RESOLUTIONS = [
  { value: '1024', label: '1K', desc: '标准' },
  { value: '2048', label: '2K', desc: '高清' },
  { value: '4096', label: '4K', desc: '极致' },
];

const STEP_PRESETS = [
  { value: 15, label: '快速', desc: '15步' },
  { value: 30, label: '标准', desc: '30步' },
  { value: 50, label: '精细', desc: '50步' },
  { value: 80, label: '极致', desc: '80步' },
];

export default function GeneratorPanel({
  params,
  onChange,
  onGenerate,
  isGenerating,
  error,
  apiConfig,
  availableModels,
  onOpenOptimizer,
}: GeneratorPanelProps) {
  const [localParams, setLocalParams] = useState(params);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [includeSizeInPrompt, setIncludeSizeInPrompt] = useState(true);

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  const updateParam = <K extends keyof GenerationParams>(
    key: K,
    value: GenerationParams[K]
  ) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    onChange(newParams);
  };

  const generateRandomSeed = () => {
    updateParam('seed', Math.floor(Math.random() * 2147483647));
  };

  const clearSeed = () => {
    updateParam('seed', null);
  };

  const presetPrompts = [
    '一只穿着西装的猫坐在办公桌前，超写实风格',
    '赛博朋克城市的霓虹灯街道，雨夜氛围，电影质感',
    '中国水墨画风格的山水，意境悠远，留白艺术',
    '未来主义风格的太空站，星辰大海背景，科幻感',
  ];

  // 获取当前选择的分辨率描述
  const getCurrentResolutionDesc = () => {
    const res = RESOLUTIONS.find(r => r.value === localParams.resolution);
    const ratio = ASPECT_RATIOS.find(r => r.value === localParams.aspectRatio);
    return `${ratio?.desc || ''} ${res?.desc || ''} (${localParams.aspectRatio}, ${localParams.resolution}px)`.trim();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-10 space-y-10">
        {/* Section: Prompt */}
        <section className="space-y-6 animate-fade-scale stagger-1">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 text-[var(--color-banana-dark)]">
                {Icons.pencil}
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider">
                提示词
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                描述你想要生成的图像
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label-brutal mb-0">正向提示词</label>
                <button
                  type="button"
                  onClick={onOpenOptimizer}
                  className="btn-brutal btn-brutal--secondary text-xs py-2 px-5 flex items-center gap-2"
                >
                  <div className="w-4 h-4">{Icons.sparkle}</div>
                  AI 优化
                </button>
              </div>
              <textarea
                className="input-brutal min-h-[140px] resize-y"
                placeholder="描述你想要生成的图像..."
                value={localParams.prompt}
                onChange={(e) => updateParam('prompt', e.target.value)}
              />
              
              {/* Size info badge */}
              {includeSizeInPrompt && localParams.prompt && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-banana-light)]/30 rounded-xl text-xs font-mono text-[var(--color-text-secondary)]">
                    <div className="w-4 h-4">{Icons.aspectRatio}</div>
                    <span>{getCurrentResolutionDesc()}</span>
                  </div>
                  <button
                    onClick={() => setIncludeSizeInPrompt(false)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    隐藏
                  </button>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-3">
              {presetPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('prompt', prompt)}
                  className="text-xs font-mono px-5 py-2.5 bg-white/80 border border-[rgba(42,36,32,0.1)] rounded-xl hover:bg-[var(--color-banana-light)] hover:border-[var(--color-banana-medium)] hover:shadow-md transition-all duration-300"
                >
                  示例 {i + 1}
                </button>
              ))}
            </div>

            <div>
              <label className="label-brutal">负向提示词</label>
              <textarea
                className="input-brutal min-h-[80px] resize-y"
                placeholder="描述不想出现的内容（可选）"
                value={localParams.negativePrompt}
                onChange={(e) => updateParam('negativePrompt', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[rgba(42,36,32,0.1)] to-transparent" />

        {/* Section: Aspect Ratio */}
        <section className="space-y-6 animate-fade-scale stagger-2">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-coral-light)] to-[var(--color-coral)] rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 text-white">
                {Icons.aspectRatio}
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider">
                比例
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                选择图片的长宽比
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => updateParam('aspectRatio', ratio.value)}
                className={`p-4 font-mono text-sm border-2 transition-all duration-300 ${
                  localParams.aspectRatio === ratio.value
                    ? 'bg-[var(--color-banana-light)] border-[var(--color-banana-medium)] shadow-lg scale-105'
                    : 'bg-white/60 border-transparent hover:bg-white hover:border-[rgba(42,36,32,0.1)]'
                }`}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div className="font-bold">{ratio.label}</div>
                <div className="text-xs mt-1 opacity-60">{ratio.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Resolution */}
        <section className="space-y-6 animate-fade-scale stagger-3">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 text-white">
                {Icons.resolution}
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider">
                分辨率
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                更高的分辨率需要更长生成时间
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {RESOLUTIONS.map((res) => (
              <button
                key={res.value}
                onClick={() => updateParam('resolution', res.value)}
                className={`p-5 font-mono text-sm border-2 transition-all duration-300 ${
                  localParams.resolution === res.value
                    ? 'bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] text-white border-transparent shadow-lg scale-105'
                    : 'bg-white/60 border-transparent hover:bg-white hover:border-[rgba(42,36,32,0.1)]'
                }`}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                <div className="font-bold text-lg">{res.label}</div>
                <div className="text-xs opacity-70 mt-1">{res.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section: Model */}
        <section className="space-y-6 animate-fade-scale stagger-4">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-banana-peel)] to-[var(--color-banana-dark)] rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 text-white">
                {Icons.robot}
              </div>
            </div>
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider">
                模型
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                选择图片生成模型
              </p>
            </div>
          </div>

          <div>
            <label className="label-brutal">生成模型</label>
            {availableModels.length > 0 ? (
              <select
                className="select-brutal"
                value={localParams.model}
                onChange={(e) => updateParam('model', e.target.value)}
              >
                <option value="">使用默认模型</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  type="text"
                  className="input-brutal"
                  placeholder={apiConfig.model || '输入模型名称，如: nano-banana-pro'}
                  value={localParams.model}
                  onChange={(e) => updateParam('model', e.target.value)}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-3 font-mono">
                  配置 API 后可自动获取可用模型
                </p>
              </>
            )}
          </div>
        </section>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 bg-white/60 border border-[rgba(42,36,32,0.1)] rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 text-[var(--color-text-secondary)]">
              {Icons.cog}
            </div>
            <span className="font-display text-sm uppercase tracking-wider">
              高级设置
            </span>
          </div>
          <svg 
            className={`w-5 h-5 text-[var(--color-text-muted)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}
            style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Advanced Settings Panel */}
        <div 
          className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            showAdvanced ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-6 p-6 bg-white/80 backdrop-blur-sm border border-[rgba(42,36,32,0.08)] rounded-xl shadow-sm">
            {/* Steps */}
            <div>
              <label className="label-brutal">采样步数</label>
              <div className="flex gap-3 mb-4">
                {STEP_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => updateParam('steps', preset.value)}
                    className={`flex-1 py-3 text-xs font-mono border-2 transition-all duration-300 ${
                      localParams.steps === preset.value
                        ? 'bg-[var(--color-text-primary)] text-white border-transparent'
                        : 'bg-white/60 border-transparent hover:border-[rgba(42,36,32,0.2)]'
                    }`}
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={10}
                max={150}
                value={localParams.steps}
                onChange={(e) => updateParam('steps', parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--color-bg-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--color-accent-highlight)]"
              />
              <div className="text-right text-sm font-mono text-[var(--color-text-muted)] mt-2">
                {localParams.steps} 步
              </div>
            </div>

            {/* Guidance Scale */}
            <div>
              <label className="label-brutal">引导强度 (CFG)</label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={localParams.guidance}
                onChange={(e) => updateParam('guidance', parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--color-bg-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--color-accent-highlight)]"
              />
              <div className="text-right text-sm font-mono text-[var(--color-text-muted)] mt-2">
                {localParams.guidance.toFixed(1)}
              </div>
            </div>

            {/* Seed */}
            <div>
              <label className="label-brutal">随机种子</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  className="input-brutal flex-1"
                  placeholder="随机"
                  value={localParams.seed ?? ''}
                  onChange={(e) => updateParam('seed', e.target.value ? parseInt(e.target.value) : null)}
                />
                <button
                  onClick={generateRandomSeed}
                  className="btn-brutal btn-brutal--secondary px-5 flex items-center gap-2"
                  title="生成随机种子"
                >
                  <div className="w-4 h-4">{Icons.dice}</div>
                </button>
                <button
                  onClick={clearSeed}
                  className="btn-brutal btn-brutal--outline px-5"
                  title="清除种子"
                >
                  <div className="w-4 h-4">{Icons.close}</div>
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-3 font-mono">
                相同种子 + 相同参数 = 相同结果
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-50 border border-red-200 text-red-700 font-mono text-sm rounded-xl animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                {Icons.warning}
              </div>
              <div className="whitespace-pre-wrap">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || !localParams.prompt.trim()}
          className={`w-full btn-brutal btn-brutal--primary py-6 text-lg animate-fade-scale stagger-5 flex items-center justify-center gap-4 ${
            isGenerating ? 'animate-pulse cursor-wait' : ''
          } ${!localParams.prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGenerating ? (
            <>
              <div className="w-6 h-6 animate-spin">
                {Icons.hourglass}
              </div>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🍌</span>
              <span>生成图像</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
