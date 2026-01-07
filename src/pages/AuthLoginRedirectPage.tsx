import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAuthMe, kakaoLogin } from '@/apis/auth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { setAuthenticated, setOnboarding } from '@/store/authSlice';
import { setSelectedPetId } from '@/store/petSlice';

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
        const { onboarding, selectedPetId } = await getAuthMe();

        const petDone = !!onboarding?.petDone;
        const routineDone = !!onboarding?.routineDone;
        const canEnterHome = petDone && routineDone;

        if (!canEnterHome) {
          dispatch(setOnboarding());
          dispatch(setSelectedPetId(null));

          navigate(petDone ? '/slot' : '/signup/pet', { replace: true });
          return;
        }
        // 홈 진입 조건이면: 서버가 준 selectedPetId를 SSOT로 세팅
        // (null이면 가드에서 막히므로 여기서도 보험으로 처리)
        dispatch(setSelectedPetId(selectedPetId ?? null));
        dispatch(setAuthenticated());

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
