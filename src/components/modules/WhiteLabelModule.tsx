import React, { useState } from 'react';
import { Zap, Download } from 'lucide-react';
import { ModuleLayout } from '../ModuleLayout';
import { useAppState } from '../../context/AppStateContext';
import { getWhiteLabelProcessUrl, getSupabaseConfig } from '../../lib/supabase';

const STYLES = [
  { id: 'TRANSPARENT', label: 'TRANSPARENT' },
  { id: 'PURE_WHITE', label: 'PURE WHITE' },
  { id: 'STUDIO_GREY', label: 'STUDIO GREY' },
  { id: 'DARK_MODE', label: 'DARK MODE' },
] as const;

interface WhiteLabelModuleProps {
  onBack: () => void;
}

export function WhiteLabelModule({ onBack }: WhiteLabelModuleProps) {
  const { appState, startProcessing, setSuccess, setError } = useAppState();
  const [shadowIntensity, setShadowIntensity] = useState(50);
  const [selectedStyle, setSelectedStyle] = useState<string>('PURE_WHITE');

  const handleGenerate = async () => {
    const file = appState.uploadedFile;
    const preview = appState.previewImage;
    if (!file && !preview) return;

    const fnUrl = getWhiteLabelProcessUrl();
    const { anonKey } = getSupabaseConfig();
    if (!fnUrl || !anonKey) {
      setError('请配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
      return;
    }

    startProcessing();
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file, file.name || 'image.jpg');
      } else if (preview) {
        const res = await fetch(preview);
        const blob = await res.blob();
        formData.append('image', new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' }));
      }
      formData.append('shadowIntensity', String(shadowIntensity));
      formData.append('backgroundStyle', selectedStyle);

      const response = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData?.error || errData?.details || `请求失败 (${response.status})`;
        throw new Error(msg);
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setSuccess(resultUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Amazon 主图生成失败，请重试');
    }
  };

  const handleDownload = () => {
    const url = appState.resultImage;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `white-label-${Date.now()}.png`;
    a.click();
  };

  const leftSlot = (
    <div className="space-y-6 py-2">
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          阴影强度
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={shadowIntensity}
          onChange={(e) => setShadowIntensity(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <span className="text-xs text-slate-400 mt-1 block">
          {shadowIntensity < 50 ? 'soft' : 'hard'}
        </span>
      </div>
    </div>
  );

  return (
    <ModuleLayout
      title="White-Label Hub"
      subtitle="Amazon Main Image：1:1 纯白底、商品居中、光影补全"
      onBack={onBack}
      canvasAspectRatio="1/1"
      uploadHint="PNG、JPG，最大 10MB"
      leftSlot={leftSlot}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Style Selection
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {STYLES.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className="flex flex-col items-center gap-2 text-left"
              >
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? 'border-2 border-blue-600 ring-2 ring-blue-200' : 'border-2 border-slate-200 hover:border-slate-300'
                  }`}
                  style={
                    style.id === 'TRANSPARENT'
                      ? { backgroundImage: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0', backgroundColor: '#f5f5f5' }
                      : style.id === 'PURE_WHITE'
                        ? { backgroundColor: '#FFFFFF' }
                        : style.id === 'STUDIO_GREY'
                          ? { backgroundColor: '#E5E5E5' }
                          : { backgroundColor: '#1A1A1A' }
                  }
                >
                  {style.id === 'TRANSPARENT' && (
                    <div className="w-8 h-8 bg-white/60 rounded-md border border-slate-300" />
                  )}
                </div>
                <span
                  className={`text-[8px] font-bold text-center ${
                    isSelected ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {style.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={(!appState.previewImage && !appState.uploadedFile) || appState.status === 'processing'}
          className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Zap size={20} />
          <span>Generate Amazon Main Image</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={appState.status !== 'success' || !appState.resultImage}
          className="w-14 h-14 flex items-center justify-center text-slate-800 rounded-2xl border border-slate-100 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50"
        >
          <Download size={24} />
        </button>
      </div>
    </ModuleLayout>
  );
}
