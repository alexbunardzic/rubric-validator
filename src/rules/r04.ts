import { Criterion, Violation } from '../core/types';

const PLACEHOLDER_PATTERNS = [
  /^TBD$/i,
  /to be added/i,
  /to be written/i,
  /coming soon/i,
  /^\s*[\.\-_?!]+\s*$/,
  /^-\s*$/,
];

function isPlaceholder(text: string): boolean {
  const trimmed = text.trim();

  if (!trimmed) {
    return true;
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }

  return false;
}

export function validateGroundedExamples(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];

  for (const criterion of criteria) {
    if (!criterion.core) {
      continue;
    }

    const { filePath, sections } = criterion;

    if (isPlaceholder(sections.meets)) {
      violations.push({
        file: filePath,
        rule: 'R-04',
        message: 'Meets section is not grounded (contains placeholder or is empty)',
      });
    }

    if (isPlaceholder(sections.doesNotMeet)) {
      violations.push({
        file: filePath,
        rule: 'R-04',
        message: 'Does not meet section is not grounded (contains placeholder or is empty)',
      });
    }
  }

  return violations;
}
