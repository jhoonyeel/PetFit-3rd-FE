import type { PetApiResponse } from '@/apis/pet';
import type { PetInfo } from '@/types/pet';

export const toUiPetInfo = (dto: PetApiResponse): PetInfo => ({
  id: dto.id,
  name: dto.name,
  species: dto.type,
  gender: dto.gender,
  birthDate: new Date(dto.birthDate),
  isFavorite: dto.isFavorite,
});
