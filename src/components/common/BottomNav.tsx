import { Home, Clock, Calendar, User, HeartPulse } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { DemoBlock } from '../DemoBlock';

export const BottomNav = () => {
  return (
    <Wrapper>
      <Inner>
        <StyledLink to="/" end>
          {({ isActive }) => (
            <>
              <Home
                size={24}
                strokeWidth={2}
                color={isActive ? '#facc15' : '#6b7280'}
                aria-hidden="true"
              />
              <Label $active={isActive}>홈</Label>
            </>
          )}
        </StyledLink>
        <StyledLink to="/alarm">
          {({ isActive }) => (
            <>
              <Clock
                size={24}
                strokeWidth={2}
                color={isActive ? '#facc15' : '#6b7280'}
                aria-hidden="true"
              />
              <Label $active={isActive}>알람</Label>
            </>
          )}
        </StyledLink>
        <StyledLink to="/calendar">
          {({ isActive }) => (
            <>
              <Calendar
                size={24}
                strokeWidth={2}
                color={isActive ? '#facc15' : '#6b7280'}
                aria-hidden="true"
              />
              <Label $active={isActive}>달력</Label>
            </>
          )}
        </StyledLink>
        <DemoBlock>
          <StyledLink to="/aireport">
            {({ isActive }) => (
              <>
                <HeartPulse
                  size={24}
                  strokeWidth={2}
                  color={isActive ? '#facc15' : '#6b7280'}
                  aria-hidden="true"
                />
                <Label $active={isActive}>AI 진단</Label>
              </>
            )}
          </StyledLink>
        </DemoBlock>
        <DemoBlock>
          <StyledLink to="/mypage">
            {({ isActive }) => (
              <>
                <User
                  size={24}
                  strokeWidth={2}
                  color={isActive ? '#facc15' : '#6b7280'}
                  aria-hidden="true"
                />
                <Label $active={isActive}>마이페이지</Label>
              </>
            )}
          </StyledLink>
        </DemoBlock>
      </Inner>
    </Wrapper>
  );
};

const Wrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 10;
`;

const Inner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 600px;
  min-width: 320px;
  margin: 0 auto;
  padding: 8px 20px;
  height: 100%;
  background-color: white;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 319px) {
    margin: 0; // 중앙정렬 해제
  }
`;

const StyledLink = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 60px;
  text-align: center;
  text-decoration: none;
  color: inherit;
`;

const Label = styled.span<{ $active: boolean }>`
  font-size: 12px;
  color: ${({ $active }) => ($active ? '#facc15' : '#6b7280')};
`;
