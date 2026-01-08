// routes/SelectedPetGuard.tsx
import type { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export const SelectedPetGuard = () => {
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  // 여기 정책은 선택:
  // A) null이면 홈에서 /pets 로딩 후 자동복구를 기대 → 그냥 통과
  // B) null이면 /manage로 보내기
  if (selectedPetId == null) {
    // /onboarding/pet, /login으로도 이동할 수 있음.(상태에 따라)
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
