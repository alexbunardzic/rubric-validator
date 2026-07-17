import { validateIds } from './r03';
import { Criterion } from '../core/types';

describe('R-03: ID format and uniqueness', () => {
  it('passes with valid unique IDs', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active'),
      createCriterion('VER-02', 'active'),
      createCriterion('AGENT-03', 'draft'),
    ];
    const result = validateIds(criteria);
    expect(result).toEqual([]);
  });

  it('fails when ID does not match pattern', () => {
    const criteria: Criterion[] = [
      createCriterion('INVALID-01', 'active'),
    ];
    const result = validateIds(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-03');
    expect(result[0].message).toContain('pattern');
  });

  it('fails when ID has invalid family', () => {
    const criteria: Criterion[] = [
      createCriterion('BADDOM-01', 'active'),
    ];
    const result = validateIds(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-03');
  });

  it('fails when ID has non-numeric suffix', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-AA', 'active'),
    ];
    const result = validateIds(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-03');
  });

  it('fails when IDs are not unique', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active'),
      createCriterion('SPEC-01', 'draft'),
    ];
    const result = validateIds(criteria);
    expect(result).toHaveLength(2);
    expect(result.every((v) => v.rule === 'R-03')).toBe(true);
  });

  it('fails when deprecated ID is reused', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'deprecated'),
      createCriterion('SPEC-01', 'active'),
    ];
    const result = validateIds(criteria);
    expect(result.some((v) => v.message.includes('reused'))).toBe(true);
  });

  it('allows all valid domain families', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active'),
      createCriterion('VER-01', 'active'),
      createCriterion('AGENT-01', 'active'),
      createCriterion('HUMAN-01', 'active'),
      createCriterion('EVOLVE-01', 'active'),
      createCriterion('PROV-01', 'active'),
    ];
    const result = validateIds(criteria);
    expect(result).toEqual([]);
  });
});

function createCriterion(id: string, status: string): Criterion {
  return {
    filePath: `test-${id}.md`,
    id,
    domain: id.split('-')[0] as any,
    status: status as any,
    core: false,
    since: '1.0.0',
    sections: {
      criterion: 'test',
      whyItMatters: 'test',
      howItsAssessed: 'test',
      meets: 'test',
      doesNotMeet: 'test',
      scopeNote: 'test',
      mappings: 'test',
    },
  };
}
