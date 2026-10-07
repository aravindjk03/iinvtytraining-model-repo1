/**
 * Challenge and stress-testing types for adversarial/edge-case evaluation.
 */

export type StressCategory =
  | 'occlusion'
  | 'low_light'
  | 'glare_reflection'
  | 'motion_blur'
  | 'unusual_angle'
  | 'scale_variation'
  | 'weather_condition';

export interface StressTestCase {
  id: string;
  category: StressCategory;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  imageUrl?: string;
  expectedClass?: string;
}

export interface ChallengeRunItem {
  id: string;
  testCaseName: string;
  category: StressCategory | 'custom';
  expectedClass: string;
  predictedClass: string;
  confidence: number;
  result: 'CORRECT' | 'FAILED';
  isFalseNegative: boolean; // Flagged as critical miss if dangerous false negative
  weaknessIdentified?: string;
  timestamp: string;
  imageUrl?: string;
}

export interface ChallengeSessionStats {
  totalRuns: number;
  correctCount: number;
  failedCount: number;
  criticalMisses: number;
  accuracyPercentage: number;
}

// Backward compatibility
export interface ChallengeResult {
  id: string;
  modelId: string;
  testCaseId: string;
  passed: boolean;
  actualDetections: string[];
  failureReason?: string;
  evaluatedAt: string;
}
