import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { ProjectProvider } from '@/context/ProjectContext';
import { EngineStatusIndicator } from '@/components/navigation/EngineStatusIndicator';
import { ProjectStatusPanel } from '@/components/navigation/ProjectStatusPanel';
import type { ProjectSidebarStatus, EngineConnectionState } from '@/types';

function renderApp(
  path: string = '/',
  options?: {
    initialProject?: import('@/types').Project | null;
    initialWorkflow?: import('@/types').SerializableWorkflow | null;
    initialActiveModel?: import('@/types').ModelMetadata | null;
  }
) {
  return render(
    <ProjectProvider
      initialProject={options?.initialProject}
      initialWorkflow={options?.initialWorkflow}
      initialActiveModel={options?.initialActiveModel}
    >
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ProjectProvider>
  );
}

describe('Phase 1 — Application Shell & Journey Acceptance Tests', () => {
  // Test 1: Application shell renders
  it('Test 1: Application shell renders primary layout regions', () => {
    renderApp('/build');

    expect(screen.getByRole('navigation', { name: /Journey Stages/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Project Status Panel/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo', { name: /Workshop educational safety disclaimer/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Test 2: Header displays application title
  it('Test 2: Header displays application title', () => {
    renderApp('/');

    expect(screen.getAllByText('AI SAFETY BUILDER').length).toBeGreaterThanOrEqual(1);
  });

  // Test 3: Project name comes from project state
  it('Test 3: Project name comes from project state and appears in Header', () => {
    renderApp('/build');

    // Default project name from ProjectContext is "Helmet Safety Detection"
    expect(screen.getAllByText('Helmet Safety Detection').length).toBeGreaterThanOrEqual(1);
  });

  // Test 4: Journey navigation renders all six stages
  it('Test 4: Journey navigation renders all six stages in order', () => {
    renderApp('/build');

    const nav = screen.getByRole('navigation', { name: /Journey Stages/i });
    expect(nav).toHaveTextContent('Build');
    expect(nav).toHaveTextContent('01');
    expect(nav).toHaveTextContent('Teach');
    expect(nav).toHaveTextContent('02');
    expect(nav).toHaveTextContent('Train');
    expect(nav).toHaveTextContent('03');
    expect(nav).toHaveTextContent('Test');
    expect(nav).toHaveTextContent('04');
    expect(nav).toHaveTextContent('Challenge');
    expect(nav).toHaveTextContent('05');
    expect(nav).toHaveTextContent('Improve');
    expect(nav).toHaveTextContent('06');
  });

  // Test 5: Current stage is visibly identified
  it('Test 5: Current stage is visibly identified in the sidebar', () => {
    renderApp('/build');

    const buildLink = screen.getByRole('link', { name: /Stage 01: Build/i });
    expect(buildLink).toHaveClass('bg-brand-primary');
    expect(buildLink).toHaveClass('text-white');
  });

  // Test 6: Completed stage is accessible
  it('Test 6: Completed stage remains accessible and clickable', () => {
    renderApp('/teach');

    // On /teach, Stage 01 Build is completed and remains accessible
    const buildLink = screen.getByRole('link', { name: /Stage 01.*Build/i });
    expect(buildLink).not.toHaveAttribute('aria-disabled', 'true');
    expect(buildLink).toHaveAttribute('href', '/build');
  });

  // Test 7: Locked stage cannot be entered when prerequisite is false
  it('Test 7: Locked stage cannot be entered when prerequisite is unsatisfied', () => {
    renderApp('/build');

    // Without an active trained model, Stage 04 Test is locked
    const testLink = screen.getByRole('link', { name: /Stage 04.*Test.*Locked/i });
    expect(testLink).toHaveAttribute('aria-disabled', 'true');

    // Clicking a locked stage does not navigate
    fireEvent.click(testLink);
    // User remains on /build
    expect(screen.getByRole('heading', { level: 1, name: /BUILD YOUR SAFETY AI/i })).toBeInTheDocument();
  });

  // Test 8: Project status panel renders real un-fabricated values
  it('Test 8: Project status panel renders real status without fake metrics', () => {
    const freshStatus: ProjectSidebarStatus = {
      projectName: 'Test Plant Safety AI',
      workflowStatus: 'NOT_STARTED',
      datasetStatus: 'NOT_STARTED',
      modelStatus: 'NO_MODEL',
      engineStatus: 'OFFLINE',
      lastTrainingRun: 'None',
      activeModelId: 'None',
    };

    render(<ProjectStatusPanel status={freshStatus} />);

    expect(screen.getByText('Test Plant Safety AI')).toBeInTheDocument();
    expect(screen.getAllByText('Not started')).toHaveLength(2); // Workflow & Dataset
    expect(screen.getByText('No model')).toBeInTheDocument();
    expect(screen.getByText('○ Offline')).toBeInTheDocument();
    expect(screen.getAllByText('None')).toHaveLength(2); // Last training & Active model
  });

  // Test 9: Engine status renders distinguishable states
  it('Test 9: Engine status renders distinguishable states for all 5 values', () => {
    const states: EngineConnectionState[] = ['CONNECTED', 'OFFLINE', 'CONNECTING', 'ERROR', 'UNKNOWN'];

    states.forEach((st) => {
      const { unmount } = render(<EngineStatusIndicator state={st} />);
      if (st === 'CONNECTED') {
        expect(screen.getByText(/●/)).toBeInTheDocument();
        expect(screen.getByText(/CONNECTED/)).toBeInTheDocument();
      } else if (st === 'OFFLINE') {
        expect(screen.getByText(/○/)).toBeInTheDocument();
        expect(screen.getByText(/OFFLINE/)).toBeInTheDocument();
      } else if (st === 'CONNECTING') {
        expect(screen.getByText(/◌/)).toBeInTheDocument();
        expect(screen.getByText(/CONNECTING/)).toBeInTheDocument();
      } else if (st === 'ERROR') {
        expect(screen.getByText(/▲/)).toBeInTheDocument();
        expect(screen.getByText(/ERROR/)).toBeInTheDocument();
      } else if (st === 'UNKNOWN') {
        expect(screen.getByText(/\?/)).toBeInTheDocument();
        expect(screen.getByText(/NOT CONNECTED/)).toBeInTheDocument();
      }
      unmount();
    });
  });

  // Test 10: Workshop disclaimer is present across the shell
  it('Test 10: Persistent workshop disclaimer is present in the footer', () => {
    renderApp('/build');

    expect(
      screen.getByText('Workshop model only — not for production safety control')
    ).toBeInTheDocument();
  });

  // Test 11: Routes resolve correctly
  it('Test 11: Dedicated routes resolve correctly', () => {
    // /start route (standalone onboarding)
    const { unmount: unmountStart } = renderApp('/start');
    expect(screen.getByText('BUILD YOUR FIRST SAFETY AI')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'START' })).toBeInTheDocument();
    unmountStart();

    // /project/new route
    const { unmount: unmountNew } = renderApp('/project/new');
    expect(screen.getAllByText('Create AI Project').length).toBeGreaterThanOrEqual(1);
    unmountNew();

    // /improve route
    const { unmount: unmountImprove } = renderApp('/improve');
    expect(screen.getByRole('heading', { name: /06 IMPROVE/i })).toBeInTheDocument();
    unmountImprove();

    // /my-ai route
    const { unmount: unmountMyAi } = renderApp('/my-ai');
    expect(screen.getAllByRole('heading', { name: /MY AI SAFETY SYSTEM/i }).length).toBeGreaterThanOrEqual(1);
    unmountMyAi();
  });

  // Test 12: Shell remains usable on smaller viewport
  it('Test 12: Shell supports responsive sidebar toggle', () => {
    renderApp('/');

    const mobileToggleBtn = screen.getByRole('button', { name: /Open navigation sidebar/i });
    expect(mobileToggleBtn).toBeInTheDocument();

    // Trigger open
    fireEvent.click(mobileToggleBtn);

    // Close button appears
    const closeBtn = screen.getByRole('button', { name: /Close navigation sidebar/i });
    expect(closeBtn).toBeInTheDocument();

    // Trigger close
    fireEvent.click(closeBtn);
  });

  // Test 13: Section 38 Navigation state machine verification
  it('Test 13: Section 38 — when currentStep is BUILD with incomplete workflow, all subsequent stages are locked; when currentStep is TEACH, BUILD is completed and remains accessible', () => {
    // Case A: Workflow is not complete (empty nodes)
    const emptyWorkflow: import('@/types').SerializableWorkflow = {
      version: '1.0',
      projectId: 'proj-test',
      nodes: [],
      connections: [],
      metadata: { updatedAt: new Date().toISOString() },
    };
    const { unmount: unmountA } = renderApp('/build', {
      initialWorkflow: emptyWorkflow,
    });

    // BUILD is CURRENT
    const buildLinkA = screen.getByRole('link', { name: /Stage 01: Build/i });
    expect(buildLinkA).toHaveClass('bg-brand-primary');

    // All subsequent 5 stages are LOCKED
    const teachLinkA = screen.getByRole('link', { name: /Stage 02.*Teach.*Locked/i });
    expect(teachLinkA).toHaveAttribute('aria-disabled', 'true');

    const trainLinkA = screen.getByRole('link', { name: /Stage 03.*Train.*Locked/i });
    expect(trainLinkA).toHaveAttribute('aria-disabled', 'true');

    const testLinkA = screen.getByRole('link', { name: /Stage 04.*Test.*Locked/i });
    expect(testLinkA).toHaveAttribute('aria-disabled', 'true');

    const challengeLinkA = screen.getByRole('link', { name: /Stage 05.*Challenge.*Locked/i });
    expect(challengeLinkA).toHaveAttribute('aria-disabled', 'true');

    const improveLinkA = screen.getByRole('link', { name: /Stage 06.*Improve.*Locked/i });
    expect(improveLinkA).toHaveAttribute('aria-disabled', 'true');

    unmountA();

    // Case B: Completed workflow on /teach -> BUILD is COMPLETED and accessible, TEACH is CURRENT
    const { unmount: unmountB } = renderApp('/teach');

    const teachLinkB = screen.getByRole('link', { name: /Stage 02: Teach/i });
    expect(teachLinkB).toHaveClass('bg-brand-primary');

    const buildLinkB = screen.getByRole('link', { name: /Stage 01.*Build.*Completed/i });
    expect(buildLinkB).not.toHaveAttribute('aria-disabled', 'true');
    expect(buildLinkB).toHaveAttribute('href', '/build');

    unmountB();
  });

  // Test 14: Section 50 Route protection when no project exists
  it('Test 14: Section 50 — Route protection redirects to /project/new when no active project exists', () => {
    // When initialProject has no id (empty/null)
    renderApp('/build', {
      initialProject: null,
    });

    // Automatically redirected out of /build into /project/new
    expect(screen.getAllByRole('heading', { name: /Create AI Project/i }).length).toBeGreaterThanOrEqual(1);
  });
});
