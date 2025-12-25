import { useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getAuthMe, kakaoLogin } from '@/apis/auth';
import { getPets } from '@/apis/pets';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { setAuthenticated, setOnboarding } from '@/store/authSlice';
import { setSelectedPetId } from '@/store/petSlice';
import { setUser } from '@/store/userSlice';

/**
 * 카카오 인증 후, 리디렉션 준비하는 페이지
 * - 공통: 쿠키 설정/조회 요청, memberId/hasPet를 기반으로 라우팅
 */
export const AuthLoginRedirectPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');
    if (!code) {
      console.error('❌ 인가 코드 없음');
      navigate('/login');
      return;
    }

    (async () => {
      try {
        // 1) 백엔드 로그인 교환(XHR) → 쿠키 Set-Cookie 수신
        await kakaoLogin(code);

        // 2) Who am I
        const { memberId, hasPet } = await getAuthMe();
        dispatch(setUser({ memberId, email: null, nickname: null }));

        if (!hasPet) {
          // 온보딩 분기
          dispatch(setOnboarding());
          localStorage.removeItem('selectedPetId'); // (표시용 캐시만 사용 시)
          navigate('/signup/pet', { replace: true });
          return;
        } else {
          dispatch(setAuthenticated());
        }

        // 3) 기존 유저 초기화(펫 선택)
        const pets = await getPets(); // 서버가 토큰에서 memberId 추론 가능하면 파라미터 제거
        if (!pets?.length) {
          localStorage.removeItem('selectedPetId');
          navigate('/signup/pet', { replace: true });
          return;
        }

        // 기존 저장된 selectedPetId가 목록에 존재하면 유지
        const stored = localStorage.getItem('selectedPetId');
        const storedId = stored ? Number(stored) : null;
        const validStored = storedId != null && pets.some(p => p.id === storedId);
        // 없거나 유효하지 않으면 대표(즐겨찾기) 우선, 그 외 첫 번째
        const nextSelected = validStored
          ? storedId!
          : pets.slice().sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))[0].id;
        // 상태/스토리지 동기화
        dispatch(setSelectedPetId(nextSelected));
        localStorage.setItem('selectedPetId', String(nextSelected)); // 표시용 캐시

        // 4) 홈 진입
        navigate('/', { replace: true });
      } catch (e) {
        console.error('❌ 로그인 교환 또는 /auth/me 실패', e);
        navigate('/login', { replace: true });
      }
    })();
  }, [dispatch, navigate]);

  return (
    <div>
      <LoadingSpinner />
    </div>
  );
};
