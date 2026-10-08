import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  NodeCategory,
  NodeSubtype,
  NodeConfig,
  SerializableWorkflow,
  WorkflowConnectionDescriptor,
  WorkflowValidationResult,
  WorkflowEvaluationResult,
} from '@/types/workflow';
import type {
  DatasetClassItem,
  DatasetImageItem,
  DatasetQualityReport,
  TrainingHyperparameters,
  DatasetManifest,
  TrainingRequestPayload,
} from '@/types/dataset';
import type {
  TrainingJobStatusResponse,
  ModelMetadata,
} from '@/types/training';
import type { Detection } from '@/types/prediction';
import type {
  ChallengeRunItem,
  ChallengeSessionStats,
  StressCategory,
} from '@/types/challenge';
import type {
  Project,
  JourneyStepId,
  JourneyStepStatus,
  JourneyStepInfo,
  ProjectSidebarStatus,
  WorkflowStatusDisplay,
  DatasetStatusDisplay,
  ModelStatusDisplay,
} from '@/types/project';

import {
  STARTER_SERIALIZABLE_WORKFLOW,
  validateWorkflow,
  evaluateWorkflow,
} from '@/services/workflow';
import {
  INITIAL_DATASET_CLASSES,
  createInitialSampleImages,
  evaluateDatasetQuality,
  createDatasetManifest,
  createTrainingRequest,
} from '@/services/dataset';
import { trainingService, predictionService, repo2Connector } from '@/services/api';
import type { DatasetValidationResponse } from '@/types/api';


const LOCAL_STORAGE_WORKFLOW_KEY = 'ai_safety_workflow_v1';
const LOCAL_STORAGE_DATASET_CLASSES_KEY = 'ai_safety_dataset_classes_v1';
const LOCAL_STORAGE_PROJECT_KEY = 'ai_safety_project_v1';
const LOCAL_STORAGE_TRAINING_CONFIG_KEY = 'ai_safety_training_config_v1';
const LOCAL_STORAGE_ACTIVE_MODEL_KEY = 'ai_safety_active_model_v1';
const LOCAL_STORAGE_TRAINING_HISTORY_KEY = 'ai_safety_training_history_v1';

export interface ProjectContextType {
  // Project
  project: Project;
  updateProject: (patch: Partial<Project>) => void;

  // Workflow
  workflow: SerializableWorkflow;
  workflowValidation: WorkflowValidationResult;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  addNode: (category: NodeCategory, subtype: NodeSubtype, position?: { x: number; y: number }) => string;
  removeNode: (id: string) => void;
  updateNodeConfig: (id: string, config: NodeConfig) => void;
  connectNodes: (connection: WorkflowConnectionDescriptor) => boolean;
  removeConnection: (id: string) => void;
  saveWorkflow: () => void;
  resetToStarterWorkflow: () => void;
  clearWorkflow: () => void;

  // Dataset
  classes: DatasetClassItem[];
  images: DatasetImageItem[];
  datasetQuality: DatasetQualityReport;
  datasetManifest: DatasetManifest;
  datasetValidation: DatasetValidationResponse;
  validateDataset: () => Promise<DatasetValidationResponse>;
  addClass: (name: string) => { success: boolean; error?: string };
  renameClass: (id: string, newName: string) => { success: boolean; error?: string };
  removeClass: (id: string) => void;
  addImage: (classId: string, filename: string, previewUrl: string, fileSize?: number, mimeType?: string) => void;
  removeImage: (id: string) => void;
  resetDataset: () => void;

  // Training
  trainingConfig: TrainingHyperparameters;
  selectedWorkflowModel: {
    modelId: string | null;
    modelName?: string;
    taskType?: string;
    trainable: boolean;
  };
  updateTrainingConfig: (patch: Partial<TrainingHyperparameters>) => void;

  trainingRequest: TrainingRequestPayload;
  activeJob: TrainingJobStatusResponse | null;
  isTraining: boolean;
  trainingError: string | null;
  startTrainingJob: () => Promise<void>;
  cancelTrainingJob: () => Promise<void>;
  trainingHistory: ModelMetadata[];

  // Active Model
  activeModel: ModelMetadata | null;
  setActiveModel: (model: ModelMetadata | null) => void;

  // Testing & Evaluation
  testImage: string | null;
  setTestImage: (url: string | null) => void;
  testDetections: Detection[];
  testEvaluation: WorkflowEvaluationResult | null;
  isInferring: boolean;
  runTestInference: (image: string | File) => Promise<WorkflowEvaluationResult>;

  // Challenge
  challengeHistory: ChallengeRunItem[];
  challengeStats: ChallengeSessionStats;
  runChallengeTest: (params: {
    testCaseName: string;
    category: StressCategory | 'custom';
    expectedClass: string;
    image: string | File;
  }) => Promise<ChallengeRunItem>;
  addFailedExampleToDataset: (challengeItem: ChallengeRunItem) => void;
  clearChallengeHistory: () => void;

  // Journey & Sidebar State
  currentStep: JourneyStepId;
  setCurrentStep: (step: JourneyStepId) => void;
  journeySteps: JourneyStepInfo[];
  sidebarStatus: ProjectSidebarStatus;
  canAccessStep: (step: JourneyStepId) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export interface ProjectProviderProps {
  children: ReactNode;
  initialActiveModel?: ModelMetadata | null;
  initialProject?: Project | null;
  initialWorkflow?: SerializableWorkflow | null;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({
  children,
  initialActiveModel,
  initialProject,
  initialWorkflow,
}) => {
  // 1. Project Info
  const [project, setProject] = useState<Project>(() => {
    if (initialProject !== undefined) {
      return (
        initialProject || {
          id: '',
          name: '',
          safetyProblem: '',
          aiGoal: '',
          mission: 'CUSTOM',
          currentStep: 'BUILD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: {
            workflow: 'not_started',
            dataset: 'not_started',
            model: 'not_started',
            testing: 'not_started',
            challenge: 'not_started',
          },
        }
      );
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'proj-helmet-01',
      name: 'Helmet Safety Detection',
      safetyProblem: 'Detect whether workers are wearing helmets.',
      aiGoal: 'Identify helmet and no-helmet compliance in real time.',
      mission: 'PPE',
      currentStep: 'BUILD',
      description: 'Vision AI workflow for PPE hardhat compliance inspection.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: {
        workflow: 'completed',
        dataset: 'in_progress',
        model: 'not_started',
        testing: 'not_started',
        challenge: 'not_started',
      },
    };
  });

  const updateProject = useCallback((patch: Partial<Project>) => {
    setProject((prev) => {
      const updated = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 2. Workflow State
  const [workflow, setWorkflow] = useState<SerializableWorkflow>(() => {
    if (initialWorkflow !== undefined) {
      return (
        initialWorkflow || {
          version: '1.0',
          projectId: '',
          nodes: [],
          connections: [],
          metadata: { updatedAt: new Date().toISOString() },
        }
      );
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WORKFLOW_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return STARTER_SERIALIZABLE_WORKFLOW;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Workflow Validation
  const workflowValidation = useMemo(() => {
    return validateWorkflow(workflow);
  }, [workflow]);

  const saveWorkflow = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(workflow));
    } catch {
      // ignore
    }
  }, [workflow]);

  const resetToStarterWorkflow = useCallback(() => {
    setWorkflow(STARTER_SERIALIZABLE_WORKFLOW);
    try {
      localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(STARTER_SERIALIZABLE_WORKFLOW));
    } catch {
      // ignore
    }
  }, []);

  const clearWorkflow = useCallback(() => {
    const empty: SerializableWorkflow = {
      version: '1.0',
      projectId: project.id,
      name: 'Custom Workflow',
      nodes: [],
      connections: [],
      metadata: { updatedAt: new Date().toISOString() },
    };
    setWorkflow(empty);
    setSelectedNodeId(null);
    try {
      localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(empty));
    } catch {
      // ignore
    }
  }, [project.id]);

  const addNode = useCallback(
    (category: NodeCategory, subtype: NodeSubtype, position?: { x: number; y: number }) => {
      const uniqueId = `node-${category}-${Date.now().toString(36).slice(-4)}`;
      const title = subtype
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      let defaultConfig: NodeConfig = {};
      if (category === 'model') {
        defaultConfig = {
          modelId: null,
          confidenceThreshold: 0.5,
          classes: ['helmet', 'vest'],
        };
      } else if (category === 'condition') {
        defaultConfig = {
          objectClass: 'helmet',
          threshold: 0.5,
        };
      } else if (category === 'decision') {
        defaultConfig = {
          decisionType: (subtype as 'safe' | 'warning' | 'unsafe' | 'yes_no') || 'safe',
        };
      } else if (category === 'action') {
        defaultConfig = {
          actionType: (subtype as 'alert' | 'alarm' | 'notify_supervisor' | 'stop_process' | 'log_event') || 'alert',
          urgency: 'critical',
        };
      } else if (category === 'input') {
        defaultConfig = {
          sourceType: 'live_stream',
        };
      }

      const newNode = {
        id: uniqueId,
        type: category,
        subtype,
        title,
        description: `${category.toUpperCase()} component`,
        position: position || { x: 180 + Math.random() * 200, y: 150 + Math.random() * 120 },
        config: defaultConfig,
      };

      setWorkflow((prev) => {
        const updated: SerializableWorkflow = {
          ...prev,
          nodes: [...prev.nodes, newNode],
          metadata: {
            ...prev.metadata,
            updatedAt: new Date().toISOString(),
            nodeCount: prev.nodes.length + 1,
          },
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      setSelectedNodeId(uniqueId);
      return uniqueId;
    },
    []
  );

  const removeNode = useCallback((id: string) => {
    setWorkflow((prev) => {
      const updated: SerializableWorkflow = {
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== id),
        connections: prev.connections.filter((c) => c.source !== id && c.target !== id),
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
          nodeCount: Math.max(0, prev.nodes.length - 1),
        },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSelectedNodeId((prev) => (prev === id ? null : prev));
  }, []);

  const updateNodeConfig = useCallback((id: string, config: NodeConfig) => {
    setWorkflow((prev) => {
      const updated: SerializableWorkflow = {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, config: { ...n.config, ...config } } : n)),
        metadata: { ...prev.metadata, updatedAt: new Date().toISOString() },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const connectNodes = useCallback((connection: WorkflowConnectionDescriptor) => {
    // Basic category compatibility rules
    setWorkflow((prev) => {
      const srcNode = prev.nodes.find((n) => n.id === connection.source);
      const tgtNode = prev.nodes.find((n) => n.id === connection.target);

      if (!srcNode || !tgtNode) return prev;
      if (srcNode.id === tgtNode.id) return prev; // no self-connections
      if (srcNode.type === 'action') return prev; // action has input only
      if (tgtNode.type === 'input') return prev; // input has output only

      // Avoid duplicate edge
      const exists = prev.connections.some(
        (c) =>
          c.source === connection.source &&
          c.target === connection.target &&
          c.sourceHandle === connection.sourceHandle
      );
      if (exists) return prev;

      const updated: SerializableWorkflow = {
        ...prev,
        connections: [...prev.connections, connection],
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
          connectionCount: prev.connections.length + 1,
        },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    return true;
  }, []);

  const removeConnection = useCallback((id: string) => {
    setWorkflow((prev) => {
      const updated: SerializableWorkflow = {
        ...prev,
        connections: prev.connections.filter((c) => c.id !== id),
        metadata: {
          ...prev.metadata,
          updatedAt: new Date().toISOString(),
          connectionCount: Math.max(0, prev.connections.length - 1),
        },
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_WORKFLOW_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // 3. Dataset State
  const [classes, setClasses] = useState<DatasetClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATASET_CLASSES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DATASET_CLASSES;
  });

  const [images, setImages] = useState<DatasetImageItem[]>(() => {
    return createInitialSampleImages();
  });

  // Calculate real-time dataset quality
  const datasetQuality = useMemo(() => {
    return evaluateDatasetQuality(classes, images);
  }, [classes, images]);

  // Manifest
  const datasetManifest = useMemo(() => {
    return createDatasetManifest('dataset-ppe-01', project.id, classes, images);
  }, [project.id, classes, images]);

  const addClass = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { success: false, error: 'Class name is required.' };
      }
      const duplicate = classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (duplicate) {
        return { success: false, error: 'This class already exists.' };
      }

      const newClass: DatasetClassItem = {
        id: `class-${Date.now().toString(36)}`,
        name: trimmed,
        count: 0,
        createdAt: new Date().toISOString(),
      };

      setClasses((prev) => {
        const updated = [...prev, newClass];
        try {
          localStorage.setItem(LOCAL_STORAGE_DATASET_CLASSES_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      return { success: true };
    },
    [classes]
  );

  const renameClass = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, error: 'Class name cannot be empty.' };
    }
    setClasses((prev) => {
      const duplicate = prev.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase());
      if (duplicate) {
        return prev;
      }
      const updated = prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c));
      try {
        localStorage.setItem(LOCAL_STORAGE_DATASET_CLASSES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    return { success: true };
  }, []);

  const removeClass = useCallback((id: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_DATASET_CLASSES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    // Remove associated images
    setImages((prev) => prev.filter((img) => img.classId !== id));
  }, []);

  const addImage = useCallback(
    (classId: string, filename: string, previewUrl: string, fileSize?: number, mimeType?: string) => {
      const targetClass = classes.find((c) => c.id === classId);
      const newImg: DatasetImageItem = {
        id: `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        classId,
        className: targetClass ? targetClass.name : 'Unknown',
        filename,
        previewUrl,
        fileSize: fileSize || 35000,
        mimeType: mimeType || 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      };

      setImages((prev) => [newImg, ...prev]);

      // Update class count
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, count: c.count + 1 } : c))
      );
    },
    [classes]
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed) {
        setClasses((cPrev) =>
          cPrev.map((c) => (c.id === removed.classId ? { ...c, count: Math.max(0, c.count - 1) } : c))
        );
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const resetDataset = useCallback(() => {
    setImages([]);
    setClasses(INITIAL_DATASET_CLASSES.map((c) => ({ ...c, count: 0 })));
    try {
      localStorage.removeItem(LOCAL_STORAGE_DATASET_CLASSES_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Selected Model from active Visual Workflow
  const selectedWorkflowModel = useMemo(() => {
    const modelNode = workflow.nodes.find((n) => n.type === 'model');
    const cfg = modelNode?.config as { modelId?: string | null; modelName?: string } | undefined;
    const modelId = cfg?.modelId || null;
    const modelName = cfg?.modelName || (modelId ? 'Selected Model' : undefined);
    const trainable = modelId ? !(modelId.includes('fall') || modelId.includes('pose') || modelId.includes('zone')) : true;
    return {
      modelId,
      modelName,
      taskType: modelNode?.subtype || 'object_detection',
      trainable,
    };
  }, [workflow.nodes]);

  // Dataset Validation State via Repo 2
  const [datasetValidation, setDatasetValidation] = useState<DatasetValidationResponse>({
    valid: false,
    state: 'NOT_CHECKED',
    summary: {
      totalImages: 0,
      classCount: 0,
      isBalanced: true,
    },
    issues: [],
    warnings: [],
    message: 'Dataset has not been validated by Model Engine.',
  });

  const validateDatasetAction = useCallback(async (): Promise<DatasetValidationResponse> => {
    setDatasetValidation((prev) => ({
      ...prev,
      state: 'CHECKING',
      message: 'Validating dataset with Model Engine...',
    }));

    try {
      const res = await repo2Connector.validateDataset({
        projectId: project.id,
        datasetId: datasetManifest.datasetId,
        taskType: selectedWorkflowModel.taskType,
        classes: classes.map((c) => ({ id: c.id, name: c.name, count: c.count })),
        imagesCount: images.length,
      });
      setDatasetValidation(res);
      return res;
    } catch (err) {
      const fallbackRes: DatasetValidationResponse = {
        valid: false,
        state: 'ERROR',
        summary: {
          totalImages: images.length,
          classCount: classes.length,
          isBalanced: false,
        },
        issues: [err instanceof Error ? err.message : 'Unknown validation error'],
        warnings: [],
        message: 'Failed to complete dataset validation.',
      };
      setDatasetValidation(fallbackRes);
      return fallbackRes;
    }
  }, [project.id, datasetManifest.datasetId, selectedWorkflowModel.taskType, classes, images.length]);


  // 4. Training Configuration
  const [trainingConfig, setTrainingConfig] = useState<TrainingHyperparameters>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRAINING_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      model: 'yolo26n',
      task: 'object_detection',
      imageSize: 640,
      epochs: 20,
      confidenceThreshold: 0.5,
    };
  });

  const updateTrainingConfig = useCallback((patch: Partial<TrainingHyperparameters>) => {
    setTrainingConfig((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem(LOCAL_STORAGE_TRAINING_CONFIG_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const trainingRequest = useMemo(() => {
    return createTrainingRequest(
      project.id,
      project.name,
      project.safetyProblem,
      datasetManifest.datasetId,
      classes,
      images,
      trainingConfig
    );
  }, [project, datasetManifest.datasetId, classes, images, trainingConfig]);

  // 5. Training Dispatch & Active Model
  const [activeJob, setActiveJob] = useState<TrainingJobStatusResponse | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<ModelMetadata | null>(() => {
    if (initialActiveModel !== undefined) {
      return initialActiveModel;
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_MODEL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const updateActiveModel = useCallback((model: ModelMetadata | null) => {
    setActiveModel(model);
    try {
      if (model) {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_MODEL_KEY, JSON.stringify(model));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_MODEL_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const [trainingHistory, setTrainingHistory] = useState<ModelMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRAINING_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Training Dispatch
  const startTrainingJob = useCallback(async () => {
    setIsTraining(true);
    setTrainingError(null);
    try {
      const jobResponse = await trainingService.startTraining({
        project,
        workflow,
        datasetManifest,
        trainingConfig,
        images,
      });

      const initialJobStatus: TrainingJobStatusResponse = {
        jobId: jobResponse.jobId,
        status: jobResponse.status,
        progress: 0,
        epoch: 0,
        totalEpochs: trainingConfig.epochs,
      };
      setActiveJob(initialJobStatus);

      // Start Polling loop
      let pollFailures = 0;
      const pollInterval = setInterval(async () => {
        try {
          const status = await trainingService.getTrainingStatus(jobResponse.jobId);
          setActiveJob(status);
          pollFailures = 0;

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsTraining(false);
            const newModel: ModelMetadata = {
              modelId: status.modelId || `model-${Date.now().toString(36)}`,
              jobId: status.jobId,
              modelName: `YOLO26n (${trainingConfig.epochs} epochs)`,
              trainedAt: new Date().toISOString(),
              epochs: trainingConfig.epochs,
              metrics: status.metrics,
            };
            updateActiveModel(newModel);
            setTrainingHistory((h) => {
              const updated = [newModel, ...h];
              try {
                localStorage.setItem(LOCAL_STORAGE_TRAINING_HISTORY_KEY, JSON.stringify(updated));
              } catch {
                // ignore
              }
              return updated;
            });
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            clearInterval(pollInterval);
            setIsTraining(false);
            setTrainingError(status.error || 'Training run was terminated or failed.');
          }
        } catch {
          pollFailures += 1;
          if (pollFailures >= 5) {
            clearInterval(pollInterval);
            setIsTraining(false);
            setTrainingError('Lost connection to Model Engine while polling training status.');
          }
        }
      }, 2000);
    } catch (err) {
      setIsTraining(false);
      setTrainingError(
        err instanceof Error ? err.message : 'Unable to dispatch training to Model Engine.'
      );
    }
  }, [project, workflow, datasetManifest, trainingConfig, images, updateActiveModel]);

  const cancelTrainingJob = useCallback(async () => {
    if (activeJob) {
      try {
        await trainingService.cancelTraining(activeJob.jobId);
      } catch {
        // ignore
      }
      setIsTraining(false);
      setActiveJob((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    }
  }, [activeJob]);

  // 6. Test & Inference
  const [testImage, setTestImage] = useState<string | null>(() => {
    return images.length > 0 ? images[0].previewUrl : null;
  });
  const [testDetections, setTestDetections] = useState<Detection[]>([]);
  const [testEvaluation, setTestEvaluation] = useState<WorkflowEvaluationResult | null>(null);
  const [isInferring, setIsInferring] = useState<boolean>(false);

  const runTestInference = useCallback(
    async (imageInput: string | File): Promise<WorkflowEvaluationResult> => {
      if (!activeModel) {
        throw new Error('Train a model before testing.');
      }
      setIsInferring(true);
      try {
        const res = await predictionService.runPrediction({
          modelId: activeModel.modelId,
          image: imageInput,
          workflow,
        });
        const detections = res.detections || [];
        setTestDetections(detections);
        const evalResult = evaluateWorkflow(workflow, detections);
        setTestEvaluation(evalResult);
        return evalResult;
      } finally {
        setIsInferring(false);
      }
    },
    [activeModel, workflow]
  );

  // 7. Challenge State
  const [challengeHistory, setChallengeHistory] = useState<ChallengeRunItem[]>([]);

  const challengeStats: ChallengeSessionStats = useMemo(() => {
    const totalRuns = challengeHistory.length;
    const correctCount = challengeHistory.filter((c) => c.result === 'CORRECT').length;
    const failedCount = challengeHistory.filter((c) => c.result === 'FAILED').length;
    const criticalMisses = challengeHistory.filter((c) => c.isFalseNegative).length;
    const accuracyPercentage = totalRuns > 0 ? Math.round((correctCount / totalRuns) * 100) : 0;
    return {
      totalRuns,
      correctCount,
      failedCount,
      criticalMisses,
      accuracyPercentage,
    };
  }, [challengeHistory]);

  const runChallengeTest = useCallback(
    async (params: {
      testCaseName: string;
      category: StressCategory | 'custom';
      expectedClass: string;
      image: string | File;
    }): Promise<ChallengeRunItem> => {
      if (!activeModel) {
        throw new Error('Train a model before starting the challenge.');
      }
      setIsInferring(true);
      try {
        const res = await predictionService.runPrediction({
          modelId: activeModel.modelId,
          image: params.image,
          workflow,
        });
        const detections = res.detections || [];
        const topDet = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
        const predictedClass = topDet
          ? topDet.className.toLowerCase().includes('no')
            ? 'No Helmet'
            : topDet.className
          : 'None';
        const confidence = topDet ? topDet.confidence : 0;

        const isCorrect = params.expectedClass
          ? predictedClass.toLowerCase() === params.expectedClass.toLowerCase()
          : false;

        // A false negative is dangerous: worker had NO helmet, but model predicted helmet!
        const isFalseNegative =
          params.expectedClass.toLowerCase() === 'no helmet' &&
          predictedClass.toLowerCase() === 'helmet';

        const runItem: ChallengeRunItem = {
          id: `ch-${Date.now().toString(36)}-${Math.random().toString(36).slice(-4)}`,
          testCaseName: params.testCaseName,
          category: params.category,
          expectedClass: params.expectedClass,
          predictedClass,
          confidence,
          result: isCorrect ? 'CORRECT' : 'FAILED',
          isFalseNegative,
          weaknessIdentified: isCorrect
            ? undefined
            : `Model failed to distinguish "${params.expectedClass}" under ${params.category.replace('_', ' ')} conditions.`,
          timestamp: new Date().toISOString(),
          imageUrl: typeof params.image === 'string' ? params.image : undefined,
        };

        setChallengeHistory((prev) => [runItem, ...prev]);
        return runItem;
      } finally {
        setIsInferring(false);
      }
    },
    [activeModel, workflow]
  );

  const addFailedExampleToDataset = useCallback(
    (challengeItem: ChallengeRunItem) => {
      // Find class matching expectedClass
      let targetClass = classes.find(
        (c) => c.name.toLowerCase() === challengeItem.expectedClass.toLowerCase()
      );
      if (!targetClass && classes.length > 0) {
        targetClass = classes[0];
      }

      if (targetClass) {
        addImage(
          targetClass.id,
          `challenge_retry_${challengeItem.category}_${Date.now().toString(36)}.jpg`,
          challengeItem.imageUrl || images[0]?.previewUrl || '',
          48000,
          'image/jpeg'
        );
      }
    },
    [classes, addImage, images]
  );

  const clearChallengeHistory = useCallback(() => {
    setChallengeHistory([]);
  }, []);

  // 6. Journey State & Navigation Prerequisite Logic
  const [currentStep, setCurrentStep] = useState<JourneyStepId>('BUILD');

  const isWorkflowCompleted = useMemo(() => {
    return workflow.nodes.length > 0 && workflowValidation.isValid;
  }, [workflow.nodes.length, workflowValidation.isValid]);

  const isDatasetReady = useMemo(() => {
    return datasetQuality.status === 'READY' || (classes.length >= 2 && images.length >= 10);
  }, [datasetQuality.status, classes.length, images.length]);

  const hasTrainedModel = useMemo(() => {
    return activeModel !== null || trainingHistory.length > 0;
  }, [activeModel, trainingHistory.length]);

  const hasChallengeRun = useMemo(() => {
    return challengeHistory.length > 0;
  }, [challengeHistory.length]);

  const canAccessStep = useCallback(
    (step: JourneyStepId): boolean => {
      if (!project?.id) return false;
      switch (step) {
        case 'BUILD':
          return true;
        case 'TEACH':
          return isWorkflowCompleted;
        case 'TRAIN':
          return isWorkflowCompleted && (isDatasetReady || hasTrainedModel);
        case 'TEST':
          return hasTrainedModel;
        case 'CHALLENGE':
          return hasTrainedModel;
        case 'IMPROVE':
          return hasChallengeRun || hasTrainedModel;
        default:
          return false;
      }
    },
    [project?.id, isWorkflowCompleted, isDatasetReady, hasTrainedModel, hasChallengeRun]
  );

  const journeySteps: JourneyStepInfo[] = useMemo(() => {
    const hasProject = Boolean(project?.id);
    const steps: Array<{
      id: JourneyStepId;
      stepNumber: string;
      title: string;
      route: string;
      isPrereqMet: boolean;
      isCompleted: boolean;
      prerequisiteDescription: string;
    }> = [
      {
        id: 'BUILD',
        stepNumber: '01',
        title: 'Build',
        route: '/build',
        isPrereqMet: hasProject,
        isCompleted: isWorkflowCompleted,
        prerequisiteDescription: 'Project initialized',
      },
      {
        id: 'TEACH',
        stepNumber: '02',
        title: 'Teach',
        route: '/teach',
        isPrereqMet: hasProject && isWorkflowCompleted,
        isCompleted: images.length >= 20 && datasetQuality.status === 'READY',
        prerequisiteDescription: 'Requires completed workflow with valid input and decision logic',
      },
      {
        id: 'TRAIN',
        stepNumber: '03',
        title: 'Train',
        route: '/train',
        isPrereqMet: hasProject && isWorkflowCompleted && (isDatasetReady || hasTrainedModel),
        isCompleted: hasTrainedModel,
        prerequisiteDescription: 'Requires completed workflow and dataset readiness (≥10 examples per class)',
      },
      {
        id: 'TEST',
        stepNumber: '04',
        title: 'Test',
        route: '/test',
        isPrereqMet: hasProject && hasTrainedModel,
        isCompleted: testEvaluation !== null,
        prerequisiteDescription: 'Requires trained safety model',
      },
      {
        id: 'CHALLENGE',
        stepNumber: '05',
        title: 'Challenge',
        route: '/challenge',
        isPrereqMet: hasProject && hasTrainedModel,
        isCompleted: hasChallengeRun,
        prerequisiteDescription: 'Requires trained safety model',
      },
      {
        id: 'IMPROVE',
        stepNumber: '06',
        title: 'Improve',
        route: '/improve',
        isPrereqMet: hasProject && (hasChallengeRun || hasTrainedModel),
        isCompleted: challengeHistory.some((c) => c.result === 'FAILED'),
        prerequisiteDescription: 'Requires challenge test run results',
      },
    ];

    return steps.map((s) => {
      let status: JourneyStepStatus = 'AVAILABLE';
      if (!s.isPrereqMet) {
        status = 'LOCKED';
      } else if (currentStep === s.id) {
        status = 'CURRENT';
      } else if (s.isCompleted) {
        status = 'COMPLETED';
      } else {
        status = 'AVAILABLE';
      }

      return {
        id: s.id,
        stepNumber: s.stepNumber,
        title: s.title,
        route: s.route,
        status,
        isCompleted: s.isCompleted,
        prerequisiteDescription: s.prerequisiteDescription,
      };
    });
  }, [
    project?.id,
    currentStep,
    isWorkflowCompleted,
    isDatasetReady,
    hasTrainedModel,
    hasChallengeRun,
    images.length,
    datasetQuality.status,
    testEvaluation,
    challengeHistory,
  ]);

  const sidebarStatus: ProjectSidebarStatus = useMemo(() => {
    let workflowStatus: WorkflowStatusDisplay = 'NOT_STARTED';
    if (workflow.nodes.length === 0) {
      workflowStatus = 'NOT_STARTED';
    } else if (workflowValidation.isValid) {
      workflowStatus = 'VALID';
    } else if (workflowValidation.errors.length > 0) {
      workflowStatus = 'INVALID';
    } else {
      workflowStatus = 'IN_PROGRESS';
    }

    let datasetStatus: DatasetStatusDisplay = 'NOT_STARTED';
    if (images.length === 0) {
      datasetStatus = 'NOT_STARTED';
    } else if (datasetQuality.status === 'READY') {
      datasetStatus = 'READY';
    } else if (datasetQuality.issues.length > 0) {
      datasetStatus = 'INVALID';
    } else {
      datasetStatus = 'IN_PROGRESS';
    }

    let modelStatus: ModelStatusDisplay = 'NO_MODEL';
    if (isTraining) {
      modelStatus = 'TRAINING';
    } else if (activeModel) {
      modelStatus = 'READY';
    } else if (trainingError) {
      modelStatus = 'FAILED';
    } else {
      modelStatus = 'NO_MODEL';
    }

    const lastTrainingRun =
      trainingHistory.length > 0 ? `Run 0${trainingHistory.length}` : 'None';
    const activeModelId = activeModel?.modelId || 'None';

    return {
      projectName: project?.name || 'Helmet Safety AI',
      workflowStatus,
      datasetStatus,
      modelStatus,
      engineStatus: 'OFFLINE',
      lastTrainingRun,
      activeModelId,
    };
  }, [
    project?.name,
    workflow.nodes.length,
    workflowValidation.isValid,
    workflowValidation.errors.length,
    images.length,
    datasetQuality.status,
    datasetQuality.issues.length,
    isTraining,
    activeModel,
    trainingError,
    trainingHistory.length,
  ]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        updateProject,
        workflow,
        workflowValidation,
        selectedNodeId,
        setSelectedNodeId,
        addNode,
        removeNode,
        updateNodeConfig,
        connectNodes,
        removeConnection,
        saveWorkflow,
        resetToStarterWorkflow,
        clearWorkflow,
        classes,
        images,
        datasetQuality,
        datasetManifest,
        datasetValidation,
        validateDataset: validateDatasetAction,
        addClass,
        renameClass,
        removeClass,
        addImage,
        removeImage,
        resetDataset,
        trainingConfig,
        selectedWorkflowModel,
        updateTrainingConfig,
        trainingRequest,
        activeJob,
        isTraining,
        trainingError,
        startTrainingJob,
        cancelTrainingJob,
        trainingHistory,
        activeModel,
        setActiveModel: updateActiveModel,
        testImage,
        setTestImage,
        testDetections,
        testEvaluation,
        isInferring,
        runTestInference,
        challengeHistory,
        challengeStats,
        runChallengeTest,
        addFailedExampleToDataset,
        clearChallengeHistory,
        currentStep,
        setCurrentStep,
        journeySteps,
        sidebarStatus,
        canAccessStep,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return { project: context.project, updateProject: context.updateProject };
}

export function useWorkflow() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useWorkflow must be used within a ProjectProvider');
  return {
    workflow: context.workflow,
    validation: context.workflowValidation,
    selectedNodeId: context.selectedNodeId,
    setSelectedNodeId: context.setSelectedNodeId,
    addNode: context.addNode,
    removeNode: context.removeNode,
    updateNodeConfig: context.updateNodeConfig,
    connectNodes: context.connectNodes,
    removeConnection: context.removeConnection,
    saveWorkflow: context.saveWorkflow,
    resetToStarter: context.resetToStarterWorkflow,
    clearWorkflow: context.clearWorkflow,
  };
}

export function useDataset() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useDataset must be used within a ProjectProvider');
  return {
    classes: context.classes,
    images: context.images,
    quality: context.datasetQuality,
    manifest: context.datasetManifest,
    validation: context.datasetValidation,
    validateDataset: context.validateDataset,
    addClass: context.addClass,
    renameClass: context.renameClass,
    removeClass: context.removeClass,
    addImage: context.addImage,
    removeImage: context.removeImage,
    resetDataset: context.resetDataset,
  };
}

export function useTraining() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useTraining must be used within a ProjectProvider');
  return {
    trainingConfig: context.trainingConfig,
    selectedWorkflowModel: context.selectedWorkflowModel,
    updateTrainingConfig: context.updateTrainingConfig,
    trainingRequest: context.trainingRequest,
    activeJob: context.activeJob,
    isTraining: context.isTraining,
    trainingError: context.trainingError,
    startTrainingJob: context.startTrainingJob,
    cancelTrainingJob: context.cancelTrainingJob,
    trainingHistory: context.trainingHistory,
  };
}


export function useModel() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useModel must be used within a ProjectProvider');
  return {
    activeModel: context.activeModel,
    setActiveModel: context.setActiveModel,
  };
}

export function useTesting() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useTesting must be used within a ProjectProvider');
  return {
    testImage: context.testImage,
    setTestImage: context.setTestImage,
    testDetections: context.testDetections,
    testEvaluation: context.testEvaluation,
    isInferring: context.isInferring,
    runTestInference: context.runTestInference,
  };
}

export function useChallenge() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useChallenge must be used within a ProjectProvider');
  return {
    history: context.challengeHistory,
    stats: context.challengeStats,
    runChallengeTest: context.runChallengeTest,
    addFailedExampleToDataset: context.addFailedExampleToDataset,
    clearHistory: context.clearChallengeHistory,
  };
}

export function useJourney() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useJourney must be used within a ProjectProvider');
  return {
    journeySteps: context.journeySteps,
    currentStep: context.currentStep,
    setCurrentStep: context.setCurrentStep,
    sidebarStatus: context.sidebarStatus,
    canAccessStep: context.canAccessStep,
  };
}

export function useProjectOptional(): ProjectContextType | undefined {
  return useContext(ProjectContext);
}



