import type {
  DatasetClassItem,
  DatasetImageItem,
  DatasetManifest,
  TrainingRequestPayload,
  TrainingHyperparameters,
} from '@/types/dataset';

/**
 * Creates a clean serializable dataset manifest that describes dataset structure
 * without depending on browser-specific File/Blob instances.
 */
export function createDatasetManifest(
  datasetId: string,
  projectId: string,
  classes: DatasetClassItem[],
  images: DatasetImageItem[],
  name: string = 'Industrial PPE Training Dataset'
): DatasetManifest {
  const manifestClasses = classes.map((c) => {
    const classImages = images.filter((img) => img.classId === c.id);
    return {
      id: c.id,
      name: c.name,
      imageCount: classImages.length,
      imageIds: classImages.map((img) => img.id),
    };
  });

  return {
    version: '1.0',
    datasetId,
    projectId,
    name,
    classes: manifestClasses,
    metadata: {
      totalImages: images.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Creates a structured TrainingRequest object ready for Model Engine integration.
 */
export function createTrainingRequest(
  projectId: string,
  projectName: string,
  safetyProblem: string,
  datasetId: string,
  classes: DatasetClassItem[],
  images: DatasetImageItem[],
  trainingConfig: TrainingHyperparameters
): TrainingRequestPayload {
  const classSummaries = classes.map((c) => ({
    id: c.id,
    name: c.name,
    imageCount: images.filter((img) => img.classId === c.id).length,
  }));

  return {
    version: '1.0',
    project: {
      id: projectId,
      name: projectName,
      safetyProblem,
    },
    dataset: {
      id: datasetId,
      classes: classSummaries,
    },
    training: {
      model: trainingConfig.model,
      task: trainingConfig.task,
      imageSize: trainingConfig.imageSize,
      epochs: trainingConfig.epochs,
      confidenceThreshold: trainingConfig.confidenceThreshold,
    },
  };
}
