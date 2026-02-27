import React from 'react';
import type { AppState, AppStateStatus } from '../types/appState';
import { initialAppState } from '../types/appState';

interface AppStateContextValue {
  appState: AppState;
  setStatus: (status: AppStateStatus) => void;
  setPreviewImage: (url: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  setResultImage: (url: string | null) => void;
  setErrorMessage: (message: string | null) => void;
  /** 重置为初始状态（如切换模块时） */
  reset: () => void;
  /** 开始处理：置为 processing，清空 result/error */
  startProcessing: () => void;
  /** 处理成功：置为 success，设置 result */
  setSuccess: (resultUrl: string) => void;
  /** 处理失败：置为 error，设置 errorMessage */
  setError: (message: string) => void;
}

const AppStateContext = React.createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = React.useState<AppState>(initialAppState);

  const setStatus = React.useCallback((status: AppStateStatus) => {
    setAppState((prev) => ({ ...prev, status }));
  }, []);

  const setPreviewImage = React.useCallback((previewImage: string | null) => {
    setAppState((prev) => ({ ...prev, previewImage }));
  }, []);

  const setUploadedFile = React.useCallback((uploadedFile: File | null) => {
    setAppState((prev) => ({ ...prev, uploadedFile }));
  }, []);

  const setResultImage = React.useCallback((resultImage: string | null) => {
    setAppState((prev) => ({ ...prev, resultImage }));
  }, []);

  const setErrorMessage = React.useCallback((errorMessage: string | null) => {
    setAppState((prev) => ({ ...prev, errorMessage }));
  }, []);

  const reset = React.useCallback(() => {
    setAppState(initialAppState);
  }, []);

  const startProcessing = React.useCallback(() => {
    setAppState((prev) => ({
      ...prev,
      status: 'processing',
      resultImage: null,
      errorMessage: null,
    }));
  }, []);

  const setSuccess = React.useCallback((resultUrl: string) => {
    setAppState((prev) => ({
      ...prev,
      status: 'success',
      resultImage: resultUrl,
      errorMessage: null,
    }));
  }, []);

  const setError = React.useCallback((message: string) => {
    setAppState((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: message,
      resultImage: null,
    }));
  }, []);

  const value: AppStateContextValue = React.useMemo(
    () => ({
      appState,
      setStatus,
      setPreviewImage,
      setUploadedFile,
      setResultImage,
      setErrorMessage,
      reset,
      startProcessing,
      setSuccess,
      setError,
    }),
    [
      appState,
      setStatus,
      setPreviewImage,
      setUploadedFile,
      setResultImage,
      setErrorMessage,
      reset,
      startProcessing,
      setSuccess,
      setError,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
