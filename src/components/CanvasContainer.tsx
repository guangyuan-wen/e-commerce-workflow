import React, { useRef } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { AppStateStatus } from '../types/appState';

const statusLabels: Record<AppStateStatus, string> = {
  idle: '上传图片',
  processing: 'AI 生成中…',
  success: '生成成功',
  error: '生成失败',
};

interface CanvasContainerProps {
  /** 模块名称，用于上传区副标题 */
  uploadHint?: string;
  /** 画布宽高比，如 '4/5' | '3/4' | '1/1' */
  aspectRatio?: string;
  /** 是否显示 AI 角标 */
  showAiBadge?: boolean;
  /** 成功时是否显示“前后对比”切换（由父组件控制，这里只占位） */
  className?: string;
}

export function CanvasContainer({
  uploadHint = 'PNG、JPG，最大 10MB',
  aspectRatio = '4/5',
  showAiBadge = true,
  className = '',
}: CanvasContainerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { appState, setPreviewImage, setUploadedFile, setStatus, setErrorMessage, reset } = useAppState();
  const { status, previewImage, resultImage, errorMessage } = appState;

  const displayUrl = status === 'success' && resultImage ? resultImage : previewImage;
  const isUploadZoneVisible = status === 'idle' && !previewImage;
  const isProcessing = status === 'processing';
  const isError = status === 'error';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请上传图片文件（PNG、JPG）');
      setStatus('error');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    setUploadedFile(file);
    setStatus('idle');
    setErrorMessage(null);
    e.target.value = '';
  };

  const handleClear = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    if (resultImage && resultImage.startsWith('blob:')) URL.revokeObjectURL(resultImage);
    reset();
  };

  return (
    <div
      className={`relative rounded-[40px] overflow-hidden bg-slate-900 flex flex-col items-center justify-center shadow-xl ${className}`}
      style={{ aspectRatio }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {showAiBadge && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-800">AI</span>
        </div>
      )}

      {/* 待上传：空状态 */}
      {isUploadZoneVisible && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 hover:text-white/70 transition-colors w-full"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={32} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium">{statusLabels.idle}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-80">{uploadHint}</span>
        </button>
      )}

      {/* 有预览 / 结果图 */}
      {displayUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <img
            src={displayUrl}
            alt={status === 'success' ? '生成结果' : '预览'}
            className="max-w-full max-h-full w-full h-full object-contain"
          />
        </div>
      )}

      {/* processing 遮罩 */}
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center gap-4 z-10">
          <Loader2 size={48} className="text-orange-500 animate-spin" />
          <span className="text-sm font-medium text-white/90">{statusLabels.processing}</span>
        </div>
      )}

      {/* error 遮罩 */}
      {isError && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-red-500/90 text-white rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="text-sm flex-1">{errorMessage || statusLabels.error}</span>
        </div>
      )}

      {/* 有图时右上角：清除/重新上传 */}
      {previewImage && status !== 'processing' && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-700 border border-white/20 hover:bg-white"
        >
          重新上传
        </button>
      )}

      {/* 无图时也可点击整块区域上传 */}
      {isUploadZoneVisible && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => inputRef.current?.click()}
          aria-hidden
        />
      )}
    </div>
  );
}
