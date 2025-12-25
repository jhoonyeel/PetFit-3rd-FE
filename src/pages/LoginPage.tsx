import styled from 'styled-components';

import { tx } from '@/styles/typography';
import Logo from '@/assets/icons/logo.svg?react';
import { useMemo, useRef, useState } from 'react';
import { ENV } from '@/constants/env';
import { demoLogin } from '@/apis/auth';
import { useDispatch } from 'react-redux';
import { DemoBlock } from '@/components/DemoBlock';
import { requestRecheck } from '@/store/authSlice';

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);
  const dispatch = useDispatch();

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
    await demoLogin(scenario);
    dispatch(requestRecheck()); // ✅ 부팅 트리거 강제
  };

  return (
    <Container>
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
      {ENV.IS_DEMO && (
        <DemoButtons>
          <button onClick={() => handleDemoLogin('noPet')}>DEMO: 신규 유저(온보딩)</button>
          <button onClick={() => handleDemoLogin('hasPet')}>DEMO: 기존 유저(홈)</button>
        </DemoButtons>
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

const DemoButtons = styled.div`
  margin-top: 20px;
`;
