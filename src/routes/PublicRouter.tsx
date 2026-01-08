import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { RootState } from '@/store/store';
import { ENV } from '@/constants/env';

// 인증 안 된 유저만 허용, 로그인된 유저는 앱 쉘 /로 리디렉션
export const PublicRouter = () => {
  const status = useSelector((s: RootState) => s.auth.status);

  // ✅ demo manual mode: idle은 인증 판정 대기 상태 → public 접근 허용
  if (ENV.IS_DEMO && status === 'idle') {
    return <Outlet />;
  }

  if (status === 'idle' || status === 'checking') {
    return <LoadingSpinner />;
  }

  // 로그인된 상태(onboarding, authenticated)는 public 소속 아님 → 앱쉘(/)로
  if (status === 'onboarding') {
    return <Navigate to="/onboarding/pet" replace />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
