import { describe, it, expect } from 'vitest';
import {
  evaluateDatasetQuality,
  createDatasetManifest,
  createTrainingRequest,
  INITIAL_DATASET_CLASSES,
  createInitialSampleImages,
} from '@/services/dataset';

describe('Dataset Quality Analysis Engine', () => {
  it('evaluates pre-seeded sample dataset as balanced and ready', () => {
    const images = createInitialSampleImages();
    const quality = evaluateDatasetQuality(INITIAL_DATASET_CLASSES, images, 10);

    expect(quality.status).toBe('READY');
    expect(quality.totalImages).toBe(20);
    expect(quality.isThresholdMet).toBe(true);
    expect(quality.isBalanced).toBe(true);
    expect(quality.issues).toHaveLength(0);
  });

  it('flags class imbalance when one class heavily dominates', () => {
    const images = [
      ...Array.from({ length: 40 }).map((_, i) => ({
        id: `img-h-${i}`,
        classId: 'class-helmet',
        className: 'Helmet',
        filename: `h_${i}.jpg`,
        previewUrl: 'data:image/svg',
        fileSize: 1000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      })),
      ...Array.from({ length: 3 }).map((_, i) => ({
        id: `img-nh-${i}`,
        classId: 'class-no-helmet',
        className: 'No Helmet',
        filename: `nh_${i}.jpg`,
        previewUrl: 'data:image/svg',
        fileSize: 1000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      })),
    ];

    const quality = evaluateDatasetQuality(INITIAL_DATASET_CLASSES, images, 10);
    expect(quality.isBalanced).toBe(false);
    expect(quality.issues.some((i) => i.includes('imbalance'))).toBe(true);
  });

  it('creates a serializable dataset manifest structure', () => {
    const images = createInitialSampleImages();
    const manifest = createDatasetManifest(
      'dataset-01',
      'proj-01',
      INITIAL_DATASET_CLASSES,
      images,
      'Industrial PPE Dataset'
    );

    expect(manifest.version).toBe('1.0');
    expect(manifest.datasetId).toBe('dataset-01');
    expect(manifest.projectId).toBe('proj-01');
    expect(manifest.classes).toHaveLength(2);
    expect(manifest.metadata.totalImages).toBe(20);
    expect(JSON.parse(JSON.stringify(manifest))).toEqual(manifest);
  });

  it('generates a clean serializable training request without File instances', () => {
    const images = createInitialSampleImages();
    const req = createTrainingRequest(
      'proj-01',
      'Helmet Safety Check',
      'Detect helmets on factory line',
      'dataset-01',
      INITIAL_DATASET_CLASSES,
      images,
      {
        model: 'yolo26n',
        task: 'object_detection',
        imageSize: 640,
        epochs: 20,
        confidenceThreshold: 0.5,
      }
    );

    expect(req.version).toBe('1.0');
    expect(req.project.name).toBe('Helmet Safety Check');
    expect(req.training.model).toBe('yolo26n');
    expect(req.training.epochs).toBe(20);
    expect(req.dataset.classes).toHaveLength(2);

    // Verify it is strictly serializable JSON
    const jsonString = JSON.stringify(req);
    expect(jsonString).toContain('yolo26n');
    expect(JSON.parse(jsonString)).toEqual(req);
  });
});
