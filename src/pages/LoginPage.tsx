import styled from 'styled-components';

import { tx } from '@/styles/typography';
import Logo from '@/assets/icons/logo.svg?react';
import { useMemo, useRef, useState } from 'react';
import { ENV } from '@/constants/env';
import { demoLogin } from '@/apis/auth';
import { useDispatch, useSelector } from 'react-redux';
import { DemoBlock } from '@/components/DemoBlock';
import { requestRecheck } from '@/store/authSlice';
import type { RootState } from '@/store/store';

export const LoginPage = () => {
  const slides = useMemo(
    () => [
      { img: '/onboarding1.png', text: '펫핏에서 반려동물의\n건강을 기록하고, 진단해보세요!' },
      {
        img: '/onboarding2.png',
        text: '반려동물의 일정을 확인하고\n오늘의 루틴을 완료할 수 있어요',
      },
      {
        img: '/onboarding3.png',
        text: '루틴 데이터로 변화와 이상 징후를\n감지하고 보호자가 놓치지 않게 도와줘요',
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const dispatch = useDispatch();

  const authStatus = useSelector((s: RootState) => s.auth.status);

  const isDemoGate = ENV.IS_DEMO && authStatus === 'idle';
  const isChecking = authStatus === 'checking';

  const go = (i: number) => setIndex(Math.max(0, Math.min(i, slides.length - 1)));

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (startX.current == null) return;
    const diff = e.clientX - startX.current;
    const threshold = 50;
    if (diff > threshold) go(index - 1);
    else if (diff < -threshold) go(index + 1);
    startX.current = null;
  };

  const handleKakaoLogin = async () => {
    const kakaoAuthURI = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_APP_KAKAO_APP_KEY}&redirect_uri=${import.meta.env.VITE_APP_KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURI;
  };

  const handleDemoLogin = async (scenario: 'noPet' | 'hasPet') => {
    if (demoLoading || isChecking) return;
    try {
      setDemoLoading(true);
      await demoLogin(scenario); // 1) 쿠키 심기
      dispatch(requestRecheck()); // 2) /auth/me 트리거 -> checking
    } catch (e) {
      console.warn(e);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <Container>
      <BlurWrap $on={isDemoGate}>
        <Logo width={60} height={'auto'} />
        <Slider>
          <Track
            ref={trackRef}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, i) => (
              <Slide key={i}>
                <Img src={s.img} alt="" loading="lazy" decoding="async" draggable={false} />
                <Desc dangerouslySetInnerHTML={{ __html: s.text.replace(/\n/g, '<br/>') }} />
              </Slide>
            ))}
          </Track>

          <Dots>
            {slides.map((_, i) => (
              <Dot key={i} $active={i === index} onClick={() => go(i)} />
            ))}
          </Dots>
        </Slider>
        <DemoBlock>
          <KakaoButton onClick={handleKakaoLogin}>
            <img
              src="/kakao_login_medium_wide.png"
              alt="카카오로 시작하기"
              loading="lazy"
              decoding="async"
            />
          </KakaoButton>
        </DemoBlock>
      </BlurWrap>

      {/* ✅ DEMO idle: 상태를 명시하는 오버레이 */}
      {isDemoGate && (
        <GateOverlay>
          <GateCard>
            <GateTitle>DEMO MODE</GateTitle>
            <GateDesc>
              시나리오를 선택하면 데모 세션을 준비한 뒤 <b>/auth/me</b>로 판정합니다.
            </GateDesc>

            <GateButtons>
              <GateButton disabled={demoLoading} onClick={() => handleDemoLogin('noPet')}>
                DEMO: 신규 유저(온보딩)
              </GateButton>
              <GateButton disabled={demoLoading} onClick={() => handleDemoLogin('hasPet')}>
                DEMO: 기존 유저(홈)
              </GateButton>
            </GateButtons>

            {(demoLoading || isChecking) && <GateHint>세션 준비 중...</GateHint>}
          </GateCard>
        </GateOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.color.white};
  gap: 30px;
`;
const Slider = styled.div`
  width: 100%;
  max-width: 430px;
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  transition: transform 0.3s ease;
  width: 100%;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 0 24px;
`;

const Img = styled.img`
  width: auto;
  height: 180px;
`;

const Desc = styled.p`
  text-align: center;
  ${tx.body('med16')};
  color: ${({ theme }) => theme.color.gray[700]};
  line-height: 1.5;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: none;
  background: ${({ theme, $active }) => ($active ? theme.color.main[500] : theme.color.gray[300])};
`;

const KakaoButton = styled.button`
  margin-top: 20px;
  padding: 0;

  img {
    width: 250px;
    height: auto;
  }
`;

const BlurWrap = styled.div<{ $on: boolean }>`
  width: 100%;
  display: contents;

  ${({ $on }) =>
    $on
      ? `
    filter: blur(2px);
    opacity: 0.6;
    pointer-events: none;
  `
      : ''}
`;

const GateOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.25);
  z-index: 9999;
`;

const GateCard = styled.div`
  width: min(360px, calc(100% - 48px));
  background: ${({ theme }) => theme.color.white};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
`;

const GateTitle = styled.h3`
  margin: 0 0 8px 0;
  ${tx.title('semi18')};
`;

const GateDesc = styled.p`
  margin: 0 0 16px 0;
  ${tx.body('med13')};
  color: ${({ theme }) => theme.color.gray[700]};
  line-height: 1.5;
`;

const GateButtons = styled.div`
  display: grid;
  gap: 10px;
`;

const GateButton = styled.button`
  padding: 12px 12px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.color.main[500]};
  color: ${({ theme }) => theme.color.white};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GateHint = styled.div`
  margin-top: 12px;
  ${tx.body('med13')};
  color: ${({ theme }) => theme.color.gray[600]};
`;
