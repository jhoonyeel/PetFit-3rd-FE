import { useEffect, useRef, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { deletePet, getPetById, putPetsInfo } from '@/apis/pet';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TitleHeader } from '@/components/common/TitleHeader';
import { PetRegisterForm } from '@/components/PetRegisterForm';
import type { RootState } from '@/store/store';
import { tx } from '@/styles/typography';
import type { PetForm, PetGender, PetSpecies } from '@/types/pet';
import { usePetForm } from '@/hooks/usePetForm';
import { BaseModal } from '@/components/common/BaseModal';

export const PetEditPage = () => {
  const { petId } = useParams<{ petId: string }>();
  const id = Number(petId);

  const memberId = useSelector((state: RootState) => state.user.memberId);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PetForm>({
    name: '',
    species: '강아지',
    gender: '남아',
    birthDate: new Date(),
  });
  const { errors, isValid, setField, onBlurField } = usePetForm(form, setForm);

  useEffect(() => {
    if (!id) navigate('/pet-management', { replace: true });
  }, [id, navigate]);

  const { data: initialForm, isLoading } = useQuery({
    queryKey: ['petDetail', id],
    enabled: !!id,
    queryFn: () => getPetById(id),
    select: d => {
      const dt = d?.birthDate ? new Date(d.birthDate) : new Date();
      return {
        name: d?.name ?? '',
        species: (d?.type as PetSpecies) ?? '강아지',
        gender: (d?.gender as PetGender) ?? '남아',
        birthDate: isNaN(dt.getTime()) ? new Date() : dt,
      } as PetForm;
    },
  });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && initialForm) {
      setForm(initialForm);
      initializedRef.current = true;
    }
  }, [initialForm]);

  // 수정
  const { mutate: editPet, isPending: isEditing } = useMutation({
    mutationFn: () => putPetsInfo(Number(petId)!, memberId, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['petDetail', id] });
      navigate(-1);
    },
  });

  const handleSave = () => {
    if (!isValid) return;
    editPet();
  };

  // 삭제
  const { mutate: removePet, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePet(Number(petId)!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['petList'] });
      navigate('/manage', { replace: true });
    },
  });

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const openDeleteModal = () => setDeleteModalOpen(true);
  const closeDeleteModal = () => setDeleteModalOpen(false);

  const handleDeleteConfirm = () => {
    removePet();
    closeDeleteModal();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container>
      <TitleHeader title="반려동물 정보 수정" showBack={true} />

      <PetRegisterForm form={form} errors={errors} onChange={setField} onBlurField={onBlurField} />
      <ButtonContainer>
        <DeleteButton onClick={openDeleteModal} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제'}
        </DeleteButton>
        <NextButton onClick={handleSave} disabled={!isValid || isEditing}>
          {isEditing ? '수정 중...' : '저장'}
        </NextButton>
      </ButtonContainer>

      <BaseModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Message>정말 반려동물 정보를 삭제하시겠어요?</Message>
        <ButtonRow>
          <CancelButton onClick={closeDeleteModal}>취소</CancelButton>
          <ConfirmButton onClick={handleDeleteConfirm}>삭제</ConfirmButton>
        </ButtonRow>
      </BaseModal>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 20px;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 75px;
  left: 20px;
  right: 20px;

  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 0;
  height: 56px;
  border-radius: 12px;
  ${tx.title('semi18')};
  cursor: pointer;
`;

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.color.gray[100]};
  color: ${({ theme }) => theme.color.gray[400]};
  border: 1px dashed ${({ theme }) => theme.color.gray[300]};
`;

const NextButton = styled(Button)`
  background: ${({ theme }) => theme.color.main[500]};
  color: ${({ theme }) => theme.color.gray[700]};

  &:disabled {
    background: ${({ theme }) => theme.color.gray[100]};
    color: ${({ theme }) => theme.color.gray[400]};
    border: 1px solid ${({ theme }) => theme.color.gray[300]};
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  ${tx.body('med16')};
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  ${tx.body('reg14')};

  color: ${({ theme }) => theme.color.gray[400]};
  background: ${({ theme }) => theme.color.gray[100]};
  border-radius: 6px;
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  ${tx.body('reg14')};

  color: ${({ theme }) => theme.color.gray[700]};
  background: ${({ theme }) => theme.color.main[500]};
  border-radius: 6px;
`;
