import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Criterion } from '../core/types';

export function parseCriterionFile(filePath: string): Criterion | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parts = content.split('---');

    if (parts.length < 3) {
      return null;
    }

    const frontmatterStr = parts[1];
    const bodyStr = parts.slice(2).join('---');

    const frontmatter = yaml.load(frontmatterStr) as Record<string, unknown>;
    const sections = parseSections(bodyStr);

    if (!sections) {
      return null;
    }

    return {
      filePath,
      id: (frontmatter.id as string) || '',
      domain: (frontmatter.domain as string) as any,
      status: (frontmatter.status as string) as any,
      core: (frontmatter.core as boolean) || false,
      since: (frontmatter.since as string) || '',
      revised: frontmatter.revised as string | undefined,
      sections,
    };
  } catch {
    return null;
  }
}

function parseSections(
  content: string
): {
  criterion: string;
  whyItMatters: string;
  howItsAssessed: string;
  meets: string;
  doesNotMeet: string;
  scopeNote: string;
  mappings: string;
} | null {
  const sectionNames = [
    'Criterion',
    'Why it matters',
    'How it\'s assessed',
    'Meets',
    'Does not meet',
    'Scope note',
    'Mappings',
  ];

  const sections: Record<string, string> = {};
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^#{1,2}\s+(.+)$/);

    if (headerMatch) {
      const sectionName = headerMatch[1].trim();
      if (sectionNames.includes(sectionName)) {
        // Find content until next header
        let sectionContent = '';
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^#{1,2}\s+/)) {
          sectionContent += lines[j] + '\n';
          j++;
        }

        const key = sectionName.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '');
        sections[key] = sectionContent.trim();
      }
    }
  }

  // Map to expected keys
  return {
    criterion: sections['criterion'] || '',
    whyItMatters: sections['why_it_matters'] || '',
    howItsAssessed: sections['how_its_assessed'] || '',
    meets: sections['meets'] || '',
    doesNotMeet: sections['does_not_meet'] || '',
    scopeNote: sections['scope_note'] || '',
    mappings: sections['mappings'] || '',
  };
}
