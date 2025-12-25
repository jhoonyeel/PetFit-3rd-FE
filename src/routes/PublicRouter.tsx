import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { RootState } from '@/store/store';
import { ENV } from '@/constants/env';

/**
 * 로그인 상태일 때는 접근 불가한 라우트 (예: /login)
 * - authenticated → 홈(/)으로 리디렉션
 * - onboarding → 온보딩 페이지(/signup/pet)로 이동
 * - checking → 로딩 스피너
 * - unauthenticated → children(<Outlet />) 렌더
 */
export const PublicRouter = () => {
  const status = useSelector((s: RootState) => s.auth.status);

  // ✅ demo manual mode: idle은 인증 판정 대기 상태 → public 접근 허용
  if (ENV.IS_DEMO && status === 'idle') {
    return <Outlet />;
  }

  switch (status) {
    case 'idle':
    case 'checking':
      return <LoadingSpinner />;

    case 'onboarding':
      return <Navigate to="/signup/pet" replace />;

    case 'authenticated':
      return <Navigate to="/" replace />;

    // unauthenticated → 접근 허용
    case 'unauthenticated':
    default:
      return <Outlet />;
  }
};
