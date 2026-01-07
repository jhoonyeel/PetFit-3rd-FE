import { store } from '@/store/store';
import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { clearAuth, setUnauthenticated } from '@/store/authSlice';

export const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// AxiosRequestConfig 확장: 재시도/리프레시 마커
declare module 'axios' {
  export interface AxiosRequestConfig {
    __isRetry?: boolean;
    __isRefreshCall?: boolean;
  }
}

// ✅ refresh를 “절대” 시도하면 안 되는 엔드포인트(인증/세션 판정 계열)
const NEVER_REFRESH_PATHS = [
  '/auth/me',
  '/auth/refresh',
  '/auth/demo-login',
  '/auth/kakao/login',
  '/auth/kakao/logout',
  '/auth/kakao/withdraw',
];

// ✅ “보호 API”로 간주할 prefix(여기만 refresh 허용)
const PROTECTED_PREFIXES = [
  '/pets',
  '/calendar',
  '/alarms',
  '/ai-report',
  '/members',
  '/remarks',
  '/routines',
  '/slots',
  '/entities',
];

const normalizeUrl = (url?: string) => {
  if (!url) return '';
  // axiosInstance는 baseURL('/api')를 자동으로 붙이므로 여기 url은 보통 '/auth/me' 형태
  // 혹시 절대경로/쿼리 들어오면 정리
  const u = url.split('?')[0];
  return u.startsWith('/') ? u : `/${u}`;
};

const isNeverRefresh = (url?: string) => {
  const u = normalizeUrl(url);
  return NEVER_REFRESH_PATHS.some(p => u === p || u.startsWith(p + '/'));
};

const isProtectedApi = (url?: string) => {
  const u = normalizeUrl(url);
  return PROTECTED_PREFIXES.some(p => u === p || u.startsWith(p + '/'));
};

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

// Response: 401 → (보호 API만) refresh(단일) → 원 요청 1회 재시도
axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined;
    if (!error.response || !originalRequest) return Promise.reject(error);

    const is401 = error.response.status === 401;
    if (!is401) return Promise.reject(error);

    const url = normalizeUrl(originalRequest.url);
    const isRefreshCall = !!originalRequest.__isRefreshCall;

    // ✅ 1) 인증/판정 계열은 refresh 금지 (특히 /auth/me)
    if (isNeverRefresh(url)) {
      // 여기서 굳이 clearAuth까지 할지 정책 선택:
      // - /auth/me 401: “비로그인 확정”이므로 clearAuth + unauth 처리 OK
      store.dispatch(clearAuth());
      store.dispatch(setUnauthenticated('Auth_Me_Failed'));
      return Promise.reject(error);
    }

    // ✅ 2) refresh 자기 자신은 당연히 금지
    if (isRefreshCall) return Promise.reject(error);

    // ✅ 3) 보호 API가 아니면 refresh 금지 (공개 API/헬스체크 등)
    if (!isProtectedApi(url)) {
      return Promise.reject(error);
    }

    // ✅ 4) 보호 API에서만 refresh 1회 → 원요청 1회 재시도
    if (!originalRequest.__isRetry) {
      try {
        await refreshAccessToken();
        originalRequest.__isRetry = true;
        return axiosInstance(originalRequest);
      } catch (e) {
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
