import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { getPetById } from '@/apis/pet';
import type { PetListType } from '@/types/pet';
import { tx } from '@/styles/typography';

type Props = {
  pets: PetListType[];
  selectedPetId: number | null;
  onSelect: (id: number) => void;
};

export const TodayBar = ({ pets, selectedPetId, onSelect }: Props) => {
  // 선택된 펫 이름
  const selected = useMemo(
    () => pets.find(p => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  // D+ 계산은 상세에 생일이 필요할 수 있어 단건 조회 유지
  const { data: petDetail } = useQuery({
    queryKey: ['pet', selectedPetId],
    queryFn: () => getPetById(selectedPetId as number),
    enabled: selectedPetId !== null,
    staleTime: 1000 * 60 * 5,
  });

  const parseISODate = (iso?: string | null) => {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };
  const toYMD = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const today = new Date();
  const birth = parseISODate(petDetail?.birthDate);
  const diffDays =
    birth != null
      ? Math.max(0, Math.floor((toYMD(today).getTime() - toYMD(birth).getTime()) / 86400000))
      : null;

  const dDayText = diffDays == null ? 'D —' : `D+ ${diffDays}`;
  const nameText = selected?.name ?? '대표이름';

  // ▼ 드롭다운 상태/바깥 클릭
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  return (
    <Wrapper ref={wrapRef}>
      <LeftGroup>
        <Name>{nameText}</Name>
        <DDay>{dDayText}</DDay>
      </LeftGroup>

      <IconButton
        type="button"
        aria-label={open ? '펫 선택 닫기' : '펫 선택 열기'}
        onClick={() => setOpen(v => !v)}
      >
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </IconButton>

      {open && (
        <Dropdown role="menu" aria-label="펫 선택">
          {pets.map(p => (
            <Row
              key={p.id}
              role="menuitem"
              aria-selected={p.id === selectedPetId}
              onClick={() => {
                if (p.id !== selectedPetId) onSelect(p.id);
                setOpen(false);
              }}
            >
              <RowText $selected={p.id === selectedPetId}>{p.name}</RowText>
            </Row>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
};

/* ===== styles ===== */

const Wrapper = styled.div`
  position: relative; /* dropdown anchor */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const LeftGroup = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
`;

const Name = styled.span`
  ${tx.title('bold22')};
  color: ${({ theme }) => theme.color.gray[800]};
`;

const DDay = styled.span`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[500]};
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.gray[700]};
  padding: 4px;
  line-height: 0;
  cursor: pointer;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  right: 20px; /* 버튼 기준 오른쪽 정렬 */
  width: 160px;
  background: ${({ theme }) => theme.color.white};
  border-radius: 4px;
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 20;
  padding: 2px 0;

  > li + li {
    border-top: 1px solid ${({ theme }) => theme.color.gray[200]};
  }
`;

const Row = styled.li`
  padding: 4px 8px;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.color.gray[50]};
  }
`;

const RowText = styled.div<{ $selected: boolean }>`
  ${tx.body('med16')}
  text-align: right; /* 스크린샷처럼 우측 정렬 */
  color: ${({ theme, $selected }) => ($selected ? theme.color.main[500] : theme.color.gray[700])};
`;
