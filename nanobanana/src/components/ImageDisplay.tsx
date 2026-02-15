'use client';

import { useState, useEffect } from 'react';
import type { GeneratedImage } from '@/app/page';
import { 
  getAllImages, 
  deleteImage, 
  toggleFavorite, 
  clearAllImages,
  type StoredImage 
} from '@/lib/imageStorage';
import { Icons } from './Icons';

interface ImageDisplayProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  generationProgress?: number;
  onImagesChange?: (images: GeneratedImage[]) => void;
}

type DisplayImage = GeneratedImage | StoredImage;

export default function ImageDisplay({ 
  images, 
  isGenerating, 
  generationProgress = 0,
  onImagesChange 
}: ImageDisplayProps) {
  const [selectedImage, setSelectedImage] = useState<DisplayImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getAllImages();
      setStoredImages(history);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const downloadImage = async (image: DisplayImage) => {
    try {
      const url = image.url;
      
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `nanobanana-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `nanobanana-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(image.url, '_blank');
    }
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await deleteImage(id);
      setStoredImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      setStoredImages(prev => prev.map(img => 
        img.id === id ? { ...img, favorite: !img.favorite } : img
      ));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
      await clearAllImages();
      setStoredImages([]);
    }
  };

  // 合并当前会话图片和历史记录
  const allImages = [...images, ...storedImages.filter(
    stored => !images.some(img => img.url === stored.url)
  )];

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-[rgba(42,36,32,0.08)] px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-[var(--color-accent-highlight)]">
                {Icons.image}
              </div>
              <span className="font-display text-sm uppercase tracking-wider text-[var(--color-text-primary)]">
                {showHistory ? '历史记录' : '生成结果'}
              </span>
            </div>
            <span className="font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-full">
              {showHistory ? storedImages.length : images.length} 张
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle History */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                showHistory
                  ? 'bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] text-white shadow-md'
                  : 'bg-white/60 text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)] border border-[rgba(42,36,32,0.08)]'
              }`}
            >
              <div className="w-4 h-4">{Icons.history}</div>
              {showHistory ? '当前会话' : '历史记录'}
            </button>

            {selectedImage && (
              <>
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/60 hover:bg-white rounded-xl transition-all duration-300 border border-[rgba(42,36,32,0.08)]"
                >
                  <div className="w-4 h-4">{Icons.download}</div>
                  下载
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2.5 text-sm font-medium bg-white/60 hover:bg-white rounded-xl transition-all duration-300 border border-[rgba(42,36,32,0.08)]"
                >
                  <div className="w-4 h-4">{Icons.close}</div>
                </button>
              </>
            )}

            {showHistory && storedImages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-300"
              >
                <div className="w-4 h-4">{Icons.trash}</div>
                清空
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-br from-[var(--color-bg-primary)] via-white/50 to-[var(--color-bg-secondary)]">
        {/* Empty State */}
        {allImages.length === 0 && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 animate-fade-in">
            <div className="text-center max-w-lg">
              <div className="relative inline-block mb-10">
                <div className="absolute -inset-10 bg-gradient-to-br from-[var(--color-banana-light)] to-transparent rounded-full opacity-40 blur-3xl animate-pulse" />
                <span className="relative text-9xl animate-float drop-shadow-2xl">🍌</span>
              </div>

              <h3 className="font-display text-3xl uppercase tracking-wider mb-5 text-[var(--color-text-primary)]">
                准备创作
              </h3>
              
              <div className="space-y-4 text-[var(--color-text-secondary)] font-mono text-sm bg-white/60 backdrop-blur-sm p-8 rounded-2xl">
                <p className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">1</span>
                  配置你的 API 端点
                </p>
                <p className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">2</span>
                  输入创意提示词
                </p>
                <p className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">3</span>
                  选择比例和分辨率
                </p>
                <p className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gradient-to-br from-[var(--color-accent-highlight)] to-[#ff8a5c] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">4</span>
                  点击生成 🍌
                </p>
              </div>

              <div className="mt-12 flex justify-center gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 bg-gradient-to-br from-[var(--color-banana-light)] to-[var(--color-banana-medium)] rounded-full animate-float shadow-sm"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generating State with Progress */}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-10 animate-fade-in">
            <div className="text-center px-10">
              {/* Animated banana */}
              <div className="relative inline-block mb-8">
                <div className="absolute -inset-16 bg-gradient-to-br from-[var(--color-banana-light)] via-[var(--color-accent-highlight)] to-[var(--color-coral)] rounded-full opacity-30 blur-3xl animate-pulse" />
                <div className="relative">
                  <span className="text-8xl animate-spin inline-block drop-shadow-2xl" style={{ animationDuration: '3s' }}>
                    🍌
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-80 mx-auto mb-6">
                <div className="h-3 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-banana-medium)] via-[var(--color-accent-highlight)] to-[var(--color-coral)] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(generationProgress, 95)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm font-mono">
                  <span className="text-[var(--color-text-muted)]">生成中...</span>
                  <span className="text-[var(--color-accent-highlight)] font-bold">
                    {Math.round(generationProgress)}%
                  </span>
                </div>
              </div>

              <p className="font-display text-xl uppercase tracking-wider text-[var(--color-text-primary)] mb-3">
                正在创作
              </p>
              <p className="text-sm text-[var(--color-text-muted)] font-mono">
                请稍候，AI 正在为你绘制作品...
              </p>
            </div>
          </div>
        )}

        {/* Loading History */}
        {showHistory && isLoadingHistory && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--color-banana-medium)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[var(--color-text-muted)] font-mono">加载历史记录...</p>
            </div>
          </div>
        )}

        {/* Image Grid */}
        {allImages.length > 0 && !selectedImage && (
          <div className="h-full overflow-y-auto p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(showHistory ? storedImages : images).map((image, index) => {
                const isStored = 'id' in image;
                const imageId = isStored ? (image as StoredImage).id : `session-${index}`;
                
                return (
                  <div
                    key={imageId}
                    className="group relative overflow-hidden cursor-pointer animate-fade-scale"
                    style={{ 
                      animationDelay: `${index * 0.06}s`,
                      borderRadius: 'var(--radius-xl)'
                    }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div 
                      className="aspect-square bg-[var(--color-bg-tertiary)] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                      style={{ borderRadius: 'var(--radius-xl)' }}
                    >
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                      />
                    </div>

                    {/* Favorite indicator */}
                    {isStored && (image as StoredImage).favorite && (
                      <div className="absolute top-4 left-4 w-8 h-8 bg-[var(--color-accent-highlight)] text-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4">{Icons.star}</div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"
                      style={{ borderRadius: 'var(--radius-xl)' }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-white text-sm font-mono line-clamp-2 mb-3">
                          {image.prompt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                          <span className="bg-white/20 px-2.5 py-1 rounded-full">{image.params.aspectRatio}</span>
                          <span className="bg-white/20 px-2.5 py-1 rounded-full">{image.params.resolution}px</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {isStored && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite((image as StoredImage).id);
                            }}
                            className="w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all duration-300"
                          >
                            <div className="w-4 h-4">
                              {(image as StoredImage).favorite ? Icons.star : Icons.starOutline}
                            </div>
                          </button>
                        )}
                        {isStored && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage((image as StoredImage).id);
                            }}
                            className="w-9 h-9 bg-red-500/60 backdrop-blur-sm hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all duration-300"
                          >
                            <div className="w-4 h-4">{Icons.trash}</div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Index badge */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-sm text-white font-mono text-sm flex items-center justify-center rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Image Detail View */}
        {selectedImage && (
          <div className="h-full flex flex-col lg:flex-row animate-fade-in">
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-bg-tertiary)]/50 overflow-hidden">
              <div 
                className="relative max-w-full max-h-full transition-transform duration-500 ease-out"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-[calc(100vh-280px)] object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>

            <div className="w-full lg:w-96 bg-white/90 backdrop-blur-sm p-8 overflow-y-auto border-t lg:border-t-0 lg:border-l border-[rgba(42,36,32,0.08)]">
              <h3 className="font-display text-lg uppercase tracking-wider mb-6 text-[var(--color-text-primary)] flex items-center gap-3">
                <div className="w-5 h-5 text-[var(--color-accent-highlight)]">
                  {Icons.image}
                </div>
                图像详情
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="label-brutal">提示词</label>
                  <p className="font-mono text-sm bg-white p-5 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                    {selectedImage.prompt}
                  </p>
                </div>

                {'negativePrompt' in selectedImage.params && selectedImage.params.negativePrompt && (
                  <div>
                    <label className="label-brutal">负向提示词</label>
                    <p className="font-mono text-sm bg-white p-5 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                      {selectedImage.params.negativePrompt}
                    </p>
                  </div>
                )}

                <div>
                  <label className="label-brutal">参数</label>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-white p-4 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                      <span className="text-[var(--color-text-muted)]">比例</span>
                      <div className="font-bold text-lg mt-1">{selectedImage.params.aspectRatio}</div>
                    </div>
                    <div className="bg-white p-4 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                      <span className="text-[var(--color-text-muted)]">分辨率</span>
                      <div className="font-bold text-lg mt-1">{selectedImage.params.resolution}px</div>
                    </div>
                    <div className="bg-white p-4 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                      <span className="text-[var(--color-text-muted)]">模型</span>
                      <div className="font-bold mt-1 truncate" title={selectedImage.params.model}>
                        {selectedImage.params.model || '默认'}
                      </div>
                    </div>
                    <div className="bg-white p-4 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                      <span className="text-[var(--color-text-muted)]">步数</span>
                      <div className="font-bold text-lg mt-1">{selectedImage.params.steps}</div>
                    </div>
                    {selectedImage.params.seed !== null && (
                      <div className="col-span-2 bg-gradient-to-r from-[var(--color-banana-light)]/30 to-white p-4 border border-[rgba(42,36,32,0.1)] rounded-xl shadow-sm">
                        <span className="text-[var(--color-text-muted)]">种子</span>
                        <div className="font-bold mt-1">{selectedImage.params.seed}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label-brutal">生成时间</label>
                  <p className="font-mono text-sm text-[var(--color-text-muted)]">
                    {new Date(selectedImage.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>

                <div>
                  <label className="label-brutal">缩放</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                      className="flex-1 py-3 text-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <div className="w-5 h-5">{Icons.minus}</div>
                    </button>
                    <span className="flex-1 flex items-center justify-center bg-white border border-[rgba(42,36,32,0.1)] rounded-xl font-mono shadow-sm text-sm">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                      className="flex-1 py-3 text-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-all duration-300 flex items-center justify-center"
                    >
                      <div className="w-5 h-5">{Icons.plus}</div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-3">
                  <button
                    onClick={() => downloadImage(selectedImage)}
                    className="btn-brutal btn-brutal--primary w-full py-4 flex items-center justify-center gap-3"
                  >
                    <div className="w-5 h-5">{Icons.download}</div>
                    下载图片
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyPrompt(selectedImage.prompt)}
                      className="btn-brutal btn-brutal--secondary flex-1 py-3 flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4">{copyStatus === 'copied' ? Icons.check : Icons.copy}</div>
                      {copyStatus === 'copied' ? '已复制' : '提示词'}
                    </button>
                    <button
                      onClick={() => copyPrompt(selectedImage.url)}
                      className="btn-brutal btn-brutal--secondary flex-1 py-3 flex items-center justify-center gap-2"
                      title="复制图片链接或Base64"
                    >
                      <div className="w-4 h-4">{Icons.link}</div>
                      链接
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
