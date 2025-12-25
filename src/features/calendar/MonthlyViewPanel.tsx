import { useQueries } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { fetchMonthlyEntries } from '@/apis/calendar';
import { CALENDAR_LEGEND, CALENDAR_LEGEND_ORDER } from '@/constants/calendar';
import { MonthView } from '@/features/calendar/MonthView';
import type { RootState } from '@/store/store';
import type { UiCalendarMarksByDate } from '@/types/calendar.ui';
import { getMonthNumber, getSurroundingMonths, getYear } from '@/utils/calendar';
import { useMemo, useState } from 'react';
import { tx } from '@/styles/typography';
import { toUiCalendarMarks } from '@/utils/transform/calendar';
import type { MonthlyEntryDto } from '@/types/calendar.dto';

interface MonthlyViewPanelProps {
  selectedDate: Date;
  onDateClick: (date: Date) => void;
}

export const MonthlyViewPanel = ({ selectedDate, onDateClick }: MonthlyViewPanelProps) => {
  // ✅ 로컬 뷰 상태(현재 보고 있는 월)
  const [viewMonth, setViewMonth] = useState<Date>(new Date(selectedDate));
  const selectedPetId = useSelector((s: RootState) => s.petSession.selectedPetId);

  // ✅ 주변 3개월(이전/현재/다음) 키 생성 — viewMonth 기준
  const formattedMonths = useMemo(() => getSurroundingMonths(viewMonth), [viewMonth]);

  const results = useQueries({
    queries: formattedMonths.map(month => ({
      queryKey: ['monthlyEntries', selectedPetId, month],
      queryFn: () => fetchMonthlyEntries(selectedPetId ?? -1, month),
      enabled: !!selectedPetId,
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
    })),
  });

  // DTO 합치기
  const allEntries: MonthlyEntryDto[] = results.flatMap(r => r.data ?? []);

  // ✅ 매퍼로 UI 마킹 생성
  const calendarMarks: UiCalendarMarksByDate = useMemo(
    () => toUiCalendarMarks(allEntries),
    [allEntries]
  );

  const handleClickPrevMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    setViewMonth(d);
  };

  const handleClickNextMonth = () => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    setViewMonth(d);
  };

  return (
    <>
      {/* 달력 뷰 영역 */}
      <CalendarMonthWrapper>
        <MonthToolbar aria-label="월 탐색">
          <IconBtn type="button" aria-label="이전 달" onClick={handleClickPrevMonth}>
            <ChevronLeft size={16} />
          </IconBtn>
          <MonthTitle>{`${getYear(viewMonth)}년 ${getMonthNumber(viewMonth)}월`}</MonthTitle>
          <IconBtn type="button" aria-label="다음 달" onClick={handleClickNextMonth}>
            <ChevronRight size={16} />
          </IconBtn>
        </MonthToolbar>

        <MonthView
          viewDate={viewMonth}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          calendarMarks={calendarMarks}
        />

        {/* 범례 영역 */}
        <LegendRow>
          {CALENDAR_LEGEND_ORDER.map(key => (
            <LegendItem key={key}>
              <Dot $color={CALENDAR_LEGEND[key].color} />
              <LegendLabel>{CALENDAR_LEGEND[key].label}</LegendLabel>
            </LegendItem>
          ))}
        </LegendRow>
      </CalendarMonthWrapper>
    </>
  );
};

const CalendarMonthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px;
`;

const MonthToolbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.color.gray[700]};
`;

const MonthTitle = styled.h2`
  ${tx.body('med16')};
  color: ${({ theme }) => theme.color.gray[700]};
`;

const LegendRow = styled.div`
  display: flex;
  padding-left: 12px;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.div<{ $color: string }>`
  width: 4px;
  height: 4px;
  background-color: ${({ $color }) => $color};
  border-radius: 50%;
`;

const LegendLabel = styled.span`
  ${tx.caption('med12')};
  color: ${({ theme }) => theme.color.gray[600]};
`;
