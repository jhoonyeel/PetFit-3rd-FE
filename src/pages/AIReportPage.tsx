import { useEffect, useState } from 'react';
import { TitleHeader } from '@/components/common/TitleHeader';
import Dog from '@/assets/icons/dog.svg?react';
import styled from 'styled-components';
import { tx } from '@/styles/typography';
import type { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getPetById } from '@/apis/pet';
import { DateRangePickerModal } from '@/features/ai-report/DateRangePickerModal';
import { getReportList } from '@/apis/ai-report';
import { useNavigate } from 'react-router-dom';

export const AIReportPage = () => {
  const navigate = useNavigate();
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  const { data: pet } = useQuery({
    queryKey: ['pet', selectedPetId],
    queryFn: () => getPetById(selectedPetId as number),
    enabled: selectedPetId !== null,
    staleTime: 1000 * 60 * 5,
  });

  const [openModal, setOpenModal] = useState(false);

  const { data: reportList, isFetched } = useQuery({
    queryKey: ['aiReports', selectedPetId],
    queryFn: () => getReportList(selectedPetId ?? 0),
    enabled: !!selectedPetId,
  });

  useEffect(() => {
    if (reportList && reportList.length > 0) {
      navigate('/aireport/list');
    }
  }, [reportList, navigate]);
  if (!isFetched) return null;
  if (reportList && reportList.length > 0) return null;

  return (
    <Container>
      <TitleHeader title="AI 진단" />
      <DescContainer>
        <DescSub>행동분석부터 꿀팁까지!</DescSub>
        <DescMain>{pet?.name}의 건강상태</DescMain>
        <DescMain>루틴으로 점검하세요</DescMain>
      </DescContainer>

      <Dog />
      <ReportButton onClick={() => setOpenModal(true)}>AI 진단받기</ReportButton>

      <DateRangePickerModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const DescContainer = styled.div`
  text-align: center;
  margin: 60px 0;
`;

const DescSub = styled.div`
  margin: 8px 0;
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.main[600]};
`;

const DescMain = styled.div`
  ${tx.title('semi18')};
  color: ${({ theme }) => theme.color.gray[700]};
`;

const ReportButton = styled.button`
  position: fixed;
  bottom: 80px;
  border-radius: 12px;
  width: 335px;
  height: 56px;
  ${tx.title('semi18')};
  background-color: ${({ theme }) => theme.color.main[500]};
`;
