import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { getPets, type PetApiResponse } from '@/apis/pet';
import { TodayBar } from '@/features/home/TodayBar';
import { Routine } from '@/features/routine/Routine';
import { setSelectedPetId } from '@/store/petSlice';
import type { RootState } from '@/store/store';
import type { PetListType } from '@/types/pet';

import Logo from '@/assets/icons/logo.svg?react';
import { BriefFeature } from '@/features/home/BriefFeature';
import { Tutorial } from '@/features/home/Tutorial';
import { useUnreadAlarms } from '@/hooks/useUnreadAlarms';
import { tx } from '@/styles/typography';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => getPets(),
    staleTime: 1000 * 60 * 5,
  });

  // 대표 동물을 맨 앞으로 설정
  const sortedPets = pets
    .slice()
    .sort((a: PetListType, b: PetListType) => Number(b.isFavorite) - Number(a.isFavorite));

  // redux에서 현재 선택된 petId 가져오기
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);
  const selectedPet = sortedPets.find((pet: PetApiResponse) => pet.id === selectedPetId);

  // selectedPetId가 대표 동물로 설정
  useEffect(() => {
    if (sortedPets.length > 0 && selectedPetId === null) {
      const firstPet = sortedPets[0];
      dispatch(setSelectedPetId(firstPet.id));
      localStorage.setItem('selectedPetId', String(firstPet.id));
    }
  }, [sortedPets, selectedPetId, dispatch]);

  const handleSelectPet = (id: number) => {
    const pet = sortedPets.find((p: PetListType) => p.id === id);
    if (pet) {
      dispatch(setSelectedPetId(pet.id));
      localStorage.setItem('selectedPetId', String(pet.id));
    }
  };

  // ✅ 미읽음 카운트
  const { count } = useUnreadAlarms(selectedPet?.id ?? null);

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
        <BellWrap onClick={() => navigate('/alarm/unread')} aria-label={`미읽음 알림 보기`}>
          <Bell size={24} />
          {count > 0 && <Badge>{count > 99 ? '99+' : count}</Badge>}
        </BellWrap>
      </Header>

      <TopSection>
        <TodayBar pets={sortedPets} selectedPetId={selectedPetId} onSelect={handleSelectPet} />
      </TopSection>

      {selectedPet && (
        <>
          <BriefFeature petId={selectedPet.id} today={today} />

          <div>
            <Routine petId={selectedPet.id} />
          </div>
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
