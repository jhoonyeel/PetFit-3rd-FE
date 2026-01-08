import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import type { RootState } from '@/store/store';
import { ENV } from '@/constants/env';

// 인증 안 된 유저만 허용, 로그인된 유저는 앱 쉘 /로 리디렉션
export const PrivateRouter = () => {
  const status = useSelector((s: RootState) => s.auth.status);
  const location = useLocation();

  // ✅ demo manual mode: idle은 판정 대기 상태 → private는 막고 로그인으로 유도
  if (ENV.IS_DEMO && status === 'idle') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === 'idle' || status === 'checking') {
    return <LoadingSpinner />;
  }

  // ❗ 비인증은 private 소속 아님 → 로그인으로
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // onboarding + authenticated 모두 private 앱 쉘에 소속 → 통과
  return <Outlet />;
};
