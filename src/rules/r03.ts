import { Criterion, Violation } from '../core/types';

const VALID_DOMAINS = ['SPEC', 'VER', 'AGENT', 'HUMAN', 'EVOLVE', 'PROV'];
const ID_PATTERN = /^(SPEC|VER|AGENT|HUMAN|EVOLVE|PROV)-(\d+)$/;

export function validateIds(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];
  const idMap = new Map<string, { criterion: Criterion; index: number }[]>();
  const deprecatedIds = new Set<string>();

  // First pass: validate format and collect all IDs
  for (let i = 0; i < criteria.length; i++) {
    const criterion = criteria[i];
    const { id, status, filePath } = criterion;

    if (!ID_PATTERN.test(id)) {
      violations.push({
        file: filePath,
        rule: 'R-03',
        message: `Invalid ID format: ${id}. Must match pattern FAMILY-NN (e.g., SPEC-01)`,
      });
    }

    if (status === 'deprecated') {
      deprecatedIds.add(id);
    }

    if (!idMap.has(id)) {
      idMap.set(id, []);
    }
    idMap.get(id)!.push({ criterion, index: i });
  }

  // Second pass: check uniqueness and retired IDs
  for (const [id, entries] of idMap.entries()) {
    if (entries.length > 1) {
      for (const { criterion } of entries) {
        violations.push({
          file: criterion.filePath,
          rule: 'R-03',
          message: `Duplicate ID: ${id}`,
        });
      }
    }

    // Check if a deprecated ID is being reused
    if (deprecatedIds.has(id) && entries.some((e) => e.criterion.status !== 'deprecated')) {
      for (const { criterion } of entries) {
        if (criterion.status !== 'deprecated') {
          violations.push({
            file: criterion.filePath,
            rule: 'R-03',
            message: `ID ${id} was deprecated and cannot be reused`,
          });
        }
      }
    }
  }

  return violations;
}
