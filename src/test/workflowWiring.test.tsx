import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  getModelCatalog,
  getModelById,
  isModelCompatible,
  getCompatibleModels,
} from '@/services/api/modelCatalog';
import { repo2Connector, DEMO_WORKSHOP_MODELS } from '@/services/api/repo2Connector';
import { validateWorkflow, STARTER_SERIALIZABLE_WORKFLOW } from '@/services/workflow';
import { ProjectProvider } from '@/context/ProjectContext';
import { DatasetValidationCard } from '@/components/dataset/DatasetValidationCard';
import { TrainPage } from '@/pages/Train/TrainPage';
import type { SerializableWorkflow } from '@/types/workflow';
import type { DatasetValidationResponse } from '@/types/api';
import type { Project } from '@/types/project';

describe('Model Catalog & Compatibility Layer', () => {
  beforeEach(() => {
    repo2Connector.setDemoMode(true);
  });

  afterEach(() => {
    repo2Connector.setDemoMode(false);
  });

  it('returns valid industrial safety models in the catalog when in demo/local mode', async () => {
    const catalog = await getModelCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(3);
    const ppeModel = catalog.find((m) => m.modelId === 'ppe-workshop-v1');
    expect(ppeModel).toBeDefined();
    expect(ppeModel?.taskType).toBe('object_detection');
    expect(ppeModel?.trainable).toBe(true);
    expect(ppeModel?.classes).toContain('helmet');
  });

  it('correctly validates model compatibility against node subtypes', () => {
    // Object detection node
    expect(isModelCompatible('object_detection', 'object_detection')).toBe(true);
    expect(isModelCompatible('object_detection', 'pose_detection')).toBe(false);

    // Pose detection node
    expect(isModelCompatible('pose_detection', 'pose_detection')).toBe(true);
    expect(isModelCompatible('pose_detection', 'object_detection')).toBe(false);

    // Person detection node allows person_detection and object_detection
    expect(isModelCompatible('person_detection', 'person_detection')).toBe(true);
    expect(isModelCompatible('person_detection', 'object_detection')).toBe(true);
    expect(isModelCompatible('person_detection', 'pose_detection')).toBe(false);
  });

  it('filters compatible models by node subtype correctly', () => {
    const objectModels = getCompatibleModels('object_detection', DEMO_WORKSHOP_MODELS);
    expect(objectModels.some((m) => m.modelId === 'ppe-workshop-v1')).toBe(true);
    expect(objectModels.every((m) => m.taskType === 'object_detection')).toBe(true);

    const poseModels = getCompatibleModels('pose_detection', DEMO_WORKSHOP_MODELS);
    expect(poseModels.every((m) => m.taskType === 'pose_detection')).toBe(true);
  });

  it('retrieves single model by ID', async () => {
    const model = await getModelById('ppe-workshop-v1');
    expect(model).toBeDefined();
    expect(model?.name).toBe('PPE Detection');
  });
});

describe('Repo 2 Connector Service Layer', () => {
  beforeEach(() => {
    repo2Connector.setDemoMode(true);
  });

  afterEach(() => {
    repo2Connector.setDemoMode(false);
  });

  it('retrieves engine status with connected property', async () => {
    const status = await repo2Connector.getEngineStatus();
    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('status');
  });

  it('lists models and retrieves specific model metadata in demo mode', async () => {
    const models = await repo2Connector.listModels();
    expect(models.length).toBeGreaterThanOrEqual(1);

    const model = await repo2Connector.getModel('ppe-workshop-v1');
    expect(model).toBeDefined();
    expect(model?.modelId).toBe('ppe-workshop-v1');
  });

  it('validates datasets authoritatively according to workshop thresholds', async () => {
    // Insufficient dataset (less than 10 images per class)
    const failResult = await repo2Connector.validateDataset({
      projectId: 'p-1',
      datasetId: 'd-1',
      classes: [
        { id: 'c-1', name: 'helmet', count: 2 },
        { id: 'c-2', name: 'no_helmet', count: 2 },
      ],
      imagesCount: 4,
    });
    expect(failResult.valid).toBe(false);
    expect(failResult.state).toBe('INVALID');
    expect(failResult.issues.length).toBeGreaterThanOrEqual(1);

    // Sufficient balanced dataset
    const passResult = await repo2Connector.validateDataset({
      projectId: 'p-1',
      datasetId: 'd-1',
      classes: [
        { id: 'c-1', name: 'helmet', count: 12 },
        { id: 'c-2', name: 'no_helmet', count: 12 },
      ],
      imagesCount: 24,
    });
    expect(passResult.valid).toBe(true);
    expect(passResult.state).toBe('VALID');
    expect(passResult.issues.length).toBe(0);
  });

  it('starts a training job and returns a valid tracking jobId', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          jobId: 'job-test-123',
          status: 'queued',
          message: 'Training job accepted',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const mockProject: Project = {
      id: 'p-1',
      name: 'Test',
      safetyProblem: 'Test',
      status: {
        workflow: 'completed',
        dataset: 'completed',
        model: 'not_started',
        testing: 'not_started',
        challenge: 'not_started',
      },
      createdAt: '2026-10-08T00:00:00Z',
      updatedAt: '2026-10-08T00:00:00Z',
    };

    const fakeParams = {
      project: mockProject,
      workflow: STARTER_SERIALIZABLE_WORKFLOW,
      datasetManifest: {
        version: '1.0',
        datasetId: 'd-1',
        projectId: 'p-1',
        classes: [],
        metadata: {
          totalImages: 0,
          createdAt: '2026-10-08T00:00:00Z',
          updatedAt: '2026-10-08T00:00:00Z',
        },
      },
      trainingConfig: {
        model: 'yolo26n' as const,
        task: 'object_detection' as const,
        imageSize: 640,
        epochs: 20,
        confidenceThreshold: 0.5,
      },
      images: [],
    };

    const response = await repo2Connector.startTraining(fakeParams);
    expect(response.jobId).toBe('job-test-123');
    expect(response.status).toBe('queued');
  });
});

describe('Workflow Validation with Model Wiring (Phase 3)', () => {
  it('validates starter workflow because modelId is pre-wired', () => {
    const result = validateWorkflow(STARTER_SERIALIZABLE_WORKFLOW);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects workflow if an AI Model node does not have a modelId selected', () => {
    const unselectedModelWorkflow: SerializableWorkflow = {
      ...STARTER_SERIALIZABLE_WORKFLOW,
      nodes: STARTER_SERIALIZABLE_WORKFLOW.nodes.map((node) => {
        if (node.type === 'model') {
          return {
            ...node,
            config: {
              ...node.config,
              modelId: undefined, // removed modelId
            },
          };
        }
        return node;
      }),
    };

    const result = validateWorkflow(unselectedModelWorkflow);
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((err) => err.includes('requires a selected Model'))
    ).toBe(true);
    expect(
      result.structuredErrors?.some((se) => se.code === 'AI_MODEL_NOT_SELECTED')
    ).toBe(true);
  });
});

describe('Dataset Validation Card UI (Phase 4)', () => {
  const mockInitialValidation: DatasetValidationResponse = {
    valid: false,
    state: 'NOT_CHECKED',
    summary: { totalImages: 0, classCount: 0, isBalanced: false },
    issues: [],
    warnings: [],
    message: 'Dataset has not been checked yet.',
  };

  it('renders dataset validation card with trigger button and initial status', () => {
    render(
      <DatasetValidationCard
        validation={mockInitialValidation}
        onValidate={vi.fn()}
      />
    );

    expect(screen.getByText(/Dataset Validation \(Repo 2 Engine Authority\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CHECK MY DATA/i })).toBeInTheDocument();
    expect(screen.getByText(/NOT CHECKED/i)).toBeInTheDocument();
  });

  it('triggers onValidate when CHECK MY DATA is clicked', async () => {
    const handleValidate = vi.fn().mockResolvedValue(mockInitialValidation);
    render(
      <DatasetValidationCard
        validation={mockInitialValidation}
        onValidate={handleValidate}
      />
    );

    await fireEvent.click(screen.getByRole('button', { name: /CHECK MY DATA/i }));
    expect(handleValidate).toHaveBeenCalledTimes(1);
  });

  it('renders verified badge and message when dataset is verified valid', () => {
    const validResponse: DatasetValidationResponse = {
      valid: true,
      state: 'VALID',
      summary: { totalImages: 24, classCount: 2, isBalanced: true },
      issues: [],
      warnings: [],
      message: '✓ Dataset verified and ready for model training.',
    };

    render(
      <DatasetValidationCard
        validation={validResponse}
        onValidate={vi.fn()}
      />
    );

    expect(screen.getByText(/✓ VALID/i)).toBeInTheDocument();
    expect(
      screen.getByText(/✓ Dataset verified and ready for model training/i)
    ).toBeInTheDocument();
  });
});

describe('TrainPage & Pre-training Confirmation Modal (Phase 4)', () => {
  it('renders TrainPage with workshop_cpu profile and educational note', () => {
    render(
      <MemoryRouter>
        <ProjectProvider>
          <TrainPage />
        </ProjectProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /TRAIN YOUR AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Profile: workshop_cpu/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Training teaches the model patterns from your dataset/i)
    ).toBeInTheDocument();
  });
});
