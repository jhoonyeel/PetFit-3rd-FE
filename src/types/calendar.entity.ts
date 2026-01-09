// types/calendar.entity.ts
// 앱 내부(비즈니스/캐시)에서 쓰는 식별자 포함 모델 (Date 유지)

import type { NoteBase } from './calendar.base';

export interface NoteEntity extends NoteBase {
  id: number; // remarkId
  remarkDate: Date; // date-only
}

export interface MonthlyEntryEntity {
  entryDate: Date; // date-only
  completed: boolean;
  memo: boolean;
  remarked: boolean;
}

export interface DailyEntryEntity {
  entryDate: Date; // date-only
  notes: NoteEntity[]; // remarks
  // routines: 별도 도메인으로 관리(필요 시 routine.entity로 매핑)
}
