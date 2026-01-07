// 1) 도메인 상수(단일 소스)
export const PET_SPECIES_KO = ['강아지', '고양이', '햄스터', '조류', '어류', '파충류'] as const;
export const PET_GENDERS_KO = ['남아', '여아', '중성'] as const;

// 2) 유니온 타입 (상수에서 파생)
export type PetSpecies = (typeof PET_SPECIES_KO)[number];
export type PetGender = (typeof PET_GENDERS_KO)[number];

// 3) 도메인 모델(프론트 내부 표현)
export interface PetBase {
  name: string;
  species: PetSpecies;
  gender: PetGender;
  birthDate: Date; // 프론트는 Date 객체 유지
  isFavorite: boolean;
}

// 4) DTO (백엔드 호환: Date -> string(ISO))
export interface PetRequestDto extends Omit<PetBase, 'birthDate' | 'isFavorite'> {
  memberId: number;
  birthDate: string; // 'YYYY-MM-DD' 또는 ISO '2025-09-30'
}
export interface PetResponseDto extends Omit<PetBase, 'birthDate'> {
  id: number;
  birthDate: string; // 서버 응답도 문자열 가정
}

// 5) UI 전용 모델
export interface PetForm extends Omit<PetBase, 'isFavorite'> {}
export interface PetInfo extends PetBase {
  id: number;
}
export interface PetListType {
  id: number;
  name: string;
  isFavorite: boolean;
}

/**@deprecated */
export interface BaseFieldProps {
  label?: string;
}
