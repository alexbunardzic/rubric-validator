import { Criterion, Violation } from '../core/types';

const CRITERIA_LINK_PATTERN = /\[([^\]]+)\]\(criteria\/([A-Z]+)\/([A-Z]+-\d+)\.md\)/g;

function extractCriteriaLinks(text: string): Array<{ id: string; link: string }> {
  const links: Array<{ id: string; link: string }> = [];
  let match;

  const regex = new RegExp(CRITERIA_LINK_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const id = match[3];
    const link = match[0];
    links.push({ id, link });
  }

  return links;
}

export function validateCrossReferences(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];
  const criteriaIds = new Set(criteria.map((c) => c.id));

  for (const criterion of criteria) {
    const { filePath, sections } = criterion;

    // Check all sections for cross-references
    const sectionValues = Object.values(sections);
    for (const sectionContent of sectionValues) {
      const links = extractCriteriaLinks(sectionContent);

      for (const { id } of links) {
        if (!criteriaIds.has(id)) {
          violations.push({
            file: filePath,
            rule: 'R-06',
            message: `Cross-reference to ${id} does not resolve to an existing criterion file`,
          });
        }
      }
    }
  }

  return violations;
}
