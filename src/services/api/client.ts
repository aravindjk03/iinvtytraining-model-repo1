import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Custom Error class for typed API exceptions.
 */
export class ApiClientError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, status?: number, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Central API Client for making typed HTTP requests to the external Model Engine.
 * All requests use the environment-configured base URL.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number = 8000;

  constructor(baseUrl: string = env.modelApiUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeoutMs = this.defaultTimeout, headers: customHeaders, signal: customSignal, ...restOptions } = options;
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(customHeaders);
    if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const signal = customSignal || controller.signal;

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers,
        signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let friendlyMessage = data?.error?.message || data?.detail;
        if (!friendlyMessage) {
          switch (response.status) {
            case 400:
              friendlyMessage = 'Training request is invalid. Check the dataset and workflow.';
              break;
            case 401:
            case 403:
              friendlyMessage = 'Authentication or access permission denied by Model Engine.';
              break;
            case 404:
              friendlyMessage = 'Requested Model Engine resource or job was not found.';
              break;
            case 409:
              friendlyMessage = 'A conflicting training job or model operation is currently active.';
              break;
            case 413:
              friendlyMessage = 'The dataset is too large for the current Model Engine.';
              break;
            case 422:
              friendlyMessage = 'Invalid parameter schema passed to Model Engine.';
              break;
            case 429:
              friendlyMessage = 'The Model Engine is busy. Please retry shortly.';
              break;
            case 500:
              friendlyMessage = 'The Model Engine encountered an internal error.';
              break;
            case 502:
            case 503:
              friendlyMessage = 'The Model Engine service is currently unreachable or starting up.';
              break;
            default:
              friendlyMessage = `Request failed with status ${response.status}`;
          }
        }

        throw new ApiClientError(
          friendlyMessage,
          response.status,
          data?.error?.code || `HTTP_${response.status}`,
          data?.error?.details
        );
      }

      return {
        success: true,
        data: data as T,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError(
          `Request to Model Engine timed out after ${timeoutMs}ms. Verify backend is running at ${this.baseUrl}.`,
          408,
          'REQUEST_TIMEOUT'
        );
      }

      // Handle network errors, connection refused, or timeouts
      throw new ApiClientError(
        'Unable to connect to the AI Model Engine. Please verify the service is running.',
        0,
        'NETWORK_CONNECTION_ERROR'
      );
    }
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  public async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
