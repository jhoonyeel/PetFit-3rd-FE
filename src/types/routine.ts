import { SLOT_ITEMS } from '@/constants/slot';

export type SlotId = (typeof SLOT_ITEMS)[number]['id'];
export type RoutineStatus = 'CHECKED' | 'MEMO' | 'UNCHECKED';

export interface Routine {
  id: SlotId;
  category: string;
  status: RoutineStatus;
  targetAmount: number | string;
  actualAmount?: number | null;
  content: string | null;
  date: string;
}

// 네이밍 통일 필요
export const ROUTINE_STATUS = ['CHECKED', 'MEMO', 'UNCHECKED'] as const;
export type RoutineStatusDto = (typeof ROUTINE_STATUS)[number]; // "CHECKED" | "MEMO" | "UNCHECKED"

export const SLOT_IDS = ['feed', 'water', 'walk', 'potty', 'dental', 'skin'] as const;
export type RoutineSlotKey = (typeof SLOT_IDS)[number]; // 'feed' | 'water' | ...

export interface RoutineDto {
  routineId: number; // 서버 식별자
  category: string; // ex) "feed" (서버에서 string)
  status: RoutineStatusDto;
  targetAmount: number;
  actualAmount: number;
  content: string;
  date: string; // 'YYYY-MM-DD'
}

export interface UiRoutine {
  id: number;
  slotKey: RoutineSlotKey; // ✅ UI 슬롯 종류(아이콘/라벨 매핑 키)
  status: RoutineStatusDto;
  targetAmount: number;
  actualAmount?: number | null;
  content: string | null;
  date: string;
}
