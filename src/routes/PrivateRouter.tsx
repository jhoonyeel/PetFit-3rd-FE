import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import type { RootState } from '@/store/store';

export const PrivateRouter = () => {
  const location = useLocation();
  const status = useSelector((s: RootState) => s.auth.status);

  switch (status) {
    case 'idle':
    case 'checking':
      return <LoadingSpinner />;

    // 신규 유저 → 온보딩 페이지
    case 'onboarding':
      return <Navigate to="/signup/pet" replace />;

    // 인증 성공 → 보호 라우트 컴포넌트 렌더
    case 'authenticated':
      return <Outlet />;

    // unauthenticated (또는 초기화 실패) → 로그인 페이지로
    case 'unauthenticated':
    default:
      return <Navigate to="/login" replace state={{ from: location }} />;
  }
};
