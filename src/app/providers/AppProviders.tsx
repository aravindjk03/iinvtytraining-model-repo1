import React, { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProjectProvider } from '@/context/ProjectContext';

export interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ProjectProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ProjectProvider>
    </ErrorBoundary>
  );
};

export const AppProvider = AppProviders;
