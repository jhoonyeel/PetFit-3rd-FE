import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { getSlot, patchSlot, initializeSlot } from '@/apis/slot';
import { TitleHeader } from '@/components/common/TitleHeader';
import { SlotButton } from '@/features/slot/SlotButton';
import { SlotInput } from '@/features/slot/SlotInput';
import type { RootState } from '@/store/store';
import type { SlotType } from '@/types/slot';

import EmptyRoutine from '@/assets/icons/empty-routine.svg?react';

export const SlotSettingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [defaultValues, setDefaultValues] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isInitial, setIsInitial] = useState(false);

  const [param] = useSearchParams();
  const showBack = param.get('flow') !== 'signup';

  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  // 슬롯 설정 가져오기
  useEffect(() => {
    const fetchSlot = async () => {
      try {
        const data: SlotType | null = await getSlot(selectedPetId ?? 0);

        // 슬롯 데이터가 있는지 확인
        if (!data || Object.values(data).every(v => v === false || v === 0 || v == null)) {
          setIsInitial(true);
          return;
        }

        setIsInitial(false);
        const newSelectedIds: string[] = [];
        const values: Record<string, number> = {};

        if (data.feedActivated) {
          newSelectedIds.push('feed');
          values['feed'] = data.feedAmount ?? 0;
        }
        if (data.waterActivated) {
          newSelectedIds.push('water');
          values['water'] = data.waterAmount ?? 0;
        }
        if (data.walkActivated) {
          newSelectedIds.push('walk');
          values['walk'] = data.walkAmount ?? 0;
        }
        if (data.pottyActivated) newSelectedIds.push('potty');
        if (data.dentalActivated) newSelectedIds.push('dental');
        if (data.skinActivated) newSelectedIds.push('skin');

        setSelectedIds(newSelectedIds);
        setDefaultValues(values);
      } catch (error) {
        if ((error as AxiosError).response?.status === 404) {
          setIsInitial(true);
        } else {
          console.error('슬롯 정보를 불러오는 데 실패했습니다', error);
        }
      }
    };

    fetchSlot();
  }, []);

  const hasSelection = selectedIds.length > 0;

  const handleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));

  const handleDeselect = (id: string) => setSelectedIds(prev => prev.filter(k => k !== id));

  const handleSubmit = async () => {
    const payload = {
      feedActivated: selectedIds.includes('feed'),
      waterActivated: selectedIds.includes('water'),
      walkActivated: selectedIds.includes('walk'),
      pottyActivated: selectedIds.includes('potty'),
      dentalActivated: selectedIds.includes('dental'),
      skinActivated: selectedIds.includes('skin'),
      feedAmount: Number(inputValues['feed'] ?? 0),
      waterAmount: Number(inputValues['water'] ?? 0),
      walkAmount: Number(inputValues['walk'] ?? 0),
    };

    try {
      if (isInitial) {
        await initializeSlot(selectedPetId ?? 0, payload);
      } else {
        await patchSlot(selectedPetId ?? 0, payload);
      }
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(isInitial ? '슬롯 등록 실패' : '슬롯 수정 실패');
    }
  };

  const isValid = selectedIds.every(id => {
    if (['feed', 'water', 'walk'].includes(id)) {
      const value = inputValues[id];
      return value !== undefined && value.trim() !== '' && Number(value) > 0;
    }
    return true;
  });

  const handleSkip = async () => {
    queryClient.invalidateQueries({ queryKey: ['pets'] });
    navigate('/');
  };

  return (
    <Wrapper>
      <TitleHeader
        title="루틴 설정"
        showBack={showBack}
        right={<SkipButton onClick={handleSkip}>건너뛰기</SkipButton>}
      />
      <ContentArea>
        <SlotButton selectedIds={selectedIds} onSelect={handleSelect} onDeselect={handleDeselect} />

        {!hasSelection && (
          <>
            <Notice>기록할 루틴을 선택해주세요</Notice>
            <EmptyState>
              <EmptyRoutine />
              <EmptyText>활성화 된 루틴이 없습니다</EmptyText>
            </EmptyState>
          </>
        )}

        {hasSelection && (
          <>
            <RoutineTitle>활성화된 루틴</RoutineTitle>
            <SlotInput
              selectedIds={selectedIds}
              mode="edit"
              defaultValues={defaultValues}
              onChange={setInputValues}
            />
          </>
        )}
      </ContentArea>
      <CompleteButton disabled={!hasSelection || !isValid} onClick={handleSubmit}>
        완료
      </CompleteButton>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const SkipButton = styled.button`
  white-space: nowrap;
  font-size: 14px;
  padding: 0;

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
`;

const Notice = styled.div`
  position: relative;
  display: inline-block;
  padding: 6px 12px;
  margin-top: 12px;

  font-size: 14px;
  background-color: #ffb700;
  color: white;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 20%;
    transform: translateX(-50%);
    border-width: 0 6px 6px 6px;
    border-style: solid;
    border-color: transparent transparent #ffc533 transparent;
  }
`;

const RoutineTitle = styled.div`
  margin: 30px 0;
  font-size: 18px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 100px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: #a5a5a5;
`;

const CompleteButton = styled.button<{ disabled?: boolean }>`
  height: 56px;
  margin: 16px;

  font-size: 18px;
  font-weight: 600;

  background-color: ${({ disabled }) => (disabled ? '#F0F0F0' : '#FFC533')};
  color: ${({ disabled }) => (disabled ? '#A5A5A5' : '#373737')};
  border-radius: 12px;

  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s ease;
`;
