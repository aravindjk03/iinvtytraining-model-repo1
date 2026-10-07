/**
 * Formats a workflow status or stage for clean presentation.
 */
export function formatStageLabel(stage: string): string {
  return stage
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncates text with an ellipsis if length exceeds max.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
