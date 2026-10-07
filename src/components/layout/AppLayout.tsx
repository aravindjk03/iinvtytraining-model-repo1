import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, Header } from '@/components/navigation';
import { useSidebar } from '@/hooks/useSidebar';

const routeTitleMap: Record<string, string> = {
  '/': 'Platform Dashboard',
  '/build': 'Build Your Safety AI',
  '/teach': 'Teach Your Safety AI',
  '/train': 'Train Safety Model',
  '/test': 'Test Model Accuracy',
  '/challenge': 'Challenge & Stress Test',
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
  } = useSidebar();

  const currentTitle = routeTitleMap[location.pathname] || 'Page Not Found';

  return (
    <div className="flex h-screen w-full bg-surface-subtle overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      {/* Main app viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header bar */}
        <Header
          pageTitle={currentTitle}
          onOpenMobile={toggleMobile}
          onOpenMobileMenu={toggleMobile}
        />

        {/* Content canvas */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 focus:outline-none"
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
