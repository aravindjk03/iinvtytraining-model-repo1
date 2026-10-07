/**
 * Project and overall platform status types.
 */

export type ModuleState = 'not_started' | 'in_progress' | 'completed' | 'blocked';

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
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectModuleStatus;
}
