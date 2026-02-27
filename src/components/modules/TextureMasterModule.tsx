import React from 'react';
import { Zap, Download } from 'lucide-react';
import { ModuleLayout } from '../ModuleLayout';
import { useAppState } from '../../context/AppStateContext';

const TEXTURES = [
  { name: 'Linen', img: 'https://picsum.photos/seed/linen/200/200' },
  { name: 'Concrete', img: 'https://picsum.photos/seed/concrete/200/200' },
  { name: 'Metal', img: 'https://picsum.photos/seed/metal/200/200' },
  { name: 'Oak', img: 'https://picsum.photos/seed/oak/200/200' },
];

interface TextureMasterModuleProps {
  onBack: () => void;
}

export function TextureMasterModule({ onBack }: TextureMasterModuleProps) {
  const { appState, startProcessing, setSuccess, setError } = useAppState();

  const handleGenerate = async () => {
    const preview = appState.previewImage;
    if (!preview) return;
    startProcessing();
    try {
      await new Promise((r) => setTimeout(r, 1800));
      setSuccess(preview);
    } catch {
      setError('纹理增强失败，请重试');
    }
  };

  return (
    <ModuleLayout
      title="Texture Master"
      subtitle="AI-driven micro-detail enhancement and texture recognition."
      onBack={onBack}
      canvasAspectRatio="1/1"
      uploadHint="上传材质/纹理图"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Texture Library
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {TEXTURES.map((t, i) => (
            <div key={t.name} className="flex flex-col items-center gap-2">
              <div
                className={`w-full aspect-square rounded-2xl overflow-hidden ${
                  i === 0 ? 'border-2 border-orange-600 p-0.5' : ''
                }`}
              >
                <img
                  src={t.img}
                  className="w-full h-full object-cover rounded-xl"
                  alt={t.name}
                />
              </div>
              <span
                className={`text-[10px] font-bold ${
                  i === 0 ? 'text-orange-600' : 'text-slate-400'
                }`}
              >
                {t.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!appState.previewImage || appState.status === 'processing'}
          className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Zap size={20} />
          <span>Enhance Texture</span>
        </button>
        <button
          type="button"
          className="w-14 h-14 flex items-center justify-center text-slate-800 rounded-2xl bg-white border border-slate-100"
        >
          <Download size={24} />
        </button>
      </div>
    </ModuleLayout>
  );
}
