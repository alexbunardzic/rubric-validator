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

function hasBindingLanguage(text: string): boolean {
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

    // Extract context around the link
    const start = Math.max(0, match.index - 50);
    const end = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.substring(start, end);

    links.push({ id, context });
  }

  return links;
}

function getBindingDependencies(
  criterion: Criterion,
  criteriaMap: Map<string, Criterion>
): Set<string> {
  const dependencies = new Set<string>();

  // Check criterion and scopeNote sections
  for (const sectionContent of [criterion.sections.criterion, criterion.sections.scopeNote]) {
    const links = extractCriteriaLinksWithContext(sectionContent);

    for (const { id, context } of links) {
      if (criteriaMap.has(id) && hasBindingLanguage(context)) {
        dependencies.add(id);
      }
    }
  }

  return dependencies;
}

export function validateCoreSetClosure(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  for (const criterion of criteria) {
    if (!criterion.core) {
      continue;
    }

    const bindingDeps = getBindingDependencies(criterion, criteriaMap);

    for (const depId of bindingDeps) {
      const depCriterion = criteriaMap.get(depId)!;

      if (!depCriterion.core) {
        violations.push({
          file: criterion.filePath,
          rule: 'R-08',
          message: `Core criterion depends on non-core criterion ${depId}`,
        });
      }
    }
  }

  return violations;
}
