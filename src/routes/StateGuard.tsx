// routes/StateGuard.tsx
import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

import { setSelectedPetId } from '@/store/petSlice';
import type { RootState } from '@/store/store';

interface Props {
  requireMemberId?: boolean;
  requireSelectedPet?: boolean;
}

/**
 * 전역 상태 가드
 * - memberId: Redux(userSlice)에서만 관리 (/auth/me 결과)
 * - selectedPetId: UX 편의상 localStorage 캐시 허용
 */
export const StateGuard = ({ requireMemberId = true, requireSelectedPet = true }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const memberId = useSelector((s: RootState) => s.user.memberId);
  const selectedPetId = useSelector((s: RootState) => s.selectedPet.id);
  const authStatus = useSelector((s: RootState) => s.auth.status);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // ✅ 인증 확인 중이면 가드 판단 유예
    if (authStatus === 'checking' || authStatus === 'idle') return;

    // 1) memberId 요구 시 → Redux 상태만 확인
    if (requireMemberId && memberId == null) {
      localStorage.removeItem('selectedPetId');
      alert('로그아웃되었습니다. 다시 로그인해 주세요.');
      navigate('/login', { replace: true });
      return;
    }

    // 2) selectedPetId 요구 시 → Redux 상태 + localStorage 캐시 확인
    if (requireSelectedPet && (selectedPetId == null || selectedPetId === -1)) {
      const cached = localStorage.getItem('selectedPetId');
      if (cached) {
        dispatch(setSelectedPetId(Number(cached)));
        return;
      }

      // 온보딩 미완료 → 가입 플로우로 리다이렉트 (로그아웃 ❌)
      navigate('/signup/pet', { replace: true });
      return;
    }

    // 3) 모든 조건 충족 → 통과
    setChecked(true);
  }, [
    authStatus,
    requireMemberId,
    requireSelectedPet,
    memberId,
    selectedPetId,
    dispatch,
    navigate,
  ]);

  if (authStatus === 'checking' || authStatus === 'idle') return null;
  if (!checked) return null; // 보정 중에는 화면 미표시
  return <Outlet />;
};
