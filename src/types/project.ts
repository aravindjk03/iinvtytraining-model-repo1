/**
 * Project, Journey, and overall platform status types.
 */

export type ModuleState = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type MissionType =
  | 'PPE'
  | 'FIRE'
  | 'SPILL'
  | 'RESTRICTED_AREA'
  | 'POSTURE'
  | 'CUSTOM';

export type JourneyStepId =
  | 'BUILD'
  | 'TEACH'
  | 'TRAIN'
  | 'TEST'
  | 'CHALLENGE'
  | 'IMPROVE';

export type JourneyStepStatus = 'LOCKED' | 'AVAILABLE' | 'CURRENT' | 'COMPLETED';

export interface JourneyStepInfo {
  id: JourneyStepId;
  stepNumber: string;
  title: string;
  route: string;
  status: JourneyStepStatus;
  isCompleted?: boolean;
  prerequisiteDescription?: string;
}

export type EngineConnectionState =
  | 'UNKNOWN'
  | 'CONNECTED'
  | 'OFFLINE'
  | 'CONNECTING'
  | 'ERROR';

export type WorkflowStatusDisplay = 'NOT_STARTED' | 'IN_PROGRESS' | 'VALID' | 'INVALID';
export type DatasetStatusDisplay = 'NOT_STARTED' | 'IN_PROGRESS' | 'READY' | 'INVALID';
export type ModelStatusDisplay = 'NO_MODEL' | 'TRAINING' | 'READY' | 'FAILED';

export interface ProjectSidebarStatus {
  projectName: string;
  workflowStatus: WorkflowStatusDisplay;
  datasetStatus: DatasetStatusDisplay;
  modelStatus: ModelStatusDisplay;
  engineStatus: EngineConnectionState;
  lastTrainingRun: string; // e.g. "Run 01" or "None"
  activeModelId: string;   // e.g. "model-yolo26n-001" or "None"
}

export interface ProjectModuleStatus {
  workflow: ModuleState;
  dataset: ModuleState;
  model: ModuleState;
  testing: ModuleState;
  challenge: ModuleState;
}

export interface Project {
  id: string;
  name: string;
  safetyProblem: string;
  aiGoal?: string;
  mission?: MissionType | string;
  currentStep?: JourneyStepId;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectModuleStatus;
}
