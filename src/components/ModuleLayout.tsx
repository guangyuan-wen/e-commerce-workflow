import React from 'react';
import { ModuleHeader } from './ModuleHeader';
import { CanvasContainer } from './CanvasContainer';

interface ModuleLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  /** 画布宽高比 */
  canvasAspectRatio?: string;
  uploadHint?: string;
  /** 画布左侧内容（如参数滑块），桌面端并排、移动端堆叠 */
  leftSlot?: React.ReactNode;
  /** 画布下方：结果缩略图、图库、样式选择等 */
  children: React.ReactNode;
}

/**
 * 功能模块统一布局：顶部 ModuleHeader + 中间 CanvasContainer（可选左侧内容）+ 下方模块专属内容
 */
export function ModuleLayout({
  title,
  subtitle,
  onBack,
  canvasAspectRatio = '4/5',
  uploadHint = 'PNG、JPG，最大 10MB',
  leftSlot,
  children,
}: ModuleLayoutProps) {
  return (
    <div className="pb-32 min-h-screen bg-white">
      <ModuleHeader title={title} subtitle={subtitle} onBack={onBack} />
      <main className="px-6">
        <div
          className={`mb-8 ${leftSlot ? 'flex flex-col md:flex-row gap-4 md:gap-6' : ''}`}
        >
          {leftSlot && (
            <div className="flex-shrink-0 md:w-36 md:order-first">
              {leftSlot}
            </div>
          )}
          <div className={leftSlot ? 'flex-1 min-w-0' : ''}>
            <CanvasContainer
              aspectRatio={canvasAspectRatio}
              uploadHint={uploadHint}
              showAiBadge
            />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
