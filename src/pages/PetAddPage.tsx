import { useState } from 'react';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { TitleHeader } from '@/components/common/TitleHeader';
import { PetRegisterForm } from '@/components/PetRegisterForm';
import { useRegisterPet } from '@/hooks/useRegisterPet';
import { setSelectedPetId } from '@/store/petSlice';
import type { PetForm } from '@/types/pet';
import { usePetForm } from '@/hooks/usePetForm';
import { tx } from '@/styles/typography';

export const PetAddPage = () => {
  const [form, setForm] = useState<PetForm>({
    name: '',
    species: '강아지',
    gender: '남아',
    birthDate: new Date(),
  });
  const { errors, isValid, setField, onBlurField } = usePetForm(form, setForm);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, loading, error } = useRegisterPet();

  const handleRegisterClick = async () => {
    if (!isValid || loading) return;

    const petInfo = await register(form); // ✅ id 포함 결과

    if (petInfo) {
      dispatch(setSelectedPetId(petInfo.id));
      localStorage.setItem('selectedPetId', String(petInfo.id));
      navigate('/onboarding/slot');
    } else if (error) {
      alert(error);
    }
  };

  return (
    <Container>
      <TitleHeader title="반려동물 정보 입력" showBack={true} />

      <PetRegisterForm form={form} errors={errors} onChange={setField} onBlurField={onBlurField} />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <NextButton onClick={handleRegisterClick} disabled={!isValid || loading}>
        {loading ? '등록 중...' : '다음'}
      </NextButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 20px;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.color.warning[500]};
  font-size: 14px;
  margin: 8px 0;
  text-align: center;
`;

const NextButton = styled.button`
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  padding: 16px 0;
  ${tx.title('semi18')};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.main[500]};
  color: ${({ theme }) => theme.color.gray[700]};
  cursor: pointer;

  &:disabled {
    background: ${({ theme }) => theme.color.gray[100]};
    color: ${({ theme }) => theme.color.gray[400]};
    border: 1px solid ${({ theme }) => theme.color.gray[300]};
    cursor: not-allowed;
  }
`;
