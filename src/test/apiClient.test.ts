import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiClientError } from '@/services/api/client';
import { checkHealth } from '@/services/api/health';
import { checkModelEngineHealth } from '@/services/api/healthService';
import { createTrainingJob } from '@/services/api/training';
import { predict } from '@/services/api/inference';
import { env } from '@/config/env';

describe('API Service Abstraction & Adapter Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('configures base URL from environment variable and does not hard-code', () => {
    expect(apiClient.getBaseUrl()).toBe(env.modelApiUrl);
    expect(apiClient.getBaseUrl()).toBe('http://localhost:8000');
  });

  it('transforms network fetch errors into friendly user-facing messages', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiClient.get('/test-endpoint')).rejects.toThrow(
      /Unable to connect to the AI Model Engine/i
    );
  });

  it('health check gracefully returns offline status without throwing when backend is down', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    const health = await checkModelEngineHealth();
    expect(health.online).toBe(false);
    expect(health.endpoint).toContain('/health');
    expect(health.message).toMatch(/Unable to connect to the AI Model Engine/i);
  });

  it('checkHealth probes /api/v1/health primary endpoint and reports operational', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/health')) {
        return new Response(JSON.stringify({ status: 'ok', version: '2.0.0' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not Found', { status: 404 });
    });

    const health = await checkHealth();
    expect(health.online).toBe(true);
    expect(health.message).toBe('ok');
    expect(health.version).toBe('2.0.0');
    expect(health.endpoint).toContain('/api/v1/health');
  });

  it('checkHealth gracefully falls back to /health if /api/v1/health returns 404', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/health')) {
        return new Response('Not Found', { status: 404 });
      }
      if (urlStr.includes('/health')) {
        return new Response(JSON.stringify({ status: 'healthy', version: '1.2.0' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Not Found', { status: 404 });
    });

    const health = await checkHealth();
    expect(health.online).toBe(true);
    expect(health.message).toBe('healthy');
    expect(health.version).toBe('1.2.0');
    expect(health.endpoint).toContain('/health');
  });

  it('createTrainingJob dispatches multipart training request and returns job response', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/train') || urlStr.includes('/train')) {
        return new Response(
          JSON.stringify({
            jobId: 'train-job-ppe-42',
            status: 'queued',
            message: 'Training job successfully queued on Model Engine',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('Not Found', { status: 404 });
    });

    const job = await createTrainingJob({
      project: {
        id: 'proj-ppe-1',
        name: 'PPE Detection',
        safetyProblem: 'Workers missing helmets',
        createdAt: '2026-10-07T00:00:00Z',
        updatedAt: '2026-10-07T00:00:00Z',
        status: {
          workflow: 'completed',
          dataset: 'completed',
          model: 'not_started',
          testing: 'not_started',
          challenge: 'not_started',
        },
      },
      workflow: {
        version: '1.0',
        projectId: 'proj-ppe-1',
        nodes: [],
        connections: [],
        metadata: {
          updatedAt: '2026-10-07T00:00:00Z',
        },
      },
      datasetManifest: {
        version: '1.0',
        datasetId: 'dataset-ppe-1',
        projectId: 'proj-ppe-1',
        classes: [{ id: 'cls-1', name: 'helmet', imageCount: 12, imageIds: [] }],
        metadata: {
          totalImages: 12,
          createdAt: '2026-10-07T00:00:00Z',
          updatedAt: '2026-10-07T00:00:00Z',
        },
      },
      trainingConfig: {
        model: 'yolo26n',
        task: 'object_detection',
        imageSize: 640,
        epochs: 20,
        confidenceThreshold: 0.5,
      },
      images: [],
    });

    expect(job.jobId).toBe('train-job-ppe-42');
    expect(job.status).toBe('queued');
  });

  it('predict executes inference and parses structured detection results', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/inference/predict')) {
        return new Response(
          JSON.stringify({
            modelId: 'model-yolo26-01',
            detections: [
              {
                className: 'helmet',
                confidence: 0.95,
                bbox: { x: 50, y: 50, width: 100, height: 100 },
              },
            ],
            processingTimeMs: 45,
            timestamp: '2026-10-07T00:00:00Z',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('Not Found', { status: 404 });
    });

    const result = await predict({
      modelId: 'model-yolo26-01',
      workflow: {
        version: '1.0',
        projectId: 'proj-ppe-1',
        nodes: [],
        connections: [],
        metadata: { updatedAt: '2026-10-07T00:00:00Z' },
      },
      image: new Blob(['dummy-image-data'], { type: 'image/jpeg' }),
    });

    expect(result.modelId).toBe('model-yolo26-01');
    expect(result.detections).toHaveLength(1);
    expect(result.detections[0].className).toBe('helmet');
    expect(result.detections[0].confidence).toBe(0.95);
  });

  it('predict rejects oversized images (>15MB) with 413 Payload Too Large error', async () => {
    const oversizedBlob = new Blob([new Uint8Array(16 * 1024 * 1024)], { type: 'image/jpeg' });

    await expect(
      predict({
        modelId: 'model-yolo26-01',
        workflow: {
          version: '1.0',
          projectId: 'proj-ppe-1',
          nodes: [],
          connections: [],
          metadata: { updatedAt: '2026-10-07T00:00:00Z' },
        },
        image: oversizedBlob,
      })
    ).rejects.toThrow(/exceeds the 15 MB maximum size limit/i);

    try {
      await predict({
        modelId: 'model-yolo26-01',
        workflow: {
          version: '1.0',
          projectId: 'proj-ppe-1',
          nodes: [],
          connections: [],
          metadata: { updatedAt: '2026-10-07T00:00:00Z' },
        },
        image: oversizedBlob,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(413);
      expect((err as ApiClientError).code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('modelEngineService methods return clearly typed not implemented errors in Phase 1', async () => {
    const { modelEngineService, NotImplementedError } = await import('@/services/api/modelEngineService');

    await expect(modelEngineService.getModelInfo()).rejects.toThrow(NotImplementedError);
    await expect(modelEngineService.uploadDataset({})).rejects.toThrow(NotImplementedError);
    await expect(modelEngineService.startTrainingJob({})).rejects.toThrow(NotImplementedError);
    await expect(modelEngineService.getTrainingStatus('job-1')).rejects.toThrow(NotImplementedError);
    await expect(modelEngineService.runInference({})).rejects.toThrow(NotImplementedError);
  });
});
