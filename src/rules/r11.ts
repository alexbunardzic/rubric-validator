import { Criterion, Violation } from '../core/types';

interface ThresholdEntry {
  id: string;
  status: string;
  core: boolean;
}

export function validateThresholdConsistency(
  criteria: Criterion[],
  thresholdEntries: ThresholdEntry[]
): Violation[] {
  const violations: Violation[] = [];
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  for (const entry of thresholdEntries) {
    const criterion = criteriaMap.get(entry.id);

    if (!criterion) {
      violations.push({
        file: 'thresholds.md',
        rule: 'R-11',
        message: `Threshold table references non-existent criterion ${entry.id}`,
      });
      continue;
    }

    if (criterion.status !== entry.status) {
      violations.push({
        file: criterion.filePath,
        rule: 'R-11',
        message: `status mismatch: threshold table says ${entry.status}, but file says ${criterion.status}`,
      });
    }

    if (criterion.core !== entry.core) {
      violations.push({
        file: criterion.filePath,
        rule: 'R-11',
        message: `core value mismatch: threshold table says ${entry.core}, but file says ${criterion.core}`,
      });
    }
  }

  return violations;
}
