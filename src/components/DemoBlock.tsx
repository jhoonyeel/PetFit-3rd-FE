import styled from 'styled-components';
import { ENV } from '@/constants/env';
import type { ReactNode } from 'react';

interface DemoBlockProps {
  children: ReactNode;
  fullWidth?: boolean;
  navItem?: boolean;
}

export const DemoBlock = ({ children, fullWidth = false, navItem = false }: DemoBlockProps) => {
  if (!ENV.IS_DEMO) return <>{children}</>;
  return (
    <Wrapper $fullWidth={fullWidth} $navItem={navItem}>
      {children}
      <Overlay />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ $fullWidth: boolean; $navItem: boolean }>`
  position: relative;
  user-select: none; /* 데모 블록 전체에 적용 */

  display: ${({ $fullWidth }) => ($fullWidth ? 'block' : 'inline-block')};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'fit-content')};
  height: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'fit-content')};

  /* ✅ BottomNav 전용: Wrapper가 flex item이어야 폭이 균등하게 나옴 */
  ${({ $navItem }) =>
    $navItem
      ? `
    display: flex;
    flex: 1;
    max-width: 60px;      /* StyledLink와 동일 */
    flex-direction: column;
    align-items: center;
    width: auto;          /* fullWidth/fit-content 영향 제거 */
    height: 100%;         /* nav 높이(60px) 기준으로 덮게 */
  `
      : ``}
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(119, 119, 119, 0.8); /* #777777cc 근사값 */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.06) 0px,
    rgba(0, 0, 0, 0.06) 6px,
    rgba(0, 0, 0, 0) 6px,
    rgba(0, 0, 0, 0) 12px
  );
  pointer-events: auto;
  cursor: not-allowed;
`;
