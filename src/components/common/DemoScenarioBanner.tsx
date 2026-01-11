import styled from 'styled-components';
import { ENV } from '@/constants/env';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useMemo, useState } from 'react';
import { useDemoScenarioSwitch } from '@/hooks/useDemoScenarioSwitch';

type BannerTone = 'strong' | 'soft';

export const DemoScenarioBanner = () => {
  const { status, scenario } = useSelector((s: RootState) => s.auth);
  const { switchScenario } = useDemoScenarioSwitch();

  const [dismissed, setDismissed] = useState(false);

  const shouldShow = ENV.IS_DEMO && status === 'authenticated' && !!scenario && !dismissed;
  const tone: BannerTone = scenario === 'new' ? 'strong' : 'soft';

  const content = useMemo(() => {
    if (scenario === 'new') {
      return {
        title: '데모 신규 유저는 기능 체험이 제한돼요',
        desc: '알람·특이사항·달력 데이터가 비어 있어요. 기존 유저 시나리오로 이동하면 실제 데이터 기반의 전체 흐름을 확인할 수 있어요.',
        cta: '기존 유저로 보기',
        target: 'existing' as const,
      };
    }
    return {
      title: '신규 유저 온보딩 흐름도 확인할 수 있어요',
      desc: '가입 → 반려동물 등록 → 홈 진입까지의 온보딩 흐름을 한 번 더 확인해보세요.',
      cta: '신규 시나리오 보기',
      target: 'new' as const,
    };
  }, [scenario]);

  if (!shouldShow) return null;

  const canDismiss = scenario === 'existing'; // existing에서만 닫기 허용

  return (
    <Wrap $tone={tone} role="region" aria-label="데모 시나리오 안내">
      <Text>
        <Title>{content.title}</Title>
        <Desc>{content.desc}</Desc>
      </Text>

      <Actions>
        <CtaButton $tone={tone} type="button" onClick={() => switchScenario(content.target)}>
          {content.cta}
        </CtaButton>

        {canDismiss && (
          <CloseButton type="button" onClick={() => setDismissed(true)} aria-label="닫기">
            ✕
          </CloseButton>
        )}
      </Actions>
    </Wrap>
  );
};

/* ======================= styles ======================= */

const Wrap = styled.div<{ $tone: BannerTone }>`
  /* 북마크바 바로 밑에 붙는 상단 바 */
  position: sticky;
  top: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  /* 얇지만 2행 수용 가능하도록 */
  padding: 8px 12px;
  margin: 0;
  border-radius: 0;

  border-bottom: 1px solid ${({ theme }) => theme.color.gray[100]};
  background: ${({ $tone, theme }) =>
    $tone === 'strong' ? theme.color.gray[50] : theme.color.white};

  /* iOS safe-area 대응 */
  padding-top: calc(8px + env(safe-area-inset-top));
`;

const Text = styled.div`
  display: flex;
  flex-direction: column; /* ✅ Title / Desc 분리 */
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 1.25;
  color: ${({ theme }) => theme.color.gray[900]};
  white-space: nowrap; /* 1줄 고정 */
`;

const Desc = styled.div`
  font-size: 12px;
  line-height: 1.25;
  color: ${({ theme }) => theme.color.gray[600]};

  /* ✅ 2줄 허용 + ellipsis */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  overflow: hidden;
  word-break: break-word;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const CtaButton = styled.button<{ $tone: BannerTone }>`
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;

  background: ${({ $tone, theme }) =>
    $tone === 'strong' ? theme.color.gray[900] : theme.color.gray[50]};
  color: ${({ $tone, theme }) => ($tone === 'strong' ? theme.color.white : theme.color.gray[900])};
`;

const CloseButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.color.gray[500]};

  &:hover {
    background: ${({ theme }) => theme.color.gray[50]};
  }
`;
