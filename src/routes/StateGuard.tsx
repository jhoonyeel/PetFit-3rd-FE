// routes/StateGuard.tsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import type { RootState } from '@/store/store';
import { setSelectedPetId } from '@/store/petSlice';

interface Props {
  requireMemberId?: boolean;
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
export const StateGuard = ({ requireMemberId = true, requireSelectedPet = true }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authStatus = useSelector((s: RootState) => s.auth.status);
  const memberId = useSelector((s: RootState) => s.user.memberId);
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  const [checked, setChecked] = useState(false);

  // ✅ effect가 재평가되어야 하는 핵심 키들
  const key = useMemo(
    () =>
      [
        location.pathname,
        authStatus,
        requireMemberId ? 'M1' : 'M0',
        requireSelectedPet ? 'P1' : 'P0',
        memberId ?? 'no-member',
        selectedPetId ?? 'no-pet',
      ].join('|'),
    [location.pathname, authStatus, requireMemberId, requireSelectedPet, memberId, selectedPetId]
  );

  useEffect(() => {
    // ✅ 상태/경로가 바뀌면 항상 다시 판정(checked 고착 방지)
    setChecked(false);

    // ✅ 인증 확인 중이면 판단 유예
    if (authStatus === 'checking' || authStatus === 'idle') return;

    // ✅ onboarding 상태면 selectedPet을 요구하지 않는 게 원칙
    // (라우터에서도 이미 분리했지만, 가드 레벨에서도 안전장치로 한번 더)
    const effectiveRequireSelectedPet = requireSelectedPet && authStatus !== 'onboarding';

    // 1) memberId 요구 시 → Redux 상태만 확인
    if (requireMemberId && memberId == null) {
      localStorage.removeItem('selectedPetId');
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }

    // 2) selectedPetId 요구 시 → Redux + localStorage 캐시
    if (effectiveRequireSelectedPet) {
      if (selectedPetId == null) {
        const cached = localStorage.getItem('selectedPetId');
        if (cached) {
          const n = Number(cached);
          if (!Number.isNaN(n)) {
            dispatch(setSelectedPetId(n));
            // setSelectedPetId로 state가 바뀌면 effect가 다시 돌아오므로 여기서 return
            return;
          }
        }

        // 펫이 있어야 하는 구간인데 선택이 없으면 관리/온보딩으로 보냄
        // (여기선 UX 정책에 맞춰 /manage 로 보내도 됨)
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
