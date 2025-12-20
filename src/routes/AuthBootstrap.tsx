import { getAuthMe } from '@/apis/auth';
import {
  requestRecheck,
  setAuthenticated,
  setOnboarding,
  setUnauthenticated,
  startAuthCheck,
} from '@/store/authSlice';
import type { RootState } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// AuthBootstrap.tsx
export const AuthBootstrap = () => {
  const dispatch = useDispatch();
  const recheckTick = useSelector((s: RootState) => s.auth.recheckTick);
  const status = useSelector((s: RootState) => s.auth.status);

  useEffect(() => {
    // 최초 진입
    if (status === 'idle') dispatch(requestRecheck());
  }, [status, dispatch]);

  useEffect(() => {
    if (recheckTick === 0) return; // ✅ 최초 이벤트 전에는 실행 금지

    const run = async () => {
      dispatch(startAuthCheck());
      try {
        const { memberId, isNewUser } = await getAuthMe();
        dispatch(setUser({ memberId, email: null, nickname: null })); // 유지해도 됨(프로필은 별개)
        dispatch(isNewUser ? setOnboarding() : setAuthenticated());
      } catch {
        dispatch(setUnauthenticated('Auth_Me_Failed'));
      }
    };

    // Return Node → CHECKING
    run();
  }, [recheckTick, dispatch]);

  return null;
};
