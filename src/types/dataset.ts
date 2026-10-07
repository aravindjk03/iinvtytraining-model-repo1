/**
 * Dataset and label class definitions for Phase 3 and Phase 4.
 */

export interface DatasetClassItem {
  id: string;
  name: string;
  description?: string;
  count: number;
  imageIds?: string[];
  createdAt?: string;
}

export interface DatasetImageItem {
  id: string;
  classId: string;
  className: string;
  filename: string;
  previewUrl: string; // Base64 Data URL or blob object URL
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface DatasetQualityReport {
  status: 'READY' | 'WARNING' | 'INCOMPLETE';
  totalImages: number;
  classCount: number;
  minThreshold: number; // Default 10 per class for workshop
  isThresholdMet: boolean;
  isBalanced: boolean;
  classDistribution: Record<string, number>;
  issues: string[];
  recommendations: string[];
}

export interface TrainingHyperparameters {
  model: 'yolo26n';
  task: 'object_detection';
  imageSize: number; // default 640
  epochs: number; // default 20
  confidenceThreshold: number; // default 0.50
}

/**
 * Serializable manifest describing dataset structure without raw File objects.
 */
export interface DatasetManifest {
  version: string;
  datasetId: string;
  projectId: string;
  name?: string;
  description?: string;
  classes: Array<{
    id: string;
    name: string;
    imageCount: number;
    imageIds: string[];
  }>;
  metadata: {
    totalImages: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Frontend contract for dispatching training to Model Engine.
 */
export interface TrainingRequestPayload {
  version: string;
  project: {
    id: string;
    name: string;
    safetyProblem: string;
  };
  dataset: {
    id: string;
    classes: Array<{
      id: string;
      name: string;
      imageCount: number;
    }>;
  };
  training: TrainingHyperparameters;
}

// Backward compatibility with Phase 1 types
export interface DatasetClass {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sampleCount: number;
}

export interface DatasetItem {
  id: string;
  filename: string;
  imageUrl?: string;
  uploadedAt: string;
  annotated: boolean;
  classIds: string[];
}

export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  classes: DatasetClass[];
  totalSamples: number;
  annotatedSamples: number;
  createdAt: string;
  updatedAt: string;
}
