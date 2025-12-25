import styled from 'styled-components';

import type { PetListType } from '@/types/pet';

interface NameTagBarProps {
  names: PetListType[];
  selectedPetId: number | null;
  onSelect: (id: number) => void;
}

export const NameTagBar = ({ names, selectedPetId, onSelect }: NameTagBarProps) => {
  return (
    <Wrapper>
      <Inner>
        {names.map(({ id, name, isFavorite }) => (
          <Tag
            key={id}
            onClick={() => onSelect(id)}
            $isSelected={selectedPetId === id}
            $isMain={isFavorite}
          >
            {name}
          </Tag>
        ))}
      </Inner>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  overflow-x: auto;
  padding: 0 20px;

  /* 스크롤바 감추기 (선택사항) */
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    height: 0; /* Chrome, Safari */
  }

  /* hover 시 스크롤바 나타남 */
  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #999;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  /* 모바일에서 스크롤 가능하게 설정 */
  -webkit-overflow-scrolling: touch;

  cursor: grab;
`;

const Inner = styled.div`
  display: flex;
  gap: 12px;
  white-space: nowrap;
`;

const Tag = styled.div<{ $isMain?: boolean; $isSelected?: boolean }>`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 700 : 400)};
  color: ${({ $isSelected }) => ($isSelected ? '#333' : '#999')};
  border: ${({ $isSelected }) => ($isSelected ? '2px solid #FACC15' : 'none')};
  background-color: ${({ $isSelected }) => ($isSelected ? '#fff' : 'transparent')};
`;
