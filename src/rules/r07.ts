import { Criterion, Violation } from '../core/types';

const CRITERIA_LINK_PATTERN = /\[([^\]]+)\]\(criteria\/([A-Z]+)\/([A-Z]+-\d+)\.md\)/g;

const BINDING_PATTERNS = [
  /depends on/i,
  /fails.*this\s+criterion\s+fails/i,
  /substrate(?:\s+for)?\s+this/i,
  /relies on/i,
  /builds on/i,
];

const NON_BINDING_PATTERNS = [
  /see\s+also/i,
  /compare/i,
  /\s+is\s+out\s+of\s+scope/i,
];

function hasBindingLanguage(text: string, refId: string): boolean {
  // Check if the text has non-binding language
  for (const pattern of NON_BINDING_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }

  // Check if the text has binding language
  for (const pattern of BINDING_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

function extractCriteriaLinksWithContext(
  text: string
): Array<{ id: string; context: string }> {
  const links: Array<{ id: string; context: string }> = [];
  let match;

  const regex = new RegExp(CRITERIA_LINK_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const id = match[3];

    // Extract context around the link (50 chars before and after)
    const start = Math.max(0, match.index - 50);
    const end = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.substring(start, end);

    links.push({ id, context });
  }

  return links;
}

export function validateBindingDependencies(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  for (const criterion of criteria) {
    if (criterion.status !== 'active') {
      continue;
    }

    const { filePath, sections } = criterion;

    // Check criterion and scopeNote sections for binding dependencies
    for (const sectionContent of [sections.criterion, sections.scopeNote]) {
      const links = extractCriteriaLinksWithContext(sectionContent);

      for (const { id, context } of links) {
        const referencedCriterion = criteriaMap.get(id);

        if (
          referencedCriterion &&
          (referencedCriterion.status === 'draft' || referencedCriterion.status === 'deprecated')
        ) {
          // Check if this is a binding dependency
          if (hasBindingLanguage(context, id)) {
            violations.push({
              file: filePath,
              rule: 'R-07',
              message: `Active criterion has binding dependency on ${referencedCriterion.status} criterion ${id}`,
            });
          }
        }
      }
    }
  }

  return violations;
}
