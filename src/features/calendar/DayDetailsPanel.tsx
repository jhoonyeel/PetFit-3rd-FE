import { useRef } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { fetchDailyEntries } from '@/apis/calendar';
import type { RootState } from '@/store/store';
import { formatDate } from '@/utils/calendar';

import { RoutineList } from './RoutineList';
import { NotesFeature } from './NotesFeature';
import { tx } from '@/styles/typography';
import type { UiNote } from '@/types/calendar.ui';
import { toNoteEntity, toUiNote } from '@/utils/transform/calendar';
import { toUiRoutine } from '@/utils/transform/routine';
import type { NotesFeatureHandle } from './NotesFeature';
import { DemoBlock } from '@/components/DemoBlock';

interface DayDetailsPanelProps {
  selectedDate: Date;
}

export const DayDetailsPanel = ({ selectedDate }: DayDetailsPanelProps) => {
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);
  const formattedDate = formatDate(selectedDate); // 'YYYY-MM-DD'

  // ✅ 일간 특이사항 + 루틴 조회 API 호출
  const { data } = useQuery({
    queryKey: ['dailyEntries', selectedPetId, formattedDate],
    queryFn: () => {
      if (selectedPetId === null) throw new Error('No pet selected');
      return fetchDailyEntries(selectedPetId, formattedDate);
    },
    enabled: selectedPetId !== null,
    staleTime: 0,
    select: resp => {
      const notes: UiNote[] = (resp.remarkResponseList ?? []).map(toNoteEntity).map(toUiNote);

      const routines = (resp.routineResponseList ?? [])
        .map(r => ({
          ...toUiRoutine(r),
          id: r.routineId ?? `${r.category}-${r.date}`, // key 안정화
        }))
        .filter(Boolean);

      return { notes, routines };
    },
  });

  // ✅ 자식 메서드 호출을 위한 ref
  const remarksRef = useRef<NotesFeatureHandle>(null);
  const handleAddNote = () => remarksRef.current?.openCreate(); // ✅ 부모 버튼 → 자식 모달 오픈

  return (
    <Wrapper>
      <MarginBottom>
        <SectionTitle>하루 루틴</SectionTitle>
        <DemoBlock onlyNewBlock>
          <SectionAction onClick={handleAddNote}>특이사항 추가</SectionAction>
        </DemoBlock>
      </MarginBottom>

      <Section role="region" aria-label="하루 루틴">
        {/* ✅ 프레젠테이션 전용: 데이터만 전달 */}
        <RoutineList routines={data?.routines ?? []} />

        {/* ✅ CRUD/모달은 NoteSection이 관리 (조회 데이터만 주입) */}
        <NotesFeature
          key={`notes-${selectedPetId ?? -1}-${formattedDate}`}
          ref={remarksRef}
          petId={selectedPetId ?? -1}
          selectedDate={selectedDate}
          notes={data?.notes ?? []}
        />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 0;
`;

const MarginBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Section = styled.section`
  padding: 0 20px;
`;

const SectionTitle = styled.span`
  color: #434343;
  font-family: Pretendard;
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 140%; /* 1.575rem */
  letter-spacing: -0.02813rem;
`;

const SectionAction = styled.button`
  color: #797979;
  ${tx.body('med13')};
`;
