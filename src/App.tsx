import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { router } from './routes/Router';
import { setSelectedPetId } from './store/petSlice';
import { GlobalStyle } from './styles/GlobalStyle';
import type { RootState } from './store/store';
import { theme } from './styles/theme';
import { AlarmSseBridge } from './features/alarm/AlarmSseBridge';
import { ToastProvider } from './ds/ToastProvider';
import { AuthBootstrap } from './routes/AuthBootstrap';
import { ENV } from './constants/env';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((s: RootState) => s.auth.status);

  useEffect(() => {
    // ✅ authenticated일 때만 펫ID 복원 (onboarding은 복원 대상 아님)
    if (authStatus === 'authenticated') {
      const storedPetId = localStorage.getItem('selectedPetId'); // ✅ SSOT 키
      if (storedPetId) {
        const id = Number(storedPetId);
        if (!Number.isNaN(id)) {
          dispatch(setSelectedPetId(id)); // id 전용 저장 reducer 사용
        }
      }
    }
  }, [authStatus, dispatch]);

  return null;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <GlobalStyle />
        <AuthBootstrap />
        <AppInitializer />
        {!ENV.IS_DEMO && <AlarmSseBridge />}
        <div style={{ position: 'fixed', top: 0, left: 0, background: 'yellow', zIndex: 99999 }}>
          APP_RENDER_OK
        </div>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
