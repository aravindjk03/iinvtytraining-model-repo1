/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Routes, Route, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { BuildPage } from '@/pages/Build/BuildPage';
import { TeachPage } from '@/pages/Teach/TeachPage';
import { TrainPage } from '@/pages/Train/TrainPage';
import { TestPage } from '@/pages/Test/TestPage';
import { ChallengePage } from '@/pages/Challenge/ChallengePage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';
import { StartPage } from '@/pages/Start/StartPage';
import { NewProjectPage } from '@/pages/Project/NewProjectPage';
import { ImprovePage } from '@/pages/Improve/ImprovePage';
import { MyAIPage } from '@/pages/MyAI/MyAIPage';

export const routesConfig: RouteObject[] = [
  // Standalone onboarding route (no application shell)
  {
    path: '/start',
    element: <StartPage />,
  },
  // Application Shell routes (Primary participant experience)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'project/new',
        element: <NewProjectPage />,
      },
      {
        path: 'project/:id',
        element: <DashboardPage />,
      },
      {
        path: 'build',
        element: <BuildPage />,
      },
      {
        path: 'teach',
        element: <TeachPage />,
      },
      {
        path: 'train',
        element: <TrainPage />,
      },
      {
        path: 'test',
        element: <TestPage />,
      },
      {
        path: 'challenge',
        element: <ChallengePage />,
      },
      {
        path: 'improve',
        element: <ImprovePage />,
      },
      {
        path: 'my-ai',
        element: <MyAIPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routesConfig);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Start Screen */}
      <Route path="/start" element={<StartPage />} />

      {/* Main Application Shell */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="project/new" element={<NewProjectPage />} />
        <Route path="project/:id" element={<DashboardPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="teach" element={<TeachPage />} />
        <Route path="train" element={<TrainPage />} />
        <Route path="test" element={<TestPage />} />
        <Route path="challenge" element={<ChallengePage />} />
        <Route path="improve" element={<ImprovePage />} />
        <Route path="my-ai" element={<MyAIPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
