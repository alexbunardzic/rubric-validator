import { validateFrontmatter } from './r01';

describe('R-01: Frontmatter validation', () => {
  it('passes with valid frontmatter', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: true,
      since: '1.0.0',
      revised: '1.1.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toEqual([]);
  });

  it('fails when id is missing', () => {
    const frontmatter = {
      domain: 'SPEC',
      status: 'active',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails when domain is missing', () => {
    const frontmatter = {
      id: 'SPEC-01',
      status: 'active',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails when status is missing', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails when core is missing', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails when since is missing', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: true,
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails with invalid status value', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'invalid',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails when core is not a boolean', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: 'true',
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('fails with invalid domain', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'INVALID',
      status: 'active',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-01');
  });

  it('allows revised field to be optional', () => {
    const frontmatter = {
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: true,
      since: '1.0.0',
    };
    const result = validateFrontmatter(frontmatter, 'test.md');
    expect(result).toEqual([]);
  });
});
