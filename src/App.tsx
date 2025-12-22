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

const AppInitializer = () => {
  const dispatch = useDispatch();
  const authStatus = useSelector((s: RootState) => s.auth.status);

  useEffect(() => {
    // 로그인 상태일 때만 selectedPetId 캐시 복원 (불필요한 오염 방지)
    if (authStatus === 'authenticated' || authStatus === 'onboarding') {
      const storedPetId = localStorage.getItem('selectedPetId');
      if (storedPetId) {
        dispatch(setSelectedPetId(Number(storedPetId)));
      }
    }
  }, [dispatch, authStatus]);

  return null;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <GlobalStyle />
        <AuthBootstrap />
        <AppInitializer />
        <AlarmSseBridge />
        <div style={{ position: 'fixed', top: 0, left: 0, background: 'yellow', zIndex: 99999 }}>
          APP_RENDER_OK
        </div>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
