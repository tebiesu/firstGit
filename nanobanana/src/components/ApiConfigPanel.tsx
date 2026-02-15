'use client';

import { useState, useEffect } from 'react';
import type { ApiFormat } from '@/app/page';

export interface ApiConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  apiFormat: ApiFormat;
}

export interface AiAssistantConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

interface ApiConfigPanelProps {
  config: ApiConfig;
  onChange: (config: ApiConfig) => void;
  availableModels: string[];
  aiConfig: AiAssistantConfig;
  onAiConfigChange: (config: AiAssistantConfig) => void;
  aiAvailableModels: string[];
}

const API_FORMATS: Array<{ value: ApiFormat; label: string; desc: string }> = [
  { value: 'chat', label: '聊天补全', desc: '/v1/chat/completions' },
  { value: 'images', label: '图片生成', desc: '/v1/images/generations' },
];

export default function ApiConfigPanel({ 
  config, 
  onChange, 
  availableModels,
  aiConfig,
  onAiConfigChange,
  aiAvailableModels,
}: ApiConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState(config);
  const [localAiConfig, setLocalAiConfig] = useState(aiConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAiApiKey, setShowAiApiKey] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [aiCustomModel, setAiCustomModel] = useState('');
  const [aiUseCustomModel, setAiUseCustomModel] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isAiTesting, setIsAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'image' | 'ai'>('image');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  useEffect(() => {
    setLocalAiConfig(aiConfig);
  }, [aiConfig]);

  const handleSave = () => {
    const finalConfig = {
      ...localConfig,
      model: useCustomModel ? customModel : localConfig.model,
    };
    onChange(finalConfig);
    onAiConfigChange(localAiConfig);
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!localConfig.endpoint || !localConfig.apiKey) {
      setTestResult('error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(localConfig.endpoint)}&apiKey=${encodeURIComponent(localConfig.apiKey)}`);

      if (response.ok) {
        setTestResult('success');
        handleSave();
      } else {
        const data = await response.json();
        console.error('Test failed:', data);
        setTestResult('error');
      }
    } catch (err) {
      console.error('Test error:', err);
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleAiTest = async () => {
    if (!localAiConfig.endpoint || !localAiConfig.apiKey) {
      setAiTestResult('error');
      return;
    }

    setIsAiTesting(true);
    setAiTestResult(null);

    try {
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(localAiConfig.endpoint)}&apiKey=${encodeURIComponent(localAiConfig.apiKey)}`);

      if (response.ok) {
        setAiTestResult('success');
        const finalAiConfig = {
          ...localAiConfig,
          model: aiUseCustomModel ? aiCustomModel : localAiConfig.model,
        };
        onAiConfigChange(finalAiConfig);
      } else {
        setAiTestResult('error');
      }
    } catch (err) {
      console.error('AI test error:', err);
      setAiTestResult('error');
    } finally {
      setIsAiTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'image') {
      handleTest();
    } else {
      handleAiTest();
    }
  };

  const updateConfig = <K extends keyof ApiConfig>(key: K, value: ApiConfig[K]) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setTestResult(null);
  };

  const updateAiConfig = <K extends keyof AiAssistantConfig>(key: K, value: AiAssistantConfig[K]) => {
    setLocalAiConfig(prev => ({ ...prev, [key]: value }));
    setAiTestResult(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border-b border-[rgba(42,36,32,0.08)]">
      {/* Tab Headers */}
      <div className="flex bg-[var(--color-bg-secondary)]/50">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex-1 px-6 py-4 font-display text-sm uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'image' 
              ? 'bg-white text-[var(--color-text-primary)] shadow-sm' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/50'
          }`}
          style={{ borderRadius: activeTab === 'image' ? '0 0 var(--radius-md) 0' : '0' }}
        >
          🎨 图片生成 API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-6 py-4 font-display text-sm uppercase tracking-wider transition-all duration-300 ${
            activeTab === 'ai' 
              ? 'bg-white text-[var(--color-text-primary)] shadow-sm' 
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/50'
          }`}
          style={{ borderRadius: activeTab === 'ai' ? '0 0 0 var(--radius-md)' : '0' }}
        >
          🤖 AI 助手 API
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'image' ? (
          /* === 图片生成 API 配置 === */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🎨</span>
              </div>
              <div>
                <h2 className="font-display text-lg uppercase tracking-wider">
                  图片生成 API
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  用于生成图片的 API 配置
                </p>
              </div>
            </div>

            {/* API Format Selection */}
            <div>
              <label className="label-brutal">API 格式</label>
              <div className="grid grid-cols-2 gap-3">
                {API_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => updateConfig('apiFormat', format.value)}
                    className={`p-4 text-left border-2 transition-all duration-300 ${
                      localConfig.apiFormat === format.value
                        ? 'bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] border-[var(--color-banana-dark)] shadow-md'
                        : 'bg-white/60 border-transparent hover:bg-white hover:border-[rgba(42,36,32,0.1)]'
                    }`}
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    <div className="font-mono font-bold text-sm">{format.label}</div>
                    <div className="font-mono text-xs text-[var(--color-text-muted)] mt-1">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div>
              <label className="label-brutal">API 地址</label>
              <input
                type="url"
                className="input-brutal"
                placeholder="https://api.example.com"
                value={localConfig.endpoint}
                onChange={(e) => updateConfig('endpoint', e.target.value)}
              />
            </div>

            {/* API Key */}
            <div>
              <label className="label-brutal">API 密钥</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="input-brutal pr-24"
                  placeholder="sk-..."
                  value={localConfig.apiKey}
                  onChange={(e) => updateConfig('apiKey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showApiKey ? '隐藏' : '显示'}
                </button>
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="label-brutal">图片生成模型</label>
              {availableModels.length > 0 ? (
                <select
                  className="select-brutal"
                  value={useCustomModel ? 'custom' : localConfig.model}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setUseCustomModel(true);
                    } else {
                      setUseCustomModel(false);
                      updateConfig('model', e.target.value);
                    }
                  }}
                >
                  <option value="">选择模型...</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">自定义模型...</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input-brutal"
                  placeholder="nano-banana-pro"
                  value={localConfig.model}
                  onChange={(e) => updateConfig('model', e.target.value)}
                />
              )}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 border-2 flex items-center gap-3 animate-fade-in ${
                testResult === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
              style={{ borderRadius: 'var(--radius-md)' }}
              >
                <span className="text-lg">{testResult === 'success' ? '✓' : '✕'}</span>
                <span className="font-mono text-sm">
                  {testResult === 'success' ? '连接成功！配置已保存' : '连接失败，请检查地址和密钥'}
                </span>
              </div>
            )}

            {/* Test Button */}
            <button
              type="submit"
              disabled={isTesting || !localConfig.endpoint || !localConfig.apiKey}
              className={`btn-brutal btn-brutal--primary w-full ${isTesting ? 'animate-pulse' : ''}`}
            >
              {isTesting ? '测试中...' : '测试并保存'}
            </button>
          </div>
        ) : (
          /* === AI 助手 API 配置 === */
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-banana-medium)] to-[var(--color-banana-dark)] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h2 className="font-display text-lg uppercase tracking-wider">
                  AI 助手 API
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] font-mono">
                  用于优化提示词的对话 AI
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-banana-light)]/20 p-4 border border-[var(--color-banana-medium)]/30"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              💡 提示：AI 助手使用聊天补全 API 来优化你的提示词。你可以使用与图片生成相同的 API，或配置一个独立的聊天模型（如 GPT、Claude 等）来获得更好的优化效果。
            </p>

            {/* Same as Image API */}
            <div className="flex items-center gap-3 p-4 bg-white/60 border border-[rgba(42,36,32,0.08)]"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <input
                type="checkbox"
                id="sameApi"
                checked={localAiConfig.endpoint === localConfig.endpoint && localAiConfig.apiKey === localConfig.apiKey}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLocalAiConfig({
                      endpoint: localConfig.endpoint,
                      apiKey: localConfig.apiKey,
                      model: '',
                    });
                  }
                }}
                className="w-4 h-4 accent-[var(--color-accent-highlight)]"
              />
              <label htmlFor="sameApi" className="text-sm font-mono cursor-pointer">
                使用与图片生成相同的 API
              </label>
            </div>

            {/* Endpoint */}
            <div>
              <label className="label-brutal">API 地址</label>
              <input
                type="url"
                className="input-brutal"
                placeholder="https://api.openai.com"
                value={localAiConfig.endpoint}
                onChange={(e) => updateAiConfig('endpoint', e.target.value)}
              />
            </div>

            {/* API Key */}
            <div>
              <label className="label-brutal">API 密钥</label>
              <div className="relative">
                <input
                  type={showAiApiKey ? 'text' : 'password'}
                  className="input-brutal pr-24"
                  placeholder="sk-..."
                  value={localAiConfig.apiKey}
                  onChange={(e) => updateAiConfig('apiKey', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowAiApiKey(!showAiApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showAiApiKey ? '隐藏' : '显示'}
                </button>
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="label-brutal">聊天模型</label>
              {aiAvailableModels.length > 0 ? (
                <select
                  className="select-brutal"
                  value={aiUseCustomModel ? 'custom' : localAiConfig.model}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setAiUseCustomModel(true);
                    } else {
                      setAiUseCustomModel(false);
                      updateAiConfig('model', e.target.value);
                    }
                  }}
                >
                  <option value="">选择模型...</option>
                  {aiAvailableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">自定义模型...</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="input-brutal"
                  placeholder="gpt-3.5-turbo / gpt-4 / claude-3-sonnet"
                  value={localAiConfig.model}
                  onChange={(e) => updateAiConfig('model', e.target.value)}
                />
              )}
              <p className="text-xs text-[var(--color-text-muted)] mt-2 font-mono">
                推荐使用 GPT-4 或 Claude 系列模型以获得最佳优化效果
              </p>
            </div>

            {/* AI Test Result */}
            {aiTestResult && (
              <div className={`p-4 border-2 flex items-center gap-3 animate-fade-in ${
                aiTestResult === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
              style={{ borderRadius: 'var(--radius-md)' }}
              >
                <span className="text-lg">{aiTestResult === 'success' ? '✓' : '✕'}</span>
                <span className="font-mono text-sm">
                  {aiTestResult === 'success' 
                    ? `连接成功！可用模型: ${aiAvailableModels.length} 个` 
                    : '连接失败，请检查地址和密钥'}
                </span>
              </div>
            )}

            {/* Test Button */}
            <button
              type="submit"
              disabled={isAiTesting || !localAiConfig.endpoint || !localAiConfig.apiKey}
              className={`btn-brutal btn-brutal--primary w-full ${isAiTesting ? 'animate-pulse' : ''}`}
            >
              {isAiTesting ? '测试中...' : '测试并保存'}
            </button>

            {localAiConfig.endpoint && localAiConfig.apiKey && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono text-sm text-green-700">AI 助手已配置</span>
                {localAiConfig.model && (
                  <span className="font-mono text-xs text-green-600">
                    · {localAiConfig.model}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
