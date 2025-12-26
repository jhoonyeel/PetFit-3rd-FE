export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  content: T | null;
}

/** 필수 데이터 언랩(실패/빈 content는 예외로 강제) */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success) {
    throw new Error(`[${res.code}] ${res.message}`);
  }
  if (res.content == null) {
    throw new Error(`[${res.code}] EMPTY_CONTENT`);
  }
  return res.content;
}

/** Optional API용: null을 허용하며 통과 */
export function unwrapNullable<T>(res: ApiResponse<T>): T | null {
  if (!res.success) {
    throw new Error(`[${res.code}] ${res.message}`);
  }
  return res.content;
}
