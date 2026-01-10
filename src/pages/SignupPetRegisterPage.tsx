import { useState } from 'react';

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { PetRegisterForm } from '@/components/PetRegisterForm';
import { useRegisterPet } from '@/hooks/useRegisterPet';
import { setSelectedPetId } from '@/store/petSlice';
import { tx } from '@/styles/typography';
import { usePetForm } from '@/hooks/usePetForm';
import { Button } from '@/ds/Button';
import { TitleHeader } from '@/components/common/TitleHeader';
import type { PetForm } from '@/types/pet';
import { ENV } from '@/constants/env';
import { initializeSlot } from '@/apis/slot';
import { DEFAULT_NEW_SLOT } from '@/mocks/demo';

export const SignupPetRegisterPage = () => {
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

  const handleNextClick = async () => {
    if (!isValid || loading) return;

    const petInfo = await register(form); // ✅ id 포함 결과
    if (!petInfo) return;

    dispatch(setSelectedPetId(petInfo.id)); // localStorage에 id만 따로 저장

    if (ENV.IS_DEMO) {
      await initializeSlot(petInfo.id, DEFAULT_NEW_SLOT);
      navigate('/');
      return;
    }

    navigate('/onboarding/slot?flow=signup');
  };

  return (
    <Container>
      <TitleHeader title="반려동물 정보 입력" />

      <PetRegisterForm form={form} errors={errors} onChange={setField} onBlurField={onBlurField} />

      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Footer>
        <Button size="lg" fullWidth disabled={!isValid || loading} onClick={handleNextClick}>
          {loading ? '등록 중...' : '다음'}
        </Button>
      </Footer>
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
  margin: 8px 0;
  text-align: center;
  color: ${({ theme }) => theme.color.warning[500]};
  ${tx.body('reg14')};
`;

const Footer = styled.div`
  margin-bottom: 24px;
`;
