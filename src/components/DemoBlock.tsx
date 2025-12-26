import styled from 'styled-components';
import { ENV } from '@/constants/env';
import type { ReactNode } from 'react';

interface DemoBlockProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export const DemoBlock = ({ children, fullWidth = false }: DemoBlockProps) => {
  if (!ENV.IS_DEMO) return <>{children}</>;
  return (
    <Wrapper $fullWidth={fullWidth}>
      {children}
      <Overlay />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  display: ${({ $fullWidth }) => ($fullWidth ? 'block' : 'inline-block')};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'fit-content')};
  height: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'fit-content')};
  user-select: none; /* 데모 블록 전체에 적용 */
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
