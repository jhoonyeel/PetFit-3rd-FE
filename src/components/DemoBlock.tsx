import styled from 'styled-components';
import { ENV } from '@/constants/env';

export const DemoBlock = ({ children }: React.PropsWithChildren) => {
  return (
    <Wrapper>
      {children}
      {ENV.IS_DEMO && <Overlay />}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  pointer-events: none;
  user-select: none; /* 데모 블록 전체에 적용 */
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(119, 119, 119, 0.8); /* #777777cc 근사값 */
  border-radius: 8px;
  pointer-events: all; /* 오버레이가 이벤트를 먹어 자식 클릭 차단 */
`;
