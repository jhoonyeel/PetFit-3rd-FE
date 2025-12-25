// src/pages/AlarmUnreadPage.tsx
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { TitleHeader } from '@/components/common/TitleHeader';
import { getUnreadAlarms, markAlarmRead } from '@/apis/alarm';
import type { RootState } from '@/store/store';
import type { AlarmDto, AlarmId } from '@/types/alarm.dto';
import { tx } from '@/styles/typography';

export const AlarmUnreadPage = () => {
  const petId = useSelector((s: RootState) => s.petSession.selectedPetId);
  const qc = useQueryClient();

  const queryKey = ['alarms', 'unread', petId] as const;

  const { data: alarms = [] } = useQuery({
    queryKey,
    queryFn: () => (petId == null ? Promise.resolve([]) : getUnreadAlarms(petId)),
    enabled: petId != null,
    staleTime: 0,
  });

  // ✅ 단건 읽음 처리: 성공 시에만 동기화(invalidate) – 낙관적 업데이트 없음
  const { mutate: readOnce, isPending } = useMutation({
    mutationFn: (alarmId: AlarmId) => markAlarmRead(alarmId),
    onSuccess: async () => {
      // 읽음 처리 성공 → 미읽음 목록/배지 카운트 재조회
      await Promise.all([
        qc.invalidateQueries({ queryKey }), // /alarm/unread 목록
        qc.invalidateQueries({ queryKey: ['unreadAlarms', petId] }), // 헤더 배지 카운트 훅
      ]);
    },
  });

  // 오늘 날짜 라벨
  const todayLabel = useMemo(() => formatKoreanDateLabel(new Date()), []);

  // 시간 오름차순 정렬 + 표시용 가공
  const items = useMemo(() => {
    return (alarms as AlarmDto[])
      .map(a => {
        const local = parseUtcToLocal(a.targetDateTime);
        return {
          id: a.alarmId,
          title: a.title,
          desc: a.content ?? '',
          timeLabel: formatKoreanTimeLabel(local),
          sortKey: local.getTime(),
        };
      })
      .sort((x, y) => x.sortKey - y.sortKey);
  }, [alarms]);

  const handleClickItem = (alarmId: AlarmId) => {
    if (!isPending) readOnce(alarmId);
  };

  return (
    <Wrapper>
      <TitleHeader title="지난 알림" />

      <Top>
        <DateHeading>{todayLabel}</DateHeading>
        <Notice>
          읽지 않은 알림은 <Em>30일</Em> 후 자동으로 삭제돼요.
        </Notice>
      </Top>

      <Section>
        {items.length === 0 ? (
          <Empty>미읽은 알림이 없습니다.</Empty>
        ) : (
          <List role="list">
            {items.map(a => (
              <Row key={a.id} onClick={() => handleClickItem(a.id)}>
                <Dot aria-hidden />
                <R>
                  <Left>
                    <Title>{a.title}</Title>
                    <TimeBadge>{a.timeLabel}</TimeBadge>
                  </Left>
                  <Desc>{a.desc}</Desc>
                </R>
              </Row>
            ))}
          </List>
        )}
      </Section>
    </Wrapper>
  );
};

/* -------------------- helpers -------------------- */

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

/** 서버 ISO(UTC, no Z) → 로컬 Date */
function parseUtcToLocal(isoUtcNoZ: string) {
  return new Date(`${isoUtcNoZ}Z`);
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatKoreanDateLabel(d: Date) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const wd = weekdays[d.getDay()];
  return `${y}. ${m}. ${day} (${wd})`;
}

function formatKoreanTimeLabel(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const isPM = h >= 12;
  const h12 = ((h + 11) % 12) + 1; // 0→12, 13→1
  return `${isPM ? '오후' : '오전'} ${h12}:${pad(m)}`;
}

/* -------------------- styles -------------------- */

const Wrapper = styled.div``;

const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 4px 26px 13px;
`;

const DateHeading = styled.h2`
  color: ${({ theme }) => theme.color.black};
  ${tx.body('med18')}
`;

const Notice = styled.p`
  color: ${({ theme }) => theme.color.gray[400]};
  ${tx.caption('med12')}
`;
const Em = styled.span`
  color: ${({ theme }) => theme.color.sub[500]};
  ${tx.caption('med12')}
`;

const Section = styled.section`
  padding: 0 20px 8px;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
`;

const Row = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 9px;
  padding: 10px 0;
`;

const Dot = styled.i`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.warning[500]}; /* warning500 */
`;

const R = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Left = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0; /* ellipsis 지원 */
`;

const Title = styled.div`
  color: ${({ theme }) => theme.color.gray[700]};
  ${tx.body('med16')}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TimeBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.color.gray[400]};
  background: 1px solid ${({ theme }) => theme.color.white};
  color: ${({ theme }) => theme.color.gray[400]};
  ${tx.caption('bold11')}
  white-space: nowrap;
`;

const Desc = styled.div`
  color: ${({ theme }) => theme.color.gray[400]}; /* gray400 */
  ${tx.body('med13')}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Empty = styled.p`
  margin: 24px 0;
  color: ${({ theme }) => theme.color.gray[400]};
`;
