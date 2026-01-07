import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getPets } from '@/apis/pet';
import { TodayBar } from '@/features/home/TodayBar';
import { Routine } from '@/features/routine/Routine';
import { setSelectedPetId } from '@/store/petSlice';
import type { RootState } from '@/store/store';
import type { PetInfo, PetListType } from '@/types/pet';
import Logo from '@/assets/icons/logo.svg?react';
import { BriefFeature } from '@/features/home/BriefFeature';
import { Tutorial } from '@/features/home/Tutorial';
import { useUnreadAlarms } from '@/hooks/useUnreadAlarms';
import { tx } from '@/styles/typography';
import { useNavigate } from 'react-router-dom';
import { toUiPetInfo } from '@/utils/transform/pet';
import { DemoBlock } from '@/components/DemoBlock';

export const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: getPets,
    staleTime: 1000 * 60 * 5,
    select: dtos =>
      dtos
        .slice()
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))
        .map(toUiPetInfo),
  });

  // redux에서 현재 선택된 petId 가져오기
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  // ✅ Home은 selectedPetId가 "이미" 세팅되어 있다는 전제.
  // 그래도 화면 깨짐 방지용 가드(상태 생성/복구 책임은 Home이 아님)
  useEffect(() => {
    if (pets.length === 0) return;
    if (selectedPetId == null) return;

    const exists = pets.some(p => p.id === selectedPetId);
    if (!exists) {
      // 세션/스토리지 불일치, 대표펫 삭제/변경 등 비정상 상황의 1회 복구
      dispatch(setSelectedPetId(pets[0].id));
    }
  }, [pets, selectedPetId, dispatch]);

  const selectedPet = pets.find((pet: PetInfo) => pet.id === selectedPetId);

  const handleSelectPet = (id: number) => {
    const pet = pets.find((p: PetListType) => p.id === id);
    if (pet) {
      dispatch(setSelectedPetId(pet.id));
    }
  };

  // ✅ 미읽음 카운트
  const { count } = useUnreadAlarms(selectedPetId ?? null);

  const today = new Date();

  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsTutorialVisible(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setIsTutorialVisible(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  return (
    <Container>
      <Header>
        <StyledLogo />
        <DemoBlock>
          <BellWrap onClick={() => navigate('/alarm/unread')} aria-label={`미읽음 알림 보기`}>
            <Bell size={24} />
            {count > 0 && <Badge>{count > 99 ? '99+' : count}</Badge>}
          </BellWrap>
        </DemoBlock>
      </Header>

      <TopSection>
        <TodayBar pets={pets} selectedPetId={selectedPetId} onSelect={handleSelectPet} />
      </TopSection>

      {selectedPet && (
        <>
          <BriefFeature petId={selectedPet.id} today={today} />

          <DemoBlock fullWidth>
            <div style={{ width: '100%' }}>
              <Routine petId={selectedPet.id} />
            </div>
          </DemoBlock>
        </>
      )}

      {isTutorialVisible && <Tutorial onClose={handleCloseTutorial} />}
    </Container>
  );
};

const Container = styled.div``;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  color: ${({ theme }) => theme.color.gray[700]};
`;

const StyledLogo = styled(Logo)`
  width: 40px;
  height: 28px;
`;

const BellWrap = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.color.gray[700]};
  cursor: pointer;
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  ${tx.body('med13')};
  color: ${({ theme }) => theme.color.white};
  border-radius: 500px;
  background: ${({ theme }) => theme.color.warning[500]};
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0 24px;
`;
