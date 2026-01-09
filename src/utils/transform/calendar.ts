import { CALENDAR_LEGEND_ORDER } from '@/constants/calendar';
import type {
  DailyEntryDto,
  MonthlyEntryDto,
  RemarkCreateDto,
  RemarkDto,
  RemarkUpdateDto,
} from '@/types/calendar.dto';
import type { UiCalendarMarksByDate, UiCalendarMarkType, UiNote } from '@/types/calendar.ui';
import { formatDate } from '../calendar';
import type { DailyEntryEntity, MonthlyEntryEntity, NoteEntity } from '@/types/calendar.entity';
import type { NoteForm } from '@/types/calendar.base';

// 월간 DTO -> UI 마킹 (scheduled 제외)
export function toUiCalendarMarks(entries: MonthlyEntryDto[]): UiCalendarMarksByDate {
  if (!entries?.length) return {};
  const marks: UiCalendarMarksByDate = {};

  for (const e of entries) {
    const flags: Record<UiCalendarMarkType, boolean> = {
      completed: e.completed,
      memo: e.memo,
      note: e.remarked,
    };
    const types = (CALENDAR_LEGEND_ORDER as readonly UiCalendarMarkType[]).filter(k => flags[k]);

    if (types.length) {
      marks[e.entryDate] = types;
    }
  }
  return marks;
}

const parseYmd = (yyyyMmDd: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd);
  if (!m) throw new Error(`Invalid date string: ${yyyyMmDd}`);
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
};

/* ───────────── DTO → Entity ───────────── */
export const toMonthlyEntryEntity = (dto: MonthlyEntryDto): MonthlyEntryEntity => ({
  entryDate: parseYmd(dto.entryDate),
  completed: dto.completed,
  memo: dto.memo,
  remarked: dto.remarked,
});

export const toNoteEntity = (dto: RemarkDto): NoteEntity => ({
  id: dto.remarkId,
  title: dto.title,
  content: dto.content,
  remarkDate: parseYmd(dto.remarkDate),
});

export const toDailyEntryEntity = (dto: DailyEntryDto): DailyEntryEntity => ({
  entryDate: parseYmd(dto.entryDate),
  notes: dto.remarkResponseList.map(toNoteEntity),
  // routines: routine.transform에서 별도 처리(필요 시)
});

/* ───────────── Entity → UI ───────────── */
export const toUiNote = (e: NoteEntity): UiNote => ({
  id: e.id,
  title: e.title,
  content: e.content,
});

/* ───────────── Form/Model ⇄ Request DTO ───────────── */
// 생성: 폼 + 대상 날짜 전달
export const toRemarkCreateDto = (form: NoteForm, date: Date): RemarkCreateDto => ({
  title: form.title,
  content: form.content,
  remarkDate: formatDate(date), // 'YYYY-MM-DD'
});

// 수정: 날짜 제외
export const toRemarkUpdateDto = (form: NoteForm): RemarkUpdateDto => ({
  title: form.title,
  content: form.content,
});
