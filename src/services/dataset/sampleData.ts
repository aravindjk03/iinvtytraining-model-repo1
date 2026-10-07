import type { DatasetClassItem, DatasetImageItem } from '@/types/dataset';

export const INITIAL_DATASET_CLASSES: DatasetClassItem[] = [
  { id: 'class-helmet', name: 'Helmet', count: 10, createdAt: '2026-10-08T00:00:00.000Z' },
  { id: 'class-no-helmet', name: 'No Helmet', count: 10, createdAt: '2026-10-08T00:00:00.000Z' },
];

/**
 * Generates an SVG Data URL representing an industrial safety scenario.
 */
function createSvgDataUrl(title: string, subtitle: string, bgColor: string, iconSymbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
    <rect width="320" height="240" fill="${bgColor}"/>
    <circle cx="160" cy="100" r="50" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="2"/>
    <text x="160" y="108" font-family="monospace, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${iconSymbol}</text>
    <rect x="20" y="170" width="280" height="50" rx="6" fill="#000000" fill-opacity="0.35"/>
    <text x="160" y="190" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="160" y="208" font-family="sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createInitialSampleImages(): DatasetImageItem[] {
  const images: DatasetImageItem[] = [];

  const helmetAngles = [
    'Front View Worker',
    'Low-Angle Weld Zone',
    'Side Profile Scaffolding',
    'High-Visibility Yellow Cap',
    'White Engineer Helmet',
    'Blue Technician Hardhat',
    'Overhead Crane Angle',
    'Distance Inspection 5m',
    'Fluorescent Plant Lighting',
    'Outdoor Loading Bay',
  ];

  const noHelmetAngles = [
    'Worker Bare Head Area',
    'Baseball Cap Violation',
    'Hairnet Only Violation',
    'Beanie Cold Room',
    'Side View No PPE',
    'Machinery Entry No Cap',
    'Forklift Driver Barehead',
    'Conveyor Operator Unprotected',
    'Maintenance Technician Unshielded',
    'Stairway Transit Violation',
  ];

  helmetAngles.forEach((desc, idx) => {
    images.push({
      id: `img-helmet-${idx + 1}`,
      classId: 'class-helmet',
      className: 'Helmet',
      filename: `helmet_sample_${String(idx + 1).padStart(2, '0')}.jpg`,
      previewUrl: createSvgDataUrl('COMPLIANT HELMET', desc, '#064e3b', '⛑️'),
      fileSize: 45000 + idx * 1200,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(Date.now() - (20 - idx) * 60000).toISOString(),
    });
  });

  noHelmetAngles.forEach((desc, idx) => {
    images.push({
      id: `img-no-helmet-${idx + 1}`,
      classId: 'class-no-helmet',
      className: 'No Helmet',
      filename: `no_helmet_sample_${String(idx + 1).padStart(2, '0')}.jpg`,
      previewUrl: createSvgDataUrl('VIOLATION: NO HELMET', desc, '#7f1d1d', '⚠️'),
      fileSize: 42000 + idx * 1100,
      mimeType: 'image/jpeg',
      uploadedAt: new Date(Date.now() - (10 - idx) * 60000).toISOString(),
    });
  });

  return images;
}
