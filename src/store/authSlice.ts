import { createSlice } from '@reduxjs/toolkit';

export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'unauthenticated' | 'onboarding';
interface AuthState {
  status: AuthStatus; // 인증 흐름 상태
  recheckTick: number; // Return Node 트리거(이벤트 카운터)
  reason?: 'Token_Expired' | 'Refresh_Failed' | 'Auth_Me_Failed' | 'Account_Disabled' | 'Logout';
}

const initialState: AuthState = {
  status: 'idle',
  recheckTick: 0,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    requestRecheck: s => {
      s.recheckTick += 1;
    }, // Return Node

    /** 부팅/새로고침 시, /auth/me 호출 전 */
    startAuthCheck: state => {
      state.status = 'checking';
    },
    /** /auth/me 성공 (기존 유저) */
    setAuthenticated: state => {
      state.status = 'authenticated';
      state.reason = undefined;
    },
    /** /auth/me 성공 (신규 유저 → 온보딩) */
    setOnboarding: state => {
      state.status = 'onboarding';
      state.reason = undefined;
    },
    /** /auth/me 실패(리프레시 실패 포함) */
    setUnauthenticated: (state, action) => {
      state.status = 'unauthenticated';
      state.reason = action.payload;
    },
    /** 명시적 로그아웃/탈퇴 */
    logout: () => initialState,
  },
});

export const {
  requestRecheck,
  startAuthCheck,
  setAuthenticated,
  setOnboarding,
  setUnauthenticated,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
