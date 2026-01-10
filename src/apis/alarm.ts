// apis/alarm.ts
import { axiosInstance } from './axiosInstance';
import { unwrap, type ApiResponse } from '@/types/common';
import type {
  AlarmDto,
  CreateAlarmRequestDto,
  UpdateAlarmRequestDto,
  AlarmId,
} from '@/types/alarm.dto';

/**
 * 1) 알람 생성: POST /alarms/{petId}
 */
export const createAlarm = async (
  petId: number,
  body: CreateAlarmRequestDto
): Promise<AlarmDto> => {
  const res = await axiosInstance.post<ApiResponse<AlarmDto>>(`/alarms/${petId}`, body);
  return unwrap(res.data);
};

/**
 * 2) 알람 수정: PATCH /alarms/{alarmId}
 */
export const updateAlarm = async (
  alarmId: AlarmId,
  body: UpdateAlarmRequestDto
): Promise<AlarmDto> => {
  const res = await axiosInstance.patch<ApiResponse<AlarmDto>>(`/alarms/${alarmId}`, body);
  return unwrap(res.data);
};

/**
 * 3) 알람 삭제: DELETE /alarms/{alarmId}
 */
export const deleteAlarm = async (alarmId: AlarmId): Promise<string> => {
  const res = await axiosInstance.delete<ApiResponse<string>>(`/alarms/${alarmId}`);
  return unwrap(res.data);
};

/**
 * 4) 알람 전체 목록 조회: GET /alarms/{petId}
 */
export const getAllAlarms = async (petId: number): Promise<AlarmDto[]> => {
  const res = await axiosInstance.get<ApiResponse<AlarmDto[]>>(`/alarms/${petId}`);
  return unwrap(res.data);
};

/**
 * 5) 알람 단건 읽음 처리: PATCH /alarms/{alarmId}/read
 */
export const markAlarmRead = async (alarmId: AlarmId): Promise<void> => {
  await axiosInstance.patch(`/alarms/${alarmId}/read`);
};

/**
 * 6) 읽지 않은 알람 목록 조회: GET /alarms/{petId}/unread
 */
export const getUnreadAlarms = async (petId: number): Promise<AlarmDto[]> => {
  const res = await axiosInstance.get<ApiResponse<AlarmDto[]>>(`/alarms/${petId}/unread`);
  return unwrap(res.data);
};

/**
 * 7) SSE 구독: GET /alarms/{petId}/subscribe (text/event-stream)
 *    - 브라우저에서 EventSource 사용
 *    - 쿠키 인증이면 withCredentials: true 필요
 *    - axios로는 SSE를 다루기 까다로우므로 분리
 */
export const subscribeAlarms = (petId: number): EventSource => {
  const rawBase = import.meta.env.VITE_BACKEND_URL;
  if (!rawBase) throw new Error('VITE_BACKEND_URL이 비어 있습니다.');

  // 디렉터리로 인식되도록 끝에 슬래시 보장
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  // 상대 경로를 안전하게 결합 (중복/누락 슬래시 자동 정리)
  const url = new URL(`alarms/${petId}/subscribe`, base).toString();

  return new EventSource(url, { withCredentials: true });
};
