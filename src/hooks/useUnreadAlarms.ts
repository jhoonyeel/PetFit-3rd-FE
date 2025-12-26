// src/features/alarm/useUnreadAlarms.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUnreadAlarms, subscribeAlarms } from '@/apis/alarm';
import { ENV } from '@/constants/env';

export const useUnreadAlarms = (petId: number | null) => {
  const qc = useQueryClient();

  const enabled = !ENV.IS_DEMO && petId != null;

  const { data: unread = [], isFetching } = useQuery({
    queryKey: ['unreadAlarms', petId],
    queryFn: () => (petId == null ? Promise.resolve([]) : getUnreadAlarms(petId)),
    enabled, // ✅ DEMO면 쿼리 자체가 실행 안 됨
    staleTime: 0, // 최신성 우선
    refetchOnWindowFocus: true,
  });

  // SSE로 실시간 갱신
  useEffect(() => {
    if (!enabled) return; // ✅ DEMO면 SSE 연결 자체가 없음
    const es = subscribeAlarms(petId);

    const invalidate = () => qc.invalidateQueries({ queryKey: ['unreadAlarms', petId] });

    es.onmessage = invalidate; // 서버에서 일반 이벤트 전송 시
    es.addEventListener('created', invalidate);
    es.addEventListener('updated', invalidate);
    es.addEventListener('deleted', invalidate);
    es.onerror = () => {
      // 네트워크/인증 오류 시 자동 재연결되므로 별도 처리 없음
      // 필요 시 es.close();
    };

    return () => es.close();
  }, [petId, qc]);

  const count = unread.length;
  return { count, unread, isFetching };
};
