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

function isSubstantive(text: string): boolean {
  const trimmed = text.trim();

  if (isPlaceholder(trimmed)) {
    return false;
  }

  const lines = trimmed.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return false;
  }

  // Single trivial line: one line that is just a sentence without details
  if (lines.length === 1) {
    const line = lines[0].trim();
    // A single line without list items, numbered items, or sufficient length
    const hasListMarker = /^[\*\-\+]\s/.test(line);
    const hasNumberMarker = /^\d+\.\s/.test(line);
    const isSufficient = line.length > 50 || hasListMarker || hasNumberMarker;

    return isSufficient;
  }

  // Multiple lines are considered substantive if they contain:
  // - List items
  // - Multiple sentences
  // - Multiple paragraphs
  const hasListItems = /^[\s]*[\*\-\+\d+\.\)]\s/.test(trimmed);
  const hasParagraphs = trimmed.split('\n\n').length > 1;

  return hasListItems || hasParagraphs || lines.length > 1;
}

export function validateSubstantiveFailurePattern(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];

  for (const criterion of criteria) {
    if (criterion.status !== 'active') {
      continue;
    }

    const { filePath, sections } = criterion;
    const doesNotMeet = sections.doesNotMeet;

    if (!isSubstantive(doesNotMeet)) {
      violations.push({
        file: filePath,
        rule: 'R-05',
        message:
          'Does not meet section must contain concrete, substantive failure patterns (not placeholders or trivial single lines)',
      });
    }
  }

  return violations;
}
