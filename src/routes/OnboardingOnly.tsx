import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '@/store/store';

export const OnboardingOnly = () => {
  const status = useSelector((s: RootState) => s.auth.status);
  const onboarding = useSelector((s: RootState) => s.auth.onboarding);
  const location = useLocation();

  // 트리 소속(ownership) 강제. 이미 인증은 한 상태.
  if (status !== 'onboarding') {
    return <Navigate to="/" replace />;
  }

  // ✅ onboarding 상태에서만 단계 정렬
  const petDone = !!onboarding?.petDone;
  const target = petDone ? '/onboarding/slot' : '/onboarding/pet';

  // 온보딩 상태인데 다른 경로로 들어오면, 올바른 단계로 재정렬
  if (location.pathname !== target) {
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
