import { getAuthMe } from '@/apis/auth';
import { ENV } from '@/constants/env';
import {
  requestRecheck,
  setAuthenticated,
  setOnboarding,
  setUnauthenticated,
  startAuthCheck,
} from '@/store/authSlice';
import { setSelectedPetId } from '@/store/petSlice';
import type { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// AuthBootstrap.tsx
export const AuthBootstrap = () => {
  const dispatch = useDispatch();
  const recheckTick = useSelector((s: RootState) => s.auth.recheckTick);
  const status = useSelector((s: RootState) => s.auth.status);

  useEffect(() => {
    // ✅ 일반 모드: 부팅 즉시 판정 (idle -> checking)
    // ✅ DEMO 모드: idle은 "시나리오 선택 대기"이므로 자동 판정 금지
    if (status !== 'idle') return;
    if (ENV.IS_DEMO) return;

    if (status === 'idle') dispatch(requestRecheck());
  }, [status, dispatch]);

  useEffect(() => {
    if (recheckTick === 0) return; // ✅ 최초 이벤트 전에는 실행 금지

    const run = async () => {
      dispatch(startAuthCheck());

      try {
        const { onboarding, selectedPetId } = await getAuthMe();

        const canEnterHome = Boolean(onboarding?.petDone && onboarding?.routineDone);
        if (!canEnterHome) {
          dispatch(setSelectedPetId(null));
          dispatch(setOnboarding());
          return;
        }

        // 홈 진입: 서버가 선택한 id가 SSOT
        dispatch(setSelectedPetId(selectedPetId)); // null 가능(보험)
        dispatch(setAuthenticated());
      } catch {
        dispatch(setUnauthenticated('Auth_Me_Failed'));
      }
    };

    // Return Node → CHECKING
    run();
  }, [recheckTick, dispatch]);

  return null;
};
