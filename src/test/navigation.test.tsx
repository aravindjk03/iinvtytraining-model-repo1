import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { ProjectProvider } from '@/context/ProjectContext';

function renderRoute(path: string, initialActiveModel?: import('@/types/training').ModelMetadata | null) {
  return render(
    <ProjectProvider initialActiveModel={initialActiveModel}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ProjectProvider>
  );
}

const mockActiveModel: import('@/types/training').ModelMetadata = {
  modelId: 'test-model-yolo26-01',
  modelName: 'Safety Model YOLO26n',
  trainedAt: '2026-10-07T00:00:00Z',
  epochs: 20,
  metrics: {
    precision: 0.94,
    recall: 0.91,
    map50: 0.92,
    map50_95: 0.77,
  },
};

describe('Application Routing & Pages', () => {
  it('renders Dashboard at root route with prominent title and workflow cards', () => {
    renderRoute('/');

    expect(screen.getByRole('heading', { name: /AI SAFETY BUILDER/i })).toBeInTheDocument();
    expect(screen.getByText(/BUILD • TEACH • TRAIN • TEST • BREAK • IMPROVE/i)).toBeInTheDocument();
    expect(screen.getAllByText('PROJECT STATUS')[0]).toBeInTheDocument();
    expect(screen.getByText('01 BUILD')).toBeInTheDocument();
    expect(screen.getByText('02 TEACH')).toBeInTheDocument();
    expect(screen.getByText('03 TRAIN')).toBeInTheDocument();
    expect(screen.getByText('04 TEST')).toBeInTheDocument();
    expect(screen.getByText('05 CHALLENGE')).toBeInTheDocument();
    expect(screen.getByText('06 IMPROVE')).toBeInTheDocument();
  });

  it('renders /build route with active Workflow Builder canvas and palette', () => {
    renderRoute('/build');

    expect(screen.getByRole('heading', { level: 1, name: /BUILD YOUR SAFETY AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Component Palette/i)).toBeInTheDocument();
    expect(screen.getAllByText(/STARTER WORKFLOW/i)[0]).toBeInTheDocument();
  });

  it('renders /teach route with active Dataset Classes and project definition', () => {
    renderRoute('/teach');

    expect(screen.getByRole('heading', { level: 1, name: /TEACH YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Safety Problem Definition/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Safety Dataset Classes/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Your Data Matters/i)).toBeInTheDocument();
  });

  it('renders /train route with Training Dispatch and compute targets', () => {
    renderRoute('/train');

    expect(screen.getByRole('heading', { level: 1, name: /TRAIN YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Compute & Engine Target/i)).toBeInTheDocument();
    expect(screen.getByText(/Training teaches the model patterns from your dataset/i)).toBeInTheDocument();
  });

  it('renders /test route unready state when no model has been trained', () => {
    renderRoute('/test', null);

    expect(screen.getByRole('heading', { level: 1, name: /TEST YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Train a Model Before Testing/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Train Module/i })).toBeInTheDocument();
  });

  it('renders /test route with Inference Viewport when active model exists', () => {
    renderRoute('/test', mockActiveModel);

    expect(screen.getByRole('heading', { level: 1, name: /TEST YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Safety Inspection Viewport/i)).toBeInTheDocument();
    expect(screen.getByText(/Decision vs Prediction Summary/i)).toBeInTheDocument();
  });

  it('renders /challenge route unready state when no model has been trained', () => {
    renderRoute('/challenge', null);

    expect(screen.getByRole('heading', { level: 1, name: /BREAK YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Train a Model Before Starting the Challenge/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Train Module/i })).toBeInTheDocument();
  });

  it('renders /challenge route with Adversarial Stress Test Suite when active model exists', () => {
    renderRoute('/challenge', mockActiveModel);

    expect(screen.getByRole('heading', { level: 1, name: /BREAK YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. Select Adversarial Plant Condition/i)).toBeInTheDocument();
    expect(screen.getByText(/Challenge Log/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage for invalid route paths and displays Page Not Found in header', () => {
    renderRoute('/non-existent-route');

    expect(screen.getByText(/404 — Route Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Industrial Pipeline Segment Undefined/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Return to Dashboard/i })).toBeInTheDocument();
  });
});
