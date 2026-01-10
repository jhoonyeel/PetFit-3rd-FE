import { useState } from 'react';

import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import styled from 'styled-components';

import { tx } from '@/styles/typography';
import { DemoBlock } from '@/components/DemoBlock';

export type BriefItem = Readonly<{ id: number; title: string }>;
export type BriefVariant = 'alarm' | 'note';

interface BriefCardProps {
  variant: BriefVariant;
  items: BriefItem[];
  loading?: boolean;
  error?: string | null;
  onAdd?: () => void;
}

// variant별 메타(라벨/컬러) — 호출부에서 따로 안 넘겨도 됨
const META: Record<BriefVariant, { label: string; color: string }> = {
  alarm: { label: '알람', color: 'var(--sub-500)' },
  note: { label: '특이사항', color: 'var(--warning-500)' },
};

const COLLAPSED_COUNT = 2;
const shouldShowToggle = (len: number) => len > COLLAPSED_COUNT;

export const BriefCard = ({ variant, items, loading, error, onAdd }: BriefCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const { label, color } = META[variant];

  const hasContent = items.length > 0;
  const showAccordion = shouldShowToggle(items.length);
  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_COUNT);

  return (
    <Card>
      <Header>
        <TitleRow>
          <ColorBar $color={color} />
          <Title>{label}</Title>
        </TitleRow>
        <DemoBlock onlyNewBlock>
          <AddButton
            type="button"
            aria-label={`${label} 추가`}
            data-testid="brief-add-button"
            // onClick 막는 건 DemoBlock이 overlay로 막음
            onClick={onAdd}
          >
            <Plus size={16} />
          </AddButton>
        </DemoBlock>
      </Header>
      <BulletList>
        {error ? (
          <ErrorMessage role="alert" data-testid="brief-status">
            {error}
          </ErrorMessage>
        ) : loading ? (
          <LoadingMessage role="status" aria-live="polite" data-testid="brief-status">
            불러오는 중...
          </LoadingMessage>
        ) : hasContent ? (
          <>
            {visibleItems.map(item => (
              <Item key={item.id} data-testid="brief-item">
                {item.title}
              </Item>
            ))}
            {showAccordion && (
              <ToggleWrap>
                <ToggleButton
                  type="button"
                  onClick={() => setExpanded(p => !p)}
                  aria-expanded={expanded}
                  aria-label={expanded ? `${label} 접기` : `${label} 더 보기`}
                  data-testid="brief-toggle"
                >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </ToggleButton>
              </ToggleWrap>
            )}
          </>
        ) : (
          <NoContent data-testid="brief-empty">{label}이 없습니다.</NoContent>
        )}
      </BulletList>
    </Card>
  );
};

const Card = styled.div`
  padding: 8px;
  background: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.12);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 3px;
`;

const TitleRow = styled.div`
  display: flex;
  gap: 10px;
`;

const ColorBar = styled.div<{ $color: string }>`
  width: 3px;
  height: 24px;
  background: ${({ $color }) => $color};
`;

const Title = styled.span`
  flex: 1;
  ${tx.body('med16')};
`;

const AddButton = styled.button`
  color: ${({ theme }) => theme.color.gray[700]};
`;

const BulletList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 5px;
`;

const ErrorMessage = styled.div`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.warning[500]};
`;

const LoadingMessage = styled.div`
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[500]};
`;

const Item = styled.li`
  position: relative;
  display: flex;
  gap: 8px;
  ${tx.body('reg14')};
  color: ${({ theme }) => theme.color.gray[700]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  --dot: 3px; /* 크기 */
  --gap: 8px; /* 텍스트 간격 */

  & {
    padding-left: calc(var(--dot) + var(--gap));
  }
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%; /* 수직정렬 미세조정 */
    width: var(--dot);
    height: var(--dot);
    border-radius: 50%;
    background: ${({ theme }) => theme.color.black}; /* 점 색 */
    transform: translateY(-50%);
  }
`;

const ToggleWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border-radius: 6px;

  &:hover {
    background: ${({ theme }) => theme.color.gray[50]};
  }
`;

const NoContent = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.gray[400]};
`;
