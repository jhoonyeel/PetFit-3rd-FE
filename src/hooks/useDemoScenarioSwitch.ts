// hooks/useDemoScenarioSwitch.ts
import { useDispatch } from 'react-redux';
import { requestRecheck, clearAuth } from '@/store/authSlice';
import { setSelectedPetId } from '@/store/petSlice';
import { demoLogin } from '@/apis/auth'; // POST /auth/demo-login

export const useDemoScenarioSwitch = () => {
  const dispatch = useDispatch();

  const switchScenario = async (scenario: 'new' | 'existing') => {
    await demoLogin(scenario); // ✅ 쿠키 재설정 + 세션 초기화
    dispatch(setSelectedPetId(null)); // 화면 잔상 제거
    dispatch(clearAuth()); // 인증 세션 초기화
    dispatch(requestRecheck()); // AuthBootstrap이 /auth/me 다시 실행
  };

  return { switchScenario };
};
