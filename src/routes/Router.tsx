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
import { StateGuard } from './StateGuard';
import { AIReportPage } from '@/pages/AIReportPage';
import { AIReportListPage } from '@/pages/AIReportListPage';
import { AIReportDetailPage } from '@/pages/AIReportDetailPage';
import { AlarmUnreadPage } from '@/pages/AlarmUnreadPage';
import { OnboardingOnly } from './OnboardingOnly';

export const router = createBrowserRouter([
  // ── Public 영역: 로그인/리다이렉트 등 ─────────────────────────────
  {
    element: <PublicRouter />, // ★ 인증 상태에 따라 /login 접근 차단
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

  // ── Private 영역: 보호 라우트 ────────────────────────────────────
  {
    element: <PrivateRouter />,
    children: [
      // 메인 섹션: memberId & selectedPetId 모두 필요
      {
        element: <StateGuard requireMemberId requireSelectedPet />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/alarm', element: <AlarmPage /> },
              { path: '/alarm/unread', element: <AlarmUnreadPage /> },
              { path: '/calendar', element: <CalendarPage /> },
              { path: '/mypage', element: <MyPage /> },
              { path: '/withdraw', element: <WithdrawPage /> },
              { path: '/edit/nickname', element: <NicknameEditPage /> },
              { path: '/manage', element: <PetManagementPage /> },
              { path: '/add/pet', element: <PetAddPage /> },
              { path: '/edit/pet/:petId', element: <PetEditPage /> },
              { path: '/aireport', element: <AIReportPage /> },
              { path: '/aireport/list', element: <AIReportListPage /> },
              { path: '/aireport/:reportId', element: <AIReportDetailPage /> },
            ],
          },
        ],
      },
      // 온보딩 섹션: memberId만 필요, selectedPetId 불필요
      {
        element: <OnboardingOnly />,
        children: [
          {
            element: <StateGuard requireMemberId requireSelectedPet={false} />,
            children: [
              {
                element: <PlainLayout />,
                children: [
                  { path: '/signup/pet', element: <SignupPetRegisterPage /> },
                  { path: '/slot', element: <SlotSettingPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
