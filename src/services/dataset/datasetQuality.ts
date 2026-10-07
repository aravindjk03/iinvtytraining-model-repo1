import type { DatasetClassItem, DatasetImageItem, DatasetQualityReport } from '@/types/dataset';

export const WORKSHOP_MIN_EXAMPLES_PER_CLASS = 10;

/**
 * Evaluates real-time dataset quality, class balance, and workshop training readiness.
 */
export function evaluateDatasetQuality(
  classes: DatasetClassItem[],
  images: DatasetImageItem[],
  minThreshold: number = WORKSHOP_MIN_EXAMPLES_PER_CLASS
): DatasetQualityReport {
  const issues: string[] = [];
  const recommendations: string[] = [];

  const classDistribution: Record<string, number> = {};
  classes.forEach((c) => {
    classDistribution[c.name] = images.filter((img) => img.classId === c.id).length;
  });

  const totalImages = images.length;
  const classCount = classes.length;

  if (classCount === 0) {
    issues.push('No safety classes created yet. Add at least two classes (e.g. Helmet / No Helmet).');
    return {
      status: 'INCOMPLETE',
      totalImages,
      classCount,
      minThreshold,
      isThresholdMet: false,
      isBalanced: false,
      classDistribution,
      issues,
      recommendations: ['Create initial compliance classes.'],
    };
  }

  // Check empty classes
  const emptyClasses = classes.filter((c) => (classDistribution[c.name] || 0) === 0);
  if (emptyClasses.length > 0) {
    issues.push(`Empty class detected: ${emptyClasses.map((c) => `"${c.name}"`).join(', ')} has 0 examples.`);
  }

  // Check workshop threshold per class
  const underThresholdClasses = classes.filter(
    (c) => (classDistribution[c.name] || 0) < minThreshold
  );
  const isThresholdMet = underThresholdClasses.length === 0 && totalImages >= minThreshold * classCount;

  if (underThresholdClasses.length > 0) {
    issues.push(
      `Workshop threshold: ${underThresholdClasses
        .map((c) => `"${c.name}" (${classDistribution[c.name] || 0}/${minThreshold})`)
        .join(', ')} needs at least ${minThreshold} examples.`
    );
    recommendations.push(
      `Upload or capture more images for ${underThresholdClasses.map((c) => `"${c.name}"`).join(', ')}.`
    );
  }

  // Check class balance
  let isBalanced = true;
  const counts = Object.values(classDistribution);
  if (counts.length >= 2 && counts.every((cnt) => cnt > 0)) {
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const ratio = maxCount / Math.max(1, minCount);

    if (ratio > 3.0) {
      isBalanced = false;
      issues.push(`Class imbalance detected: Ratio is ${(ratio).toFixed(1)}:1 between classes.`);
      recommendations.push('Collect more negative or under-represented examples to prevent detector bias.');
    }
  } else if (counts.some((cnt) => cnt === 0) && totalImages > 0) {
    isBalanced = false;
  }

  // Determine overall status
  let status: 'READY' | 'WARNING' | 'INCOMPLETE' = 'INCOMPLETE';
  if (classCount >= 2 && totalImages >= minThreshold * classCount && emptyClasses.length === 0) {
    if (isBalanced) {
      status = 'READY';
    } else {
      status = 'WARNING';
    }
  } else if (totalImages > 0) {
    status = 'WARNING';
  } else {
    status = 'INCOMPLETE';
  }

  return {
    status,
    totalImages,
    classCount,
    minThreshold,
    isThresholdMet,
    isBalanced,
    classDistribution,
    issues,
    recommendations,
  };
}
