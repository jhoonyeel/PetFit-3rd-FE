import { useState } from 'react';
import type { RootState } from '@/store/store';

import styled from 'styled-components';
import { tx } from '@/styles/typography';

import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { BaseModal } from '@/components/common/BaseModal';
import { CustomDateRangePicker } from '@/components/CustomDateRangePicker';
import { createReport } from '@/apis/ai-report';
import { AIReportLoadingModal } from './AIReportLoadingModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DateRangePickerModal = ({ isOpen, onClose }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const petId = useSelector((s: RootState) => s.petSession.selectedPetId);

  // 보고서 생성 요청
  const { mutate: generateReport } = useMutation({
    mutationFn: async () => {
      if (!petId || !range.startDate || !range.endDate) throw new Error('필수 정보 누락');
      const start = range.startDate.toISOString().split('T')[0];
      const end = range.endDate.toISOString().split('T')[0];

      return await createReport(petId, start, end);
    },
    onSuccess: data => {
      setIsLoadingModalOpen(false);
      onClose();
      queryClient.invalidateQueries({ queryKey: ['reportList', selectedPetId] });
      navigate(`/aireport/${data.aiReportId}`);
    },
    onError: (error: any) => {
      console.error('AI 보고서 생성 실패:', error);
      setIsLoadingModalOpen(false);
    },
  });

  // 제출 시 로딩 모달 띄우고, 보고서 생성 요청 보내기
  const handleSubmit = () => {
    setIsLoadingModalOpen(true);
    generateReport();
  };

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <Header>
          <h2>AI 진단받기</h2>
          <Close onClick={onClose}>✕</Close>
        </Header>

        <PickerWrapper>
          <CustomDateRangePicker
            fieldLabel="기간"
            startDate={range.startDate}
            endDate={range.endDate}
            onChange={setRange}
            withYearSelect
          />
        </PickerWrapper>

        <SubmitButton disabled={!range.startDate || !range.endDate} onClick={handleSubmit}>
          진단하기
        </SubmitButton>
      </BaseModal>
      <AIReportLoadingModal isOpen={isLoadingModalOpen} />
    </>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;

  h2 {
    flex: 1;
    text-align: center;
    ${tx.title('semi18')}
  }
`;

const Close = styled.button`
  font-size: 20px;
`;

const PickerWrapper = styled.div`
  margin-top: 12px;
`;

const SubmitButton = styled.button`
  margin-top: 12px;
  width: 100%;
  height: 56px;
  ${tx.title('semi18')};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.color.main[500]};
  color: ${({ theme }) => theme.color.gray[700]};

  &:disabled {
    background-color: ${({ theme }) => theme.color.gray[100]};
    color: ${({ theme }) => theme.color.gray[400]};
  }
`;
