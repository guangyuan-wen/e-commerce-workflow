import React, { useState } from 'react';
import { Zap, Download } from 'lucide-react';
import { ModuleLayout } from '../ModuleLayout';
import { useAppState } from '../../context/AppStateContext';
import { getModelAgentProcessUrl, getSupabaseConfig } from '../../lib/supabase';

const MODEL_TAGS = [
  { id: 'US_FEMALE', label: 'US Female' },
  { id: 'JP_FEMALE', label: 'JP Female' },
  { id: 'MIDDLE_EAST_MALE', label: 'Middle East Male' },
  { id: 'EU_FEMALE', label: 'EU Female' },
  { id: 'ASIAN_MALE', label: 'Asian Male' },
] as const;

const GARMENT_CATEGORIES = [
  { id: 'upper_body', label: '上衣' },
  { id: 'lower_body', label: '裤子' },
  { id: 'dresses', label: '连衣裙' },
] as const;

interface ModelAgentModuleProps {
  onBack: () => void;
}

export function ModelAgentModule({ onBack }: ModelAgentModuleProps) {
  const { appState, startProcessing, setSuccess, setError } = useAppState();
  const [selectedModel, setSelectedModel] = useState<string>('US_FEMALE');
  const [selectedGarment, setSelectedGarment] = useState<string>('upper_body');

  const handleGenerate = async () => {
    const file = appState.uploadedFile;
    const preview = appState.previewImage;
    if (!file && !preview) return;

    const fnUrl = getModelAgentProcessUrl();
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
        formData.append(
          'image',
          new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' })
        );
      }
      formData.append('modelType', selectedModel);
      formData.append('garmentCategory', selectedGarment);

      const response = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${anonKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg =
          errData?.details || errData?.error || `请求失败 (${response.status})`;
        throw new Error(msg);
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setSuccess(resultUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : '模型生成失败，请重试');
    }
  };

  const handleDownload = () => {
    const url = appState.resultImage;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `model-agent-${selectedModel}-${Date.now()}.png`;
    a.click();
  };

  return (
    <ModuleLayout
      title="Global Model Agent"
      subtitle="服装图 → 自动生成模特穿该服装，保留服装细节与版型"
      onBack={onBack}
      canvasAspectRatio="3/4"
      uploadHint="上传服装图（产品图或平铺图），将生成模特穿着该服装的效果"
    >
      {/* 服装类型 */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            服装类型
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {GARMENT_CATEGORIES.map((cat) => {
            const isSelected = selectedGarment === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedGarment(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-700 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 模特类型 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Model Type
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {MODEL_TAGS.map((tag) => {
            const isSelected = selectedModel === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedModel(tag.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {appState.status === 'success' && appState.resultImage && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
          <div className="w-16 h-16 rounded-xl border-2 border-orange-600 p-0.5 overflow-hidden flex-shrink-0">
            <img
              src={appState.resultImage}
              className="w-full h-full object-cover rounded-lg"
              alt="Result"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={
            (!appState.previewImage && !appState.uploadedFile) ||
            appState.status === 'processing'
          }
          className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Zap size={20} />
          <span>Generate Model</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={
            appState.status !== 'success' || !appState.resultImage
          }
          className="w-14 h-14 flex items-center justify-center text-slate-800 rounded-2xl bg-white border border-slate-100 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50"
        >
          <Download size={24} />
        </button>
      </div>
    </ModuleLayout>
  );
}
