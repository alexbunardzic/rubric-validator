import { Criterion, Violation } from '../core/types';

const GLOSSARY_LINK_PATTERN = /\[([^\]]+)\]\(glossary\.md#([^)]+)\)/g;

function extractGlossaryLinks(text: string): Array<{ label: string; anchor: string }> {
  const links: Array<{ label: string; anchor: string }> = [];
  let match;

  const regex = new RegExp(GLOSSARY_LINK_PATTERN);
  while ((match = regex.exec(text)) !== null) {
    const label = match[1];
    const anchor = match[2];
    links.push({ label, anchor });
  }

  return links;
}

export function validateGlossaryAnchors(
  criteria: Criterion[],
  glossaryAnchors: Set<string>
): Violation[] {
  const violations: Violation[] = [];

  for (const criterion of criteria) {
    const { filePath, sections } = criterion;

    // Check all sections for glossary links
    const sectionValues = Object.values(sections);
    for (const sectionContent of sectionValues) {
      const links = extractGlossaryLinks(sectionContent);

      for (const { anchor } of links) {
        if (!glossaryAnchors.has(anchor)) {
          violations.push({
            file: filePath,
            rule: 'R-09',
            message: `Glossary anchor #${anchor} does not exist`,
          });
        }
      }
    }
  }

  return violations;
}
