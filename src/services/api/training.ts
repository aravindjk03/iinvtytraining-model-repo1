import { apiClient } from './client';
import type {
  TrainingJobResponse,
  TrainingJobStatusResponse,
  DispatchTrainingParams,
} from './types';

/**
 * Service for training jobs on the external Model Engine REST API.
 */
export async function createTrainingJob(params: DispatchTrainingParams): Promise<TrainingJobResponse> {
  const formData = new FormData();

  // Serialize JSON components explicitly
  formData.append(
    'project',
    JSON.stringify({
      id: params.project.id,
      name: params.project.name,
      safetyProblem: params.project.safetyProblem,
    })
  );

  formData.append(
    'workflow',
    JSON.stringify({
      version: params.workflow.version,
      nodes: params.workflow.nodes,
      connections: params.workflow.connections,
    })
  );

  formData.append(
    'dataset',
    JSON.stringify({
      version: params.datasetManifest.version,
      datasetId: params.datasetManifest.datasetId,
      classes: params.datasetManifest.classes,
    })
  );

  formData.append(
    'training',
    JSON.stringify({
      model: params.trainingConfig.model,
      task: params.trainingConfig.task,
      imageSize: params.trainingConfig.imageSize,
      epochs: params.trainingConfig.epochs,
      confidenceThreshold: params.trainingConfig.confidenceThreshold,
    })
  );

  // Attach image files (converted from preview DataURL or Blob)
  for (const [index, img] of params.images.entries()) {
    try {
      let blob: Blob;
      if (img.previewUrl.startsWith('data:') || img.previewUrl.startsWith('blob:')) {
        const res = await fetch(img.previewUrl);
        blob = await res.blob();
      } else {
        blob = new Blob([img.filename], { type: img.mimeType || 'image/jpeg' });
      }
      formData.append('files', blob, img.filename || `sample_${index}.jpg`);
    } catch {
      // Fallback placeholder blob
      const fallback = new Blob(['sample-image'], { type: 'image/jpeg' });
      formData.append('files', fallback, img.filename || `image_${index}.jpg`);
    }
  }

  const response = await apiClient.post<TrainingJobResponse>('/api/v1/training/jobs', formData);
  if (!response.data) {
    throw new Error('Training request did not return a valid job response.');
  }
  return response.data;
}

/**
 * Queries status and live metrics of an active training job.
 */
export async function getTrainingJob(jobId: string): Promise<TrainingJobStatusResponse> {
  const response = await apiClient.get<TrainingJobStatusResponse>(`/api/v1/training/jobs/${jobId}`, {
    timeoutMs: 5000,
  });
  if (!response.data) {
    throw new Error(`Failed to retrieve training status for job ${jobId}`);
  }
  return response.data;
}

/**
 * Cancels an ongoing training job.
 */
export async function cancelTrainingJob(jobId: string): Promise<void> {
  await apiClient.delete(`/api/v1/training/jobs/${jobId}`);
}

export const trainingService = {
  startTraining: createTrainingJob,
  getTrainingStatus: getTrainingJob,
  cancelTraining: cancelTrainingJob,
};
