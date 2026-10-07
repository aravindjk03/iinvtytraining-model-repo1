/**
 * Central API client export alias for Model Engine communication.
 * Consolidated with client.ts to ensure a single unified API abstraction.
 */
export {
  apiClient,
  ApiClient,
  ApiClientError,
  ApiClientError as ApiError,
} from './client';
export type { RequestOptions } from './client';

