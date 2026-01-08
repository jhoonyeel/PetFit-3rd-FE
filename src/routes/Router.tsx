import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { PlainLayout } from '@/layouts/PlainLayout';
import { AuthLoginRedirectPage } from '@/pages/AuthLoginRedirectPage';
import { AuthLogoutRedirectPage } from '@/pages/AuthLogoutRedirectPage';
import { AlarmPage } from '@/pages/AlarmPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { MyPage } from '@/pages/MyPage';
import { NicknameEditPage } from '@/pages/NicknameEditPage';
import { PetAddPage } from '@/pages/PetAddPage';
import { PetEditPage } from '@/pages/PetEditPage';
import { PetManagementPage } from '@/pages/PetManagementPage';
import { SignupPetRegisterPage } from '@/pages/SignupPetRegisterPage';
import { SlotSettingPage } from '@/pages/SlotSettingPage';
import { WithdrawPage } from '@/pages/WithdrawPage';
import { PrivateRouter } from './PrivateRouter';
import { PublicRouter } from './PublicRouter';
import { AIReportPage } from '@/pages/AIReportPage';
import { AIReportListPage } from '@/pages/AIReportListPage';
import { AIReportDetailPage } from '@/pages/AIReportDetailPage';
import { AlarmUnreadPage } from '@/pages/AlarmUnreadPage';
import { OnboardingOnly } from './OnboardingOnly';

export const router = createBrowserRouter([
  // Public: unauthenticated 전용
  {
    element: <PublicRouter />,
    children: [
      {
        element: <PlainLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/oauth/redirect', element: <AuthLoginRedirectPage /> },
          { path: '/auth/kakao/logout/dev', element: <AuthLogoutRedirectPage /> },
        ],
      },
    ],
  },

  // Private 앱 쉘: 로그인된 상태 전용
  {
    element: <PrivateRouter />,
    children: [
      // 온보딩 트리: status === 'onboarding'만 소속
      {
        path: '/onboarding',
        element: <OnboardingOnly />,
        children: [
          {
            element: <PlainLayout />,
            children: [
              { path: 'pet', element: <SignupPetRegisterPage /> },
              { path: 'slot', element: <SlotSettingPage /> },
            ],
          },
        ],
      },

      // 앱 기능 트리: status === 'authenticated'만 소속
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'alarm', element: <AlarmPage /> },
          { path: 'alarm/unread', element: <AlarmUnreadPage /> },
          { path: 'calendar', element: <CalendarPage /> },
          { path: 'mypage', element: <MyPage /> },
          { path: 'withdraw', element: <WithdrawPage /> },
          { path: 'edit/nickname', element: <NicknameEditPage /> },
          { path: 'manage', element: <PetManagementPage /> },
          { path: 'add/pet', element: <PetAddPage /> },
          { path: 'edit/pet/:petId', element: <PetEditPage /> },
          { path: 'aireport', element: <AIReportPage /> },
          { path: 'aireport/list', element: <AIReportListPage /> },
          { path: 'aireport/:reportId', element: <AIReportDetailPage /> },
        ],
      },
    ],
  },
]);
