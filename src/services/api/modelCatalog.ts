import { repo2Connector } from './repo2Connector';
import type { Repo2ModelMetadata } from '@/types/api';

/**
 * Validates compatibility between a visual workflow node subtype and a model task type.
 * Prevents assigning incompatible models (e.g. object detection model to pose detection node).
 */
export function isModelCompatible(nodeSubtype: string, modelTaskType: string): boolean {
  switch (nodeSubtype) {
    case 'object_detection':
      return modelTaskType === 'object_detection';
    case 'pose_detection':
      return modelTaskType === 'pose_detection';
    case 'person_detection':
      return modelTaskType === 'person_detection' || modelTaskType === 'object_detection';
    case 'image_classification':
      return modelTaskType === 'image_classification' || modelTaskType === 'object_detection';
    default:
      return true;
  }
}

/**
 * Retrieves the catalog of models from Repo 2.
 */
export async function getModelCatalog(taskType?: string): Promise<Repo2ModelMetadata[]> {
  return repo2Connector.listModels(taskType);
}

/**
 * Retrieves a single model by its unique ID.
 */
export async function getModelById(modelId: string): Promise<Repo2ModelMetadata | null> {
  return repo2Connector.getModel(modelId);
}

/**
 * Filters available models to only those compatible with a given node subtype.
 */
export function getCompatibleModels(
  nodeSubtype: string,
  models: Repo2ModelMetadata[]
): Repo2ModelMetadata[] {
  return models.filter((m) => isModelCompatible(nodeSubtype, m.taskType));
}
