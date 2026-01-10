import styled from 'styled-components';
import { ENV } from '@/constants/env';
import type { ReactNode } from 'react';
import type { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

interface DemoBlockProps {
  children: ReactNode;
  onlyNewBlock?: boolean;
  onlyExistingBlock?: boolean;
  fullWidth?: boolean;
  navItem?: boolean;
}

export const DemoBlock = ({
  children,
  onlyNewBlock = false,
  onlyExistingBlock = false,
  fullWidth = false,
  navItem = false,
}: DemoBlockProps) => {
  const scenario = useSelector((s: RootState) => s.auth.scenario); // 'new' | 'existing' | undefined

  // ❌ 잘못된 사용 방지. 발생할 수 없는 상황. 정책 비즈니스 오류.
  if (onlyNewBlock && onlyExistingBlock) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('DemoBlock: onlyNewBlock and onlyExistingBlock cannot be used together.');
    }
  }

  const shouldBlock =
    ENV.IS_DEMO &&
    ((!onlyNewBlock && !onlyExistingBlock) || // ✅ 기본: 항상 차단
      (onlyNewBlock && scenario === 'new') ||
      (onlyExistingBlock && scenario === 'existing'));

  if (!shouldBlock) {
    return <>{children}</>;
  }
  return (
    <Wrapper $fullWidth={fullWidth} $navItem={navItem}>
      {children}
      <Overlay aria-hidden />
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
