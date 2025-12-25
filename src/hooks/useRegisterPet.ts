// hooks/useRegisterPet.ts
import { useState } from 'react';

import { useSelector } from 'react-redux';

import { registerPet } from '@/apis/pet';
import type { RootState } from '@/store/store';
import type { PetForm, PetInfo } from '@/types/form';
import { handleAxiosError } from '@/utils/handleAxiosError';

interface UseRegisterPetResult {
  register: (form: PetForm) => Promise<PetInfo | null>;
  loading: boolean;
  error: string | null;
}

/**
 * 반려동물 등록 훅
 * - registerPet API 호출
 * - 에러/로딩 상태 관리
 * - PetInfo 반환
 */
export const useRegisterPet = (): UseRegisterPetResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const memberId = useSelector((s: RootState) => s.user.memberId);

  const register = async (form: PetForm): Promise<PetInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const isNumber = (v: number | null): v is number => typeof v === 'number';
      if (!isNumber(memberId)) throw new Error('memberId가 없습니다.');

      const petInfo = await registerPet(memberId, form); // ✅ PetInfo 직접 반환
      return petInfo;
    } catch (err) {
      const message = handleAxiosError(err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};
