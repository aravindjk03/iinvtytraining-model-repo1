/**
 * Computer vision inference and detection types for Phase 4.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id?: string;
  classId?: string;
  className: string;
  confidence: number;
  bbox?: BoundingBox;
  box?: BoundingBox;
}

export interface PredictionResponse {
  modelId: string;
  detections: Detection[];
  processingTimeMs?: number;
  inferenceTimeMs?: number;
  timestamp?: string;
}

// Backward compatibility with Phase 1 types
export interface Prediction {
  id: string;
  modelId: string;
  sourceImageId?: string;
  detections: Detection[];
  inferenceTimeMs: number;
  timestamp: string;
}
