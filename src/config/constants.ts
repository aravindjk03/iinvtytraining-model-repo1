export const APP_CONFIG = {
  name: 'AI SAFETY BUILDER',
  subtitle: 'Industrial AI Safety Training Platform',
  philosophy: 'BUILD → TEACH → TRAIN → TEST → BREAK → IMPROVE',
  philosophyBullets: 'BUILD • TEACH • TRAIN • TEST • BREAK • IMPROVE',
  defaultProjectName: 'Helmet Safety AI',
  version: '1.0.0-phase1',
} as const;

export interface NavRoute {
  path: string;
  label: string;
  stepNumber?: string;
  iconName: 'LayoutDashboard' | 'Workflow' | 'FolderKanban' | 'Cpu' | 'CheckCircle2' | 'ShieldAlert' | 'RefreshCw';
  description: string;
}

export const NAVIGATION_ROUTES: NavRoute[] = [
  {
    path: '/',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    description: 'System overview and training workflow status',
  },
  {
    path: '/build',
    label: 'Build',
    stepNumber: '01',
    iconName: 'Workflow',
    description: 'Wire your AI safety workflow',
  },
  {
    path: '/teach',
    label: 'Teach',
    stepNumber: '02',
    iconName: 'FolderKanban',
    description: 'Provide examples for your AI',
  },
  {
    path: '/train',
    label: 'Train',
    stepNumber: '03',
    iconName: 'Cpu',
    description: 'Train the safety model',
  },
  {
    path: '/test',
    label: 'Test',
    stepNumber: '04',
    iconName: 'CheckCircle2',
    description: 'Test the model against real scenarios',
  },
  {
    path: '/challenge',
    label: 'Challenge',
    stepNumber: '05',
    iconName: 'ShieldAlert',
    description: 'Try to expose weaknesses',
  },
  {
    path: '/improve',
    label: 'Improve',
    stepNumber: '06',
    iconName: 'RefreshCw',
    description: 'Improve the dataset and repeat',
  },
];

export interface JourneyStageDefinition {
  id: import('@/types').JourneyStepId;
  stepNumber: string;
  label: string;
  route: string;
  iconName: 'Workflow' | 'FolderKanban' | 'Cpu' | 'CheckCircle2' | 'ShieldAlert' | 'RefreshCw';
  description: string;
}

export const JOURNEY_STAGES: JourneyStageDefinition[] = [
  {
    id: 'BUILD',
    stepNumber: '01',
    label: 'Build',
    route: '/build',
    iconName: 'Workflow',
    description: 'Wire your AI safety workflow',
  },
  {
    id: 'TEACH',
    stepNumber: '02',
    label: 'Teach',
    route: '/teach',
    iconName: 'FolderKanban',
    description: 'Provide examples for your AI',
  },
  {
    id: 'TRAIN',
    stepNumber: '03',
    label: 'Train',
    route: '/train',
    iconName: 'Cpu',
    description: 'Train the safety model',
  },
  {
    id: 'TEST',
    stepNumber: '04',
    label: 'Test',
    route: '/test',
    iconName: 'CheckCircle2',
    description: 'Test the model against real scenarios',
  },
  {
    id: 'CHALLENGE',
    stepNumber: '05',
    label: 'Challenge',
    route: '/challenge',
    iconName: 'ShieldAlert',
    description: 'Try to expose weaknesses',
  },
  {
    id: 'IMPROVE',
    stepNumber: '06',
    label: 'Improve',
    route: '/improve',
    iconName: 'RefreshCw',
    description: 'Improve the dataset and repeat',
  },
];

export interface WorkflowCardItem {
  step: string;
  title: string;
  description: string;
  route: string;
  badgeText: string;
}

export const WORKFLOW_CARDS: WorkflowCardItem[] = [
  {
    step: '01',
    title: 'BUILD',
    description: 'Wire your AI safety workflow.',
    route: '/build',
    badgeText: 'Workflow',
  },
  {
    step: '02',
    title: 'TEACH',
    description: 'Provide examples for your AI.',
    route: '/teach',
    badgeText: 'Dataset',
  },
  {
    step: '03',
    title: 'TRAIN',
    description: 'Train the safety model.',
    route: '/train',
    badgeText: 'Compute',
  },
  {
    step: '04',
    title: 'TEST',
    description: 'Test the model against real scenarios.',
    route: '/test',
    badgeText: 'Validation',
  },
  {
    step: '05',
    title: 'CHALLENGE',
    description: 'Try to expose weaknesses.',
    route: '/challenge',
    badgeText: 'Stress Test',
  },
  {
    step: '06',
    title: 'IMPROVE',
    description: 'Improve the dataset and repeat.',
    route: '/improve',
    badgeText: 'Iterate',
  },
];
