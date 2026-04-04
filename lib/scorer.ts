import type { RubricCriterion } from '@/types';

export function exactMatch(expected: string, actual: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
  return normalize(expected) === normalize(actual);
}

export function computeWeightedScore(
  criterionScores: Record<string, number>,
  rubric: RubricCriterion[]
): number {
  const total = rubric.reduce((s, r) => s + r.weight, 0);
  if (total === 0) return 0;
  let score = 0;
  for (const r of rubric) {
    const s = criterionScores[r.id];
    if (s !== undefined) {
      score += (s * r.weight) / total;
    }
  }
  return Math.round(score);
}
