// routes/StateGuard.tsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import type { RootState } from '@/store/store';
import { setSelectedPetId } from '@/store/petSlice';

interface Props {
  requireAuth?: boolean;
  requireSelectedPet?: boolean;
}

/**
 * StateGuard
 * - memberId: Redux(userSlice)에서만 신뢰 (/auth/me 결과)
 * - selectedPetId: UX 편의로 localStorage 캐시 허용 (단, "펫이 있어야 하는 구간"에서만)
 *
 * 정책:
 * - authStatus가 checking/idle이면 판단 유예
 * - onboarding 상태에서는 selectedPetId 요구하지 않음(애초에 펫이 없을 수 있음)
 * - 경로 변경/상태 변경마다 checked를 리셋하여 "null 고착" 방지
 */
export const StateGuard = ({ requireAuth = true, requireSelectedPet = true }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authStatus = useSelector((s: RootState) => s.auth.status);
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  const [checked, setChecked] = useState(false);

  // ✅ effect가 재평가되어야 하는 핵심 키들
  const key = useMemo(
    () =>
      [
        location.pathname,
        authStatus,
        requireAuth ? 'M1' : 'M0',
        requireSelectedPet ? 'P1' : 'P0',
        selectedPetId ?? 'no-pet',
      ].join('|'),
    [location.pathname, authStatus, requireAuth, requireSelectedPet, selectedPetId]
  );

  useEffect(() => {
    // ✅ 상태/경로가 바뀌면 항상 다시 판정(checked 고착 방지)
    setChecked(false);

    // ✅ 인증 확인 중이면 판단 유예
    if (authStatus === 'checking' || authStatus === 'idle') return;

    // 1) 인증 필요
    if (requireAuth) {
      if (authStatus === 'unauthenticated') {
        dispatch(setSelectedPetId(null));
        navigate('/login', { replace: true, state: { from: location } });
        return;
      }
      if (authStatus === 'onboarding') {
        dispatch(setSelectedPetId(null));
        navigate('/signup/pet', { replace: true }); // or onboarding entry
        return;
      }
    }

    // 2) selectedPet 필요(= authenticated 구간에서만 의미)
    const effectiveRequireSelectedPet = requireSelectedPet && authStatus === 'authenticated';
    if (effectiveRequireSelectedPet) {
      if (selectedPetId == null) {
        // 이제는 /auth/me가 selectedPetId를 주는 구조라서
        // 여기서 localStorage 복원은 “보험” 정도로만 유지하거나 제거 가능
        const cached = localStorage.getItem('selectedPetId');
        if (cached) {
          const n = Number(cached);
          if (!Number.isNaN(n)) {
            dispatch(setSelectedPetId(n));
            return;
          }
        }
        // 홈 진입은 했는데 pet 컨텍스트가 없다면 홈에서 /pets 로딩 후 자동 선택되게 둬도 됨
        // 또는 정책적으로 온보딩으로 보내도 됨
        navigate('/signup/pet', { replace: true });
        return;
      }
    }

    // 3) 모든 조건 충족 → 통과
    setChecked(true);
  }, [key, dispatch, navigate]); // ✅ key에 필요한 deps가 다 들어있음

  // 로딩/판정 중에는 화면을 아예 안 뿌려 깜빡임 방지
  if (authStatus === 'checking' || authStatus === 'idle') return null;
  if (!checked) return null;

  return <Outlet />;
};
