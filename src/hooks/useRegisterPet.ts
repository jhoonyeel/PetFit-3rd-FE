// hooks/useRegisterPet.ts
import { useState } from 'react';
import { registerPet } from '@/apis/pet';
import type { PetForm, PetInfo } from '@/types/pet';
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

  const register = async (form: PetForm): Promise<PetInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const petInfo = await registerPet(form); // ✅ PetInfo 직접 반환
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
