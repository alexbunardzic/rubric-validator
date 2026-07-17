import { Criterion, Violation } from '../core/types';

const GLOSSARY_LINK_PATTERN = /\[([^\]]+)\]\(glossary\.md#([^)]+)\)/g;

const MATERIAL_CONTRIBUTION_PATTERN = /material\s+contribution/i;
const MATERIAL_CHANGE_PATTERN = /material\s+change/i;

function hasGlossaryLink(text: string, anchor: string): boolean {
  let match;
  const regex = new RegExp(GLOSSARY_LINK_PATTERN);

  while ((match = regex.exec(text)) !== null) {
    if (match[2] === anchor) {
      return true;
    }
  }

  return false;
}

function usesLoadBearingMaterial(text: string): Array<{ term: string; anchor: string }> {
  const usedTerms: Array<{ term: string; anchor: string }> = [];

  // Check for "material contribution" (but not in exclusion contexts)
  if (MATERIAL_CONTRIBUTION_PATTERN.test(text)) {
    // Exclude cases like "immaterial", "materials", or "the material was"
    if (
      !text.match(/immaterial/i) &&
      !text.match(/materials\s+/i) &&
      !text.match(/the\s+material\s+was/i)
    ) {
      usedTerms.push({ term: 'material contribution', anchor: 'material-contribution' });
    }
  }

  // Check for "material change" (but not in exclusion contexts)
  if (MATERIAL_CHANGE_PATTERN.test(text)) {
    if (
      !text.match(/immaterial/i) &&
      !text.match(/materials\s+/i) &&
      !text.match(/the\s+material\s+was/i)
    ) {
      usedTerms.push({ term: 'material change', anchor: 'material-change' });
    }
  }

  return usedTerms;
}

export function validateMaterialTermLinking(criteria: Criterion[]): Violation[] {
  const violations: Violation[] = [];

  for (const criterion of criteria) {
    const { filePath, sections } = criterion;
    const allText = Object.values(sections).join(' ');

    // Check if criterion uses material terms
    const materialTerms = usesLoadBearingMaterial(allText);

    for (const { term, anchor } of materialTerms) {
      // Check if the term is linked anywhere in the criterion or howItsAssessed sections
      const relevantSections = [sections.criterion, sections.howItsAssessed];
      const isLinked = relevantSections.some((section) => hasGlossaryLink(section, anchor));

      if (!isLinked) {
        violations.push({
          file: filePath,
          rule: 'R-10',
          message: `Criterion uses "${term}" in load-bearing sense but does not link to glossary definition`,
        });
      }
    }
  }

  return violations;
}
