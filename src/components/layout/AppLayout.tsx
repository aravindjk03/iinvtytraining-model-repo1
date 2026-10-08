import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/navigation';
import { WorkshopDisclaimer } from '@/components/common/WorkshopDisclaimer';
import { useSidebar } from '@/hooks/useSidebar';
import { useProjectOptional } from '@/context/ProjectContext';

const routeTitleMap: Record<string, string> = {
  '/': 'Platform Dashboard',
  '/build': 'Build Your Safety AI',
  '/teach': 'Teach Your Safety AI',
  '/train': 'Train Safety Model',
  '/test': 'Test Model Accuracy',
  '/challenge': 'Challenge & Stress Test',
  '/improve': 'Improve Your Safety AI',
  '/my-ai': 'My AI Safety System',
  '/project/new': 'Create AI Project',
};

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const projectContext = useProjectOptional();
  const {
    isCollapsed,
    isMobileOpen,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
  } = useSidebar();

  // Section 50: Route Protection — if no active project exists, redirect to /project/new
  if (
    !projectContext?.project?.id &&
    location.pathname !== '/project/new' &&
    location.pathname !== '/start'
  ) {
    return <Navigate to="/project/new" replace />;
  }

  // Handle dynamic /project/:id routes
  let currentTitle = routeTitleMap[location.pathname];
  if (!currentTitle) {
    if (location.pathname.startsWith('/project/')) {
      currentTitle = 'Project Overview';
    } else {
      currentTitle = 'Page Not Found';
    }
  }

  return (
    <div className="flex h-screen w-full bg-surface-subtle overflow-hidden font-sans">
      {/* Sidebar navigation with 6 Journey Stages & Project Status Panel */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      {/* Main app viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Header bar with dynamic project context & engine indicator */}
        <Header
          pageTitle={currentTitle}
          onOpenMobile={toggleMobile}
          onOpenMobileMenu={toggleMobile}
        />

        {/* Content canvas */}
        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 focus:outline-none"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children || <Outlet />}
          </div>
        </main>

        {/* Persistent Workshop Disclaimer Footer */}
        <WorkshopDisclaimer />
      </div>
    </div>
  );
};

export const ApplicationShell = AppLayout;
