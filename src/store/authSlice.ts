import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated' | 'onboarding';
export type AuthReason =
  | 'Token_Expired'
  | 'Refresh_Failed'
  | 'Auth_Me_Failed'
  | 'Account_Disabled'
  | 'Logout';
export type OnboardingProgress = {
  petDone: boolean;
  routineDone: boolean;
};
export type DemoScenario = 'new' | 'existing';

interface AuthState {
  status: AuthStatus; // 인증 흐름 상태
  recheckTick: number; // Return Node 트리거(이벤트 카운터)
  onboarding?: OnboardingProgress;
  reason?: AuthReason;
  scenario?: DemoScenario; // 데모 서버 컨텍스트
}

const initialState: AuthState = {
  status: 'idle',
  recheckTick: 0,
  onboarding: undefined,
  scenario: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    requestRecheck: s => {
      s.recheckTick += 1;
    }, // Return Node

    /** 부팅/새로고침 시, /auth/me 호출 전 */
    startAuthCheck: s => {
      s.status = 'checking';
    },
    /** /auth/me 성공 (기존 유저) */
    setAuthenticated: (s, action: PayloadAction<{ scenario?: DemoScenario } | undefined>) => {
      s.status = 'authenticated';
      s.reason = undefined;
      s.onboarding = undefined;
      s.scenario = action.payload?.scenario;
    },
    /** /auth/me 성공 (신규 유저 → 온보딩) */
    setOnboarding: (
      s,
      action: PayloadAction<{ onboarding: OnboardingProgress; scenario?: DemoScenario }>
    ) => {
      s.status = 'onboarding';
      s.reason = undefined;
      s.onboarding = action.payload.onboarding;
      s.scenario = action.payload.scenario;
    },
    /** /auth/me 실패(리프레시 실패 포함) */
    setUnauthenticated: (s, action: PayloadAction<AuthReason>) => {
      s.status = 'unauthenticated';
      s.reason = action.payload;
      s.onboarding = undefined;
      s.scenario = undefined; // ✅ 인증 끊기면 컨텍스트도 제거
    },
    /** 명시적 로그아웃/탈퇴 */
    clearAuth: () => initialState,
  },
});

export const {
  requestRecheck,
  startAuthCheck,
  setAuthenticated,
  setOnboarding,
  setUnauthenticated,
  clearAuth,
} = authSlice.actions;
export default authSlice.reducer;
