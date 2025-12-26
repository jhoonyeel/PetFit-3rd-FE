import { unwrap, type ApiResponse } from '@/types/common';
import type { PetForm, PetGender, PetInfo, PetSpecies } from '@/types/pet';
import { formatDate } from '@/utils/calendar';

import { axiosInstance } from './axiosInstance';

export interface PetApiResponse {
  id: number;
  name: string;
  type: PetSpecies;
  gender: PetGender;
  birthDate: string; // ISO-8601 문자열
  isFavorite: boolean;
}

export const getPets = async (): Promise<PetApiResponse[]> => {
  const response = await axiosInstance.get<ApiResponse<PetApiResponse[]>>(`/pets`);
  return unwrap(response.data);
};

// 상세 조회 API
export const getPetById = async (petId: number): Promise<PetApiResponse> => {
  const res = await axiosInstance.get<ApiResponse<PetApiResponse>>(`/pets/${petId}`);
  return unwrap(res.data);
};

export const registerPet = async (memberId: number, form: PetForm): Promise<PetInfo> => {
  const payload = {
    memberId,
    name: form.name,
    type: form.species,
    gender: form.gender,
    birthDate: formatDate(form.birthDate), // string (YYYY-MM-DD)
    isFavorite: true,
  };

  const res = await axiosInstance.post<ApiResponse<PetApiResponse>>('/pets', payload);
  const dto = unwrap(res.data);

  // ✅ API 응답 → 내부 도메인 타입으로 가공
  const petInfo: PetInfo = {
    id: dto.id,
    name: dto.name,
    species: dto.type, // API는 type, 내부는 species
    gender: dto.gender,
    birthDate: new Date(dto.birthDate),
    isFavorite: dto.isFavorite,
  };

  return petInfo;
};

export const putPetsInfo = async (petId: number, memberId: number | null, form: PetForm) => {
  const payload = {
    memberId,
    name: form.name,
    type: form.species,
    gender: form.gender,
    birthDate: formatDate(form.birthDate), // string (YYYY-MM-DD)
  };

  await axiosInstance.put(`pets/${petId}`, payload);
};

export const putFavorite = async (petId: number) => {
  await axiosInstance.put('pets/favorites', {
    petId: petId,
    isFavorite: true,
  });
};

export const deletePet = async (petId: number) => {
  await axiosInstance.delete(`pets/${petId}`);
};
