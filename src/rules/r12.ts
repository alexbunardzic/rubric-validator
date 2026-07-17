import { Criterion, Violation } from '../core/types';

interface ThresholdEntry {
  id: string;
  status: string;
  core: boolean;
}

export function validateCoreSetEquality(
  criteria: Criterion[],
  thresholdEntries: ThresholdEntry[]
): Violation[] {
  const violations: Violation[] = [];

  const coreCriteria = new Set(criteria.filter((c) => c.core).map((c) => c.id));
  const coreInThreshold = new Set(
    thresholdEntries.filter((e) => e.core).map((e) => e.id)
  );

  // Check for core criteria missing from threshold table
  for (const id of coreCriteria) {
    if (!coreInThreshold.has(id)) {
      const criterion = criteria.find((c) => c.id === id)!;
      violations.push({
        file: criterion.filePath,
        rule: 'R-12',
        message: `Core criterion ${id} is not in the threshold table's core set`,
      });
    }
  }

  // Check for non-core criteria marked as core in threshold table
  for (const id of coreInThreshold) {
    if (!coreCriteria.has(id)) {
      violations.push({
        file: 'thresholds.md',
        rule: 'R-12',
        message: `Threshold table marks ${id} as core, but the criterion file has core: false`,
      });
    }
  }

  return violations;
}
