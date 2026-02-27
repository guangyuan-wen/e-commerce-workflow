/**
 * 全局应用状态机：所有功能模块（White-Label、Model Agent、Scenario、Texture）共用
 */
export type AppStateStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AppState {
  status: AppStateStatus;
  /** 用户上传的预览图 URL (object URL) */
  previewImage: string | null;
  /** 用户上传的原始文件（用于 API 调用） */
  uploadedFile: File | null;
  /** AI 生成结果图 URL */
  resultImage: string | null;
  /** 错误信息（status === 'error' 时） */
  errorMessage: string | null;
}

export const initialAppState: AppState = {
  status: 'idle',
  previewImage: null,
  uploadedFile: null,
  resultImage: null,
  errorMessage: null,
};
