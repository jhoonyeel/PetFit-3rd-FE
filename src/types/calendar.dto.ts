// types/calendar.dto.ts
// 백엔드 DTO (문자열 기반 직렬화)

import type { RoutineDto } from './routine';

// 월간 엔트리 DTO (BE 응답 그대로)
export interface MonthlyEntryDto {
  entryDate: string; // 'YYYY-MM-DD'
  completed: boolean; // 루틴 완료 여부
  memo: boolean; // 메모 존재 여부
  remarked: boolean; // 특이사항 존재 여부
}

// 일간 상세 조회 DTO
export interface DailyEntryDto {
  entryDate: string; // 'YYYY-MM-DD'
  remarkResponseList: RemarkDto[];
  routineResponseList: RoutineDto[];
}

// 특이사항(remark) DTO
export interface RemarkDto {
  remarkId: number;
  title: string;
  content: string;
  remarkDate: string; // 'YYYY-MM-DD'
}

// 등록/수정 요청 바디
export interface RemarkCreateDto {
  title: string;
  content: string;
  remarkDate: string; // 'YYYY-MM-DD'
}
export type RemarkUpdateDto = Pick<RemarkCreateDto, 'title' | 'content'>;
