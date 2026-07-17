import { Violation } from '../core/types';

const VALID_STATUSES = ['draft', 'active', 'deprecated'];
const VALID_DOMAINS = ['SPEC', 'VER', 'AGENT', 'HUMAN', 'EVOLVE', 'PROV'];

export function validateFrontmatter(
  frontmatter: Record<string, unknown>,
  filePath: string
): Violation[] {
  const violations: Violation[] = [];

  // Check required fields
  if (!frontmatter.id || typeof frontmatter.id !== 'string') {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: 'Missing or invalid id field',
    });
  }

  if (!frontmatter.domain || typeof frontmatter.domain !== 'string') {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: 'Missing or invalid domain field',
    });
  } else if (!VALID_DOMAINS.includes(frontmatter.domain as string)) {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: `Invalid domain: ${frontmatter.domain}. Must be one of: ${VALID_DOMAINS.join(', ')}`,
    });
  }

  if (!frontmatter.status || typeof frontmatter.status !== 'string') {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: 'Missing or invalid status field',
    });
  } else if (!VALID_STATUSES.includes(frontmatter.status as string)) {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: `Invalid status: ${frontmatter.status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  if (typeof frontmatter.core !== 'boolean') {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: 'core field must be a boolean',
    });
  }

  if (!frontmatter.since || typeof frontmatter.since !== 'string') {
    violations.push({
      file: filePath,
      rule: 'R-01',
      message: 'Missing or invalid since field',
    });
  }

  return violations;
}
