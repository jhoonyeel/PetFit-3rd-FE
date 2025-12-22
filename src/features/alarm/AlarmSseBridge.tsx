// src/features/alarm/AlarmSseBridge.tsx
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeAlarms } from '@/apis/alarm';
import type { RootState } from '@/store/store';
import { sseConnecting, sseOpen, sseEvent, sseError, sseClosed } from '@/store/sseSlice';
import { showAlert, useToast } from '@/ds/ToastProvider';
import type { AlarmDto } from '@/types/alarm.dto';

export function AlarmSseBridge() {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const toast = useToast();
  const petId = useSelector((s: RootState) => s.selectedPet.id);
  const authStatus = useSelector((s: RootState) => s.auth.status);

  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    // ✅ authenticated가 아니면 SSE 금지 (onboarding 포함)
    if (authStatus !== 'authenticated' || petId == null) {
      cleanup();
      return;
    }
    connect(petId);
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  const cleanup = () => {
    closedRef.current = true;
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      dispatch(sseClosed());
    }
  };

  const invalidate = (pid: number) => {
    qc.invalidateQueries({ queryKey: ['unreadAlarms', pid] });
    qc.invalidateQueries({ queryKey: ['alarms', 'unread', pid] });
  };

  // ISO(UTC, no Z) → '오전/오후 h:mm'
  const toTimeLabel = (isoNoZ: string) => {
    const d = new Date(`${isoNoZ}Z`);
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    const h = d.getHours();
    const m = d.getMinutes();
    const pm = h >= 12;
    const h12 = ((h + 11) % 12) + 1;
    return `${pm ? '오후' : '오전'} ${h12}:${pad(m)}`;
  };

  const connect = (pid: number) => {
    cleanup();
    closedRef.current = false;

    dispatch(sseConnecting({ petId: pid }));
    const es = subscribeAlarms(pid);
    esRef.current = es;

    es.onopen = () => {
      console.log('open'); // ✅ 요청 로그
      retryRef.current = 0;
      dispatch(sseOpen());
    };

    // 서버가 보내는 event: alarm (payload = AlarmDto)
    const onAlarm = (dataStr: string | null) => {
      dispatch(sseEvent());
      invalidate(pid);
      if (!dataStr) return;

      try {
        const a: AlarmDto = JSON.parse(dataStr);
        if (!a?.alarmId || !a?.targetDateTime) return;

        showAlert(toast)({
          id: `alarm-${a.alarmId}`, // 동일 알람 재도착 시 치환
          time: toTimeLabel(a.targetDateTime),
          content: a.title ?? '알림',
          duration: 60_000, // 60초 TTL
          // onConfirm: () => markAlarmRead(a.alarmId) // 필요 시 즉시 읽음 처리
        });
      } catch {
        // heartbeat 등 비-JSON은 무시
      }
    };

    // 명시적 타입 이벤트
    es.addEventListener('alarm', (e: MessageEvent) => {
      console.log('msg', e.data); // ✅ 요청 로그
      onAlarm(e.data);
    });

    // 기본 message 이벤트도 커버
    es.onmessage = e => {
      console.log('msg', e.data); // ✅ 요청 로그
      onAlarm(e.data);
    };

    es.onerror = () => {
      console.warn('error', es.readyState); // ✅ 요청 로그
      dispatch(sseError({ message: 'SSE disconnected' }));
      // 백오프 재연결
      const delay = Math.min(30000, 1000 * 2 ** retryRef.current++);
      es.close();
      esRef.current = null;
      if (!closedRef.current) {
        setTimeout(() => connect(pid), delay);
      }
    };
  };

  return null;
}
