import { useMemo, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import type { RootState } from '@/store/store';
import { AlarmFeature, type AlarmFeatureHandle } from '@/features/alarm/AlarmFeature';
import EmptyDog from '@/assets/icons/empty-dog.svg?react';
import { getAllAlarms } from '@/apis/alarm';
import { toAlarmEntity, toUiAlarm } from '@/utils/transform/alarm';
import { Button } from '@/ds/Button';
import { tx } from '@/styles/typography';
import { Plus } from 'lucide-react';
import { DemoBlock } from '@/components/DemoBlock';

export const AlarmPage = () => {
  const petId = useSelector((s: RootState) => s.petSession.selectedPetId);
  const pid = petId ?? -1;

  // 서버 조회(SSOT)
  const { data, isLoading } = useQuery({
    queryKey: ['alarms', pid],
    queryFn: () => {
      if (pid <= 0) throw new Error('No pet selected');
      return getAllAlarms(pid); // AlarmDto[]
    },
    enabled: pid > 0,
    staleTime: 5 * 60 * 1000,
  });

  const alarms = useMemo(() => {
    const list = (data ?? []).map(toAlarmEntity).map(toUiAlarm);
    return list.sort((a, b) => a.notifyAt.getTime() - b.notifyAt.getTime());
  }, [data]);

  const featureRef = useRef<AlarmFeatureHandle>(null);

  return (
    <Wrapper>
      <Header>알람 목록</Header>

      <Content $isEmpty={!alarms.length}>
        {isLoading && <Placeholder>로딩 중…</Placeholder>}

        {!isLoading && alarms.length === 0 && (
          <>
            <EmptyDogIcon />
            <Description>등록한 알람이 없습니다</Description>
          </>
        )}

        <AlarmFeature ref={featureRef} petId={pid} alarms={alarms} />
      </Content>

      <Footer $isEmpty={!alarms.length}>
        {alarms.length > 0 ? (
          <AddButton onClick={() => featureRef.current?.openCreate()}>
            <Plus aria-hidden size={18} strokeWidth={2} />
            <Text>알람 추가</Text>
          </AddButton>
        ) : (
          <DemoBlock onlyNewBlock>
            <Button size="lg" fullWidth onClick={() => featureRef.current?.openCreate()}>
              알람 추가하기
            </Button>
          </DemoBlock>
        )}
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
`;

const Header = styled.h2`
  text-align: center;
  padding: 18px 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 135%;
  letter-spacing: -0.45px;
`;

const Content = styled.div<{ $isEmpty: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ $isEmpty }) => ($isEmpty ? 'center' : 'flex-start')};
  align-items: ${({ $isEmpty }) => ($isEmpty ? 'center' : 'stretch')};
  gap: 12px;
  flex: 1;
`;

const Placeholder = styled.div`
  color: ${({ theme }) => theme.color.gray[400]};
  ${tx.body('reg14')};
`;

const EmptyDogIcon = styled(EmptyDog)`
  width: 142px;
  height: auto;
  color: ${({ theme }) => theme.color.gray[400]};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.color.gray[400]};
  ${tx.body('med16')};
`;

const Footer = styled.div<{ $isEmpty: boolean }>`
  display: flex;
  justify-content: ${({ $isEmpty }) => ($isEmpty ? 'flex-start' : 'flex-end')};
  padding: 0 20px;
  margin-bottom: 30px;
`;

const AddButton = styled.button`
  position: fixed;
  /* 네비바 위 + 여유 간격 + 안전영역(iOS 노치) */
  bottom: calc(60px + 30px);
  z-index: 10;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.color.main[500]};
  background: ${({ theme }) => theme.color.white};
  ${tx.body('med16')};
  color: ${({ theme }) => theme.color.gray[700]};
  border-radius: 30px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.16);
  }
  &:active {
    transform: translateY(1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Text = styled.span`
  color: ${({ theme }) => theme.color.gray[700]};
  ${tx.body('med16')};
`;
