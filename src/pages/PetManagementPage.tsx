import React from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { getPets, putFavorite } from '@/apis/pets';
import { TitleHeader } from '@/components/common/TitleHeader';
import { setSelectedPetId } from '@/store/petSlice';
import type { PetListType } from '@/types/pets';
import { tx } from '@/styles/typography';

export const PetManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: pets = [] } = useQuery({
    queryKey: ['pets'],
    queryFn: () => getPets(),
    refetchOnMount: 'always',
    select: data => [...data].sort((a, b) => a.id - b.id),
  });

  const favoriteMutation = useMutation({
    mutationFn: (petId: number) => putFavorite(petId),
    onSuccess: (_, petId) => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      const pet = pets.find((p: PetListType) => p.id === petId);
      if (pet) {
        dispatch(setSelectedPetId(pet.id));
        localStorage.setItem('selectedPetId', String(petId));
      }
    },
  });

  return (
    <Container>
      <TitleHeader title="반려동물 정보 관리" showBack={true} />

      <CardList>
        {pets.map(p => (
          <PetItem key={p.id}>
            <button onClick={() => navigate(`/edit/pet/${p.id}`)}>{p.name}</button>
            <button onClick={() => favoriteMutation.mutate(p.id)}>
              {p.isFavorite ? (
                <Star color="#FFC533" fill="#FFC533" />
              ) : (
                <Star strokeWidth={1.25} color="#FFC533" />
              )}
            </button>
          </PetItem>
        ))}
        <AddPetButton onClick={() => navigate('/add/pet')}>
          <Plus size={20} />
          반려동물 추가
        </AddPetButton>
      </CardList>
    </Container>
  );
};

const Container = styled.div`
  margin: 20px;
`;
const CardList = styled.div`
  display: grid;
  gap: 12px;
`;

const Item = styled.div`
  display: flex;
  border-radius: 16px;
  border-width: 1px;
  padding: 16px 20px;
  border: 1px solid var(--main-500);
  ${tx.body('semi14')};
`;

const PetItem = styled(Item)`
  justify-content: space-between;
`;

const AddPetButton = styled(Item)`
  justify-content: center;
  cursor: pointer;
  gap: 3px;
`;
