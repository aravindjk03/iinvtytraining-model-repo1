import { Dataset } from '@/types/dataset';

export interface DatasetUploadParams {
  projectId: string;
  files: File[];
  className?: string;
}

export interface DatasetServiceContract {
  uploadDataset(params: DatasetUploadParams): Promise<Dataset>;
  getDataset(datasetId: string): Promise<Dataset>;
}

/**
 * Service for dataset synchronization with Model Engine.
 * Phase 1: Signatures typed, implementations pending Model Engine REST API contract.
 */
export const datasetService: DatasetServiceContract = {
  async uploadDataset(_params: DatasetUploadParams): Promise<Dataset> {
    // TODO: Connect to Model Engine dataset upload endpoint in Phase 2
    throw new Error('Dataset upload is not implemented in Phase 1 frontend shell.');
  },

  async getDataset(_datasetId: string): Promise<Dataset> {
    // TODO: Connect to Model Engine dataset retrieval endpoint in Phase 2
    throw new Error('Dataset retrieval is not implemented in Phase 1 frontend shell.');
  },
};
