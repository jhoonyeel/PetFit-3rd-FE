import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { router } from './routes/Router';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import { AlarmSseBridge } from './features/alarm/AlarmSseBridge';
import { ToastProvider } from './ds/ToastProvider';
import { AuthBootstrap } from './routes/AuthBootstrap';
import { ENV } from './constants/env';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <GlobalStyle />
        <AuthBootstrap />
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
