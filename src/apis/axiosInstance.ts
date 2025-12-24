import { store } from '@/store/store';
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { clearAuth, setUnauthenticated } from '@/store/authSlice';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// AxiosRequestConfig 확장: 재시도/리프레시 마커
declare module 'axios' {
  export interface AxiosRequestConfig {
    __isRetry?: boolean;
    __isRefreshCall?: boolean;
  }
}

// Request: 토큰 헤더 주입 금지(쿠키만 사용)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  error => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response: 401 → refresh(단일) → 원 요청 1회 재시도
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined;
    if (!error.response || !originalRequest) return Promise.reject(error);

    const is401 = error.response.status === 401;
    const isRefreshCall = !!originalRequest.__isRefreshCall;

    if (is401 && !isRefreshCall && !originalRequest.__isRetry) {
      try {
        await refreshAccessToken(); // ★ 단일 실행 보장
        originalRequest.__isRetry = true; // 루프 방지 마커
        return axiosInstance(originalRequest); // 갱신 후 1회 재시도
      } catch (e) {
        // 리프레시 실패 → 상위에서 하드 로그아웃/리다이렉트 처리
        store.dispatch(clearAuth());
        store.dispatch(setUnauthenticated('Refresh_Failed'));
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

// Refresh: 단일 실행(Single-Flight) 함수
let refreshPromise: Promise<void> | null = null;
/**
 * 쿠키 기반 AT 갱신 (응답 바디의 accessToken은 무시; 쿠키만 신뢰)
 */
export const refreshAccessToken = async (): Promise<void> => {
  // 이미 진행 중이면 그 프라미스 재사용
  if (refreshPromise) return refreshPromise;

  // 즉시 실행 async IIFE로 프라미스 생성
  refreshPromise = (async () => {
    try {
      const cfg: AxiosRequestConfig = {
        __isRefreshCall: true,
      };
      await axiosInstance.post('/auth/refresh', null, cfg);
    } finally {
      // 성공/실패 관계없이 단일 실행 락 해제
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
