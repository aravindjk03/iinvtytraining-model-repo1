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

export const routesConfig: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
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
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="build" element={<BuildPage />} />
        <Route path="teach" element={<TeachPage />} />
        <Route path="train" element={<TrainPage />} />
        <Route path="test" element={<TestPage />} />
        <Route path="challenge" element={<ChallengePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
