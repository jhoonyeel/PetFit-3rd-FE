import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '@/store/store';

export const OnboardingOnly = () => {
  const status = useSelector((s: RootState) => s.auth.status);

  // 온보딩 끝났으면 홈으로
  if (status === 'authenticated') return <Navigate to="/" replace />;

  // 로그인 안 됐으면 로그인으로
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  // onboarding / checking / idle 은 그대로 통과(상위에서 spinner 처리해도 됨)
  return <Outlet />;
};
