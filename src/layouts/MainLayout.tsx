import { Outlet } from 'react-router-dom';

import { BottomNav } from '@/components/common/BottomNav';
import { ResponsiveContainer } from '@/components/common/ResponsiveContainer';
import { DemoScenarioBanner } from '@/components/common/DemoScenarioBanner';

export const MainLayout = () => {
  return (
    <ResponsiveContainer withBottomNav>
      <DemoScenarioBanner />
      <Outlet />
      <BottomNav />
    </ResponsiveContainer>
  );
};
