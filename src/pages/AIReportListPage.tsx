import { TitleHeader } from '@/components/common/TitleHeader';
import styled from 'styled-components';
import { tx } from '@/styles/typography';
import type { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetById } from '@/apis/pet';
import { getReportList, deleteReport } from '@/apis/ai-report';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { DateRangePickerModal } from '@/features/ai-report/DateRangePickerModal';

export const AIReportListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteList, setDeleteList] = useState<number[]>([]);

  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);
  const { data: pet } = useQuery({
    queryKey: ['pet', selectedPetId],
    queryFn: () => getPetById(selectedPetId as number),
    enabled: selectedPetId !== null,
    staleTime: 1000 * 60 * 5,
  });
  const { data: reportList } = useQuery({
    queryKey: ['reportList', selectedPetId],
    queryFn: () => getReportList(selectedPetId as number),
    enabled: selectedPetId !== null,
    staleTime: 1000 * 60 * 5,
  });

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setDeleteList([]);
  };

  const toggleSelectReport = (reportId: number) => {
    setDeleteList(prev =>
      prev.includes(reportId) ? prev.filter(id => id !== reportId) : [...prev, reportId]
    );
  };

  const handleDeleteSelected = async () => {
    if (deleteList.length === 0) return;
    await Promise.all(deleteList.map(id => deleteReport(id)));
    setDeleteList([]);
    setIsEditMode(false);
    queryClient.invalidateQueries({ queryKey: ['reportList', selectedPetId] });
  };

  return (
    <>
      <TitleHeader title="AI 진단" />
      <Container>
        <ListHeader>
          <ListTitle>
            <Nickname>{pet?.name}</Nickname> 루틴 분석 목록
          </ListTitle>
          {reportList && reportList.length > 0 && (
            <EditButton onClick={deleteList.length > 0 ? handleDeleteSelected : toggleEditMode}>
              {isEditMode ? (deleteList.length > 0 ? '선택 삭제' : '취소') : '편집'}
            </EditButton>
          )}
        </ListHeader>

        <ListContainer>
          {reportList && reportList.length > 0 ? (
            reportList.map((report: any) => {
              const isChecked = deleteList.includes(report.aiReportId);
              return (
                <ReportItem
                  key={report.aiReportId}
                  onClick={() => !isEditMode && navigate(`/aireport/${report.aiReportId}`)}
                >
                  {isEditMode && (
                    <IconCheckbox onClick={() => toggleSelectReport(report.aiReportId)}>
                      {isChecked ? (
                        <CircleCheck size={20} color={'#373737'} />
                      ) : (
                        <CircleCheck size={20} color={'#DDDDDD'} />
                      )}
                    </IconCheckbox>
                  )}
                  <ReportContent>
                    <ReportTitle>{report.title}</ReportTitle>
                    <ReportDate>
                      기간 | {report.startDate} ~ {report.endDate}
                    </ReportDate>
                  </ReportContent>
                </ReportItem>
              );
            })
          ) : (
            <NoReportText>아직 AI 진단 보고서가 없습니다.</NoReportText>
          )}
        </ListContainer>
      </Container>

      <FloatingButton onClick={() => setOpenModal(true)}>
        <Sparkles size={16} />
        <span>AI 진단받기</span>
      </FloatingButton>

      <DateRangePickerModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

const Container = styled.div`
  margin: 16px 20px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ListTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  ${tx.title('semi18')};
`;

const Nickname = styled.div`
  ${tx.title('bold22')};
`;

const EditButton = styled.button`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[500]};
  background: none;
  border: none;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReportItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.color.gray[300]};
`;

const IconCheckbox = styled.div`
  margin-right: 12px;
  cursor: pointer;
`;

const ReportContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReportTitle = styled.div`
  ${tx.body('semi14')};
  color: ${({ theme }) => theme.color.gray[700]};
`;

const ReportDate = styled.div`
  margin-top: 4px;
  ${tx.caption('med12')};
  color: ${({ theme }) => theme.color.gray[400]};
`;

const FloatingButton = styled.button`
  display: flex;
  align-items: center;
  position: fixed;
  right: 20px;
  bottom: 80px;
  padding: 18px;
  gap: 6px;
  ${tx.body('med16')};
  border: 1px solid ${({ theme }) => theme.color.main[500]};
  border-radius: 30px;
  cursor: pointer;
  background: white;
`;

const NoReportText = styled.div`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[400]};
  text-align: center;
  padding: 20px 0;
`;
