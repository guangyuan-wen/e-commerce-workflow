import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

export function ModuleHeader({ title, subtitle, onBack }: ModuleHeaderProps) {
  return (
    <header className="px-6 py-6 flex justify-between items-center">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft size={24} className="text-slate-700" />
      </button>
      <div className="text-center flex-1 px-4">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{subtitle}</p>
      </div>
      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
      >
        <Share2 size={24} className="text-slate-700" />
      </button>
    </header>
  );
}
