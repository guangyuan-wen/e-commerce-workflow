import React from 'react';
import { Plus, Zap, Download, Check } from 'lucide-react';
import { ModuleLayout } from '../ModuleLayout';
import { useAppState } from '../../context/AppStateContext';

const SCENARIOS = [
  { name: 'Manhattan', img: 'https://picsum.photos/seed/nyc/200/200' },
  { name: 'Euro Street', img: 'https://picsum.photos/seed/euro/200/200' },
  { name: 'Beach Sunset', img: 'https://picsum.photos/seed/beach/200/200' },
  { name: 'Studio Loft', img: 'https://picsum.photos/seed/loft/200/200' },
];

interface ScenarioEngineModuleProps {
  onBack: () => void;
}

export function ScenarioEngineModule({ onBack }: ScenarioEngineModuleProps) {
  const { appState, startProcessing, setSuccess, setError } = useAppState();

  const handleGenerate = async () => {
    if (!appState.previewImage) return;
    startProcessing();
    try {
      await new Promise((r) => setTimeout(r, 2200));
      setSuccess('https://picsum.photos/seed/scenarioresult/400/500');
    } catch {
      setError('场景生成失败，请重试');
    }
  };

  return (
    <ModuleLayout
      title="Scenario Engine"
      subtitle="Create professional product environments with AI-powered scene generation."
      onBack={onBack}
      canvasAspectRatio="4/5"
      uploadHint="Upload Product Image"
    >
      {appState.status === 'success' && appState.resultImage && (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-xl border-2 border-orange-600 p-0.5 overflow-hidden">
              <img
                src={appState.resultImage}
                className="w-full h-full object-cover rounded-lg"
                alt="Result"
              />
            </div>
            <div className="absolute -top-1 -right-1 bg-orange-600 text-white rounded-full p-0.5">
              <Check size={10} />
            </div>
          </div>
          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden opacity-50 flex-shrink-0">
            <img
              src="https://picsum.photos/seed/res2/100/100"
              className="w-full h-full object-cover"
              alt="Result"
            />
          </div>
          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden opacity-50 flex-shrink-0">
            <img
              src="https://picsum.photos/seed/res3/100/100"
              className="w-full h-full object-cover"
              alt="Result"
            />
          </div>
          <button
            type="button"
            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Scenario Gallery
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {SCENARIOS.map((s, i) => (
            <div
              key={s.name}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div
                className={`w-16 h-16 rounded-2xl overflow-hidden ${
                  i === 0 ? 'border-2 border-orange-600 p-0.5' : 'grayscale'
                }`}
              >
                <img
                  src={s.img}
                  className="w-full h-full object-cover rounded-xl"
                  alt={s.name}
                />
              </div>
              <span
                className={`text-[10px] font-bold ${
                  i === 0 ? 'text-orange-600' : 'text-slate-400'
                }`}
              >
                {s.name}
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
          <span>Generate Scene</span>
        </button>
        <button
          type="button"
          className="w-14 h-14 flex items-center justify-center text-slate-800 rounded-2xl border border-slate-100"
        >
          <Download size={24} />
        </button>
      </div>
    </ModuleLayout>
  );
}
