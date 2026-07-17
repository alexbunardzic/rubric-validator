import { Violation } from '../core/types';

const REQUIRED_SECTIONS = [
  'Criterion',
  'Why it matters',
  'How it\'s assessed',
  'Meets',
  'Does not meet',
  'Scope note',
  'Mappings',
];

interface SectionMatch {
  name: string;
  startLine: number;
  content: string;
}

export function validateBodySections(
  content: string,
  filePath: string
): Violation[] {
  const violations: Violation[] = [];
  const sections = extractSections(content);

  // Check if all required sections exist
  const sectionNames = sections.map((s) => s.name);
  for (const required of REQUIRED_SECTIONS) {
    if (!sectionNames.includes(required)) {
      violations.push({
        file: filePath,
        rule: 'R-02',
        message: `Missing required section: ${required}`,
      });
    }
  }

  // Check order
  const foundIndices = sectionNames
    .map((name) => REQUIRED_SECTIONS.indexOf(name))
    .filter((idx) => idx !== -1);

  for (let i = 1; i < foundIndices.length; i++) {
    if (foundIndices[i] <= foundIndices[i - 1]) {
      violations.push({
        file: filePath,
        rule: 'R-02',
        message: 'Sections are not in the required order',
      });
      break;
    }
  }

  // Check for empty sections
  for (const section of sections) {
    const trimmed = section.content.trim();
    if (!trimmed) {
      violations.push({
        file: filePath,
        rule: 'R-02',
        message: `Section "${section.name}" is empty`,
      });
    }
  }

  return violations;
}

function extractSections(content: string): SectionMatch[] {
  const sections: SectionMatch[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^#{1,2}\s+(.+)$/);

    if (headerMatch) {
      const sectionName = headerMatch[1].trim();
      if (REQUIRED_SECTIONS.includes(sectionName)) {
        // Find content until next header
        let content = '';
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^#{1,2}\s+/)) {
          content += lines[j] + '\n';
          j++;
        }

        sections.push({
          name: sectionName,
          startLine: i,
          content: content.trim(),
        });
      }
    }
  }

  return sections;
}
