'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  optimizedPrompt?: string;
  chineseTranslation?: string;
  description?: string;
  timestamp: number;
}

interface PromptOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (prompt: string) => void;
  apiEndpoint: string;
  apiKey: string;
  apiModel: string;
}

const SYSTEM_PROMPT = `你是一个专业的AI图像生成提示词优化专家。当用户提供提示词时，你需要：

1. 优化提示词：改进提示词结构，添加艺术风格、光照、氛围、构图等细节，翻译为英文（因为大多数图像生成模型对英文支持更好）
2. 提供中文翻译：将优化后的提示词翻译回中文，方便用户理解
3. 自然语言描述：用1-2句话描述优化后的提示词想要创作的画面意境和风格

请严格按照以下JSON格式输出，不要添加任何其他文字：
{
  "optimizedPrompt": "优化后的英文提示词",
  "chineseTranslation": "优化后提示词的中文翻译",
  "description": "画面描述，如：一幅充满梦幻色彩的水墨画，意境悠远..."
}

注意：
- 优化后的提示词要简洁有力，避免过度堆砌
- 英文提示词用于实际生成，中文翻译用于展示
- 描述要简洁有画面感`;

// 打字机效果 Hook
function useTypewriter(text: string, speed: number = 25, startTyping: boolean = true) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!startTyping || !text) {
      setDisplayText(text);
      return;
    }

    setIsTyping(true);
    setDisplayText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, startTyping]);

  return { displayText, isTyping };
}

// SVG 图标组件
const Icons = {
  robot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" />
      <path d="M12 2v4M8 4h8" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  translate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3M22 22l-5-10-5 10M14 18h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  ),
  send: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// 单个消息气泡组件
function MessageBubble({ message, onApply, index }: { 
  message: Message; 
  onApply: (text: string) => void;
  index: number;
}) {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  
  // 打字机效果
  const { displayText, isTyping } = useTypewriter(
    message.content, 
    12, 
    !isUser && index > 0
  );

  useEffect(() => {
    if (!isTyping && !isUser) {
      const timer = setTimeout(() => setShowActions(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isTyping, isUser]);

  // 解析 JSON 格式的优化结果
  const parseOptimizedContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return {
        optimizedPrompt: parsed.optimizedPrompt || content,
        chineseTranslation: parsed.chineseTranslation || '',
        description: parsed.description || '',
      };
    } catch {
      return {
        optimizedPrompt: content,
        chineseTranslation: '',
        description: '',
      };
    }
  };

  const optimized = !isUser && index > 0 ? parseOptimizedContent(displayText) : null;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
      style={{ 
        animation: `messageSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        animationDelay: `${index * 0.08}s`,
        opacity: 0,
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-5">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-banana-medium)] to-[var(--color-banana-dark)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-banana-medium)]/30">
            <span className="text-white">{Icons.robot}</span>
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        {/* Main Bubble */}
        <div
          className={`relative px-6 py-5 font-mono text-[15px] leading-relaxed whitespace-pre-wrap transition-all duration-500 ${
            isUser
              ? 'bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] text-white rounded-3xl rounded-tr-lg shadow-lg shadow-[var(--color-accent-highlight)]/25'
              : 'bg-white text-[var(--color-text-primary)] rounded-3xl rounded-tl-lg shadow-xl border border-[rgba(42,36,32,0.06)]'
          }`}
        >
          {/* User message */}
          {isUser ? message.content : (
            <>
              {/* Optimized prompt */}
              {optimized && optimized.optimizedPrompt && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-accent-highlight)] mb-2 font-semibold uppercase tracking-wider">
                    {Icons.sparkle}
                    <span>优化提示词</span>
                  </div>
                  <div className="text-[var(--color-text-primary)]">
                    {optimized.optimizedPrompt}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-5 bg-[var(--color-accent-highlight)] ml-1 animate-pulse rounded-sm" />
                    )}
                  </div>
                </div>
              )}

              {/* Chinese Translation */}
              {optimized && optimized.chineseTranslation && !isTyping && (
                <div className="mb-4 p-4 bg-[var(--color-bg-secondary)]/50 rounded-xl border-l-3 border-[var(--color-banana-medium)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mb-2 font-semibold uppercase tracking-wider">
                    {Icons.translate}
                    <span>中文释义</span>
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    {optimized.chineseTranslation}
                  </div>
                </div>
              )}

              {/* Description */}
              {optimized && optimized.description && !isTyping && (
                <div className="p-4 bg-gradient-to-r from-[var(--color-banana-light)]/20 to-transparent rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2 font-semibold uppercase tracking-wider">
                    {Icons.image}
                    <span>画面描述</span>
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm italic">
                    {optimized.description}
                  </div>
                </div>
              )}

              {/* Fallback for non-JSON responses */}
              {!optimized && (
                <>
                  {displayText}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-5 bg-[var(--color-accent-highlight)] ml-1 animate-pulse rounded-sm" />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-[var(--color-text-muted)] mt-3 ${isUser ? 'text-right mr-3' : 'ml-3'}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Apply Button */}
        {!isUser && showActions && index > 0 && optimized?.optimizedPrompt && (
          <button
            onClick={() => onApply(optimized.optimizedPrompt)}
            className="mt-4 ml-3 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-accent-highlight)] to-[#ff8a5c] rounded-xl hover:shadow-lg hover:shadow-[var(--color-accent-highlight)]/30 transition-all duration-300 flex items-center gap-2"
          >
            {Icons.sparkle}
            <span>应用此提示词</span>
          </button>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-5">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-coral-light)] to-[var(--color-coral)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-coral)]/30">
            <span className="text-white">{Icons.user}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromptOptimizer({
  isOpen,
  onClose,
  onApplyPrompt,
  apiEndpoint,
  apiKey,
  apiModel,
}: PromptOptimizerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是提示词优化助手 🎨\n\n告诉我你想生成什么样的图片，我会帮你：\n\n• 优化提示词结构\n• 添加艺术风格和细节\n• 翻译为适合AI理解的英文\n• 提供画面描述\n\n例如输入："一只猫"或"山水画"',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const userMsg: Message = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: apiEndpoint,
          apiKey: apiKey,
          type: 'chat',
          payload: {
            model: apiModel || 'gpt-3.5-turbo',
            stream: false,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...messages.slice(1).map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content: userMessage },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      const assistantContent = data.choices?.[0]?.message?.content || '抱歉，我无法处理这个请求。';
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantContent,
        timestamp: Date.now(),
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: JSON.stringify({
          optimizedPrompt: '',
          chineseTranslation: '',
          description: `❌ 错误: ${err instanceof Error ? err.message : '请求失败'}\n\n请检查 API 配置是否正确。`
        }),
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, apiEndpoint, apiKey, apiModel, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const applyPrompt = (text: string) => {
    onApplyPrompt(text);
    onClose();
  };

  const clearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: JSON.stringify({
          optimizedPrompt: '',
          chineseTranslation: '',
          description: '对话已清空 ✨\n\n继续告诉我你想生成什么图片吧！'
        }),
        timestamp: Date.now(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-8 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-[var(--color-banana-dark)]/20 backdrop-blur-md" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl h-[88vh] flex flex-col bg-gradient-to-b from-white via-white to-[var(--color-bg-primary)] shadow-2xl animate-scale-in overflow-hidden"
        style={{ borderRadius: 'var(--radius-xl)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-10 py-7 bg-gradient-to-r from-[var(--color-banana-light)]/60 via-white to-[var(--color-banana-light)]/40 border-b border-[rgba(42,36,32,0.06)]">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-[var(--color-banana-medium)]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[var(--color-accent-highlight)]/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--color-banana-medium)] to-[var(--color-accent-highlight)] rounded-2xl blur opacity-40 animate-pulse" />
                <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-[var(--color-banana-dark)]">{Icons.robot}</span>
                </div>
              </div>
              <div>
                <h2 className="font-display text-2xl uppercase tracking-wide text-[var(--color-text-primary)]">
                  AI 提示词优化
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] font-mono mt-1">
                  智能优化 · 中英双语 · 画面描述
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={clearHistory}
                className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-white/60 hover:bg-white rounded-xl transition-all duration-300 shadow-sm"
              >
                清空对话
              </button>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white rounded-xl transition-all duration-300 shadow-sm"
              >
                {Icons.close}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-text-primary) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />

          {messages.map((msg, i) => (
            <MessageBubble 
              key={msg.timestamp} 
              message={msg} 
              onApply={applyPrompt}
              index={i}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start mb-8 animate-fade-in">
              <div className="flex-shrink-0 mr-5">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-banana-medium)] to-[var(--color-banana-dark)] rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white">{Icons.robot}</span>
                </div>
              </div>
              <div className="bg-white px-6 py-5 rounded-3xl rounded-tl-lg shadow-xl border border-[rgba(42,36,32,0.06)]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 bg-[var(--color-banana-medium)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-[var(--color-banana-medium)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-[var(--color-banana-medium)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-[var(--color-text-muted)] font-mono">思考优化中...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-8" />
        </div>

        {/* Input Area */}
        <div className="relative px-10 py-7 bg-white border-t border-[rgba(42,36,32,0.06)]">
          <div className="flex gap-5">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你想生成的图片，例如：一只穿西装的猫..."
                className="w-full px-6 py-5 bg-[var(--color-bg-secondary)]/40 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-highlight)]/30 focus:bg-white transition-all duration-300 font-mono text-[15px]"
                style={{ minHeight: '64px', maxHeight: '150px' }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`px-7 py-5 font-medium rounded-2xl transition-all duration-300 flex items-center gap-3 ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] text-white shadow-lg shadow-[var(--color-accent-highlight)]/25 hover:shadow-xl hover:shadow-[var(--color-accent-highlight)]/30 hover:-translate-y-0.5'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] cursor-not-allowed'
              }`}
            >
              <span>发送</span>
              {Icons.send}
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-4 text-xs text-[var(--color-text-muted)] font-mono gap-5">
            <span>Enter 发送</span>
            <span>·</span>
            <span>Shift+Enter 换行</span>
            <span>·</span>
            <span className={apiEndpoint ? 'text-green-600' : 'text-red-400'}>
              {apiEndpoint ? '✓ API 已配置' : '✕ API 未配置'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
}