import { validateCoreSetClosure } from './r08';
import { Criterion } from '../core/types';

describe('R-08: Core set closure', () => {
  it('passes when all core criteria dependencies are core', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', true, ''),
      createCriterion('SPEC-02', 'active', true, 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result).toEqual([]);
  });

  it('fails when core criterion depends on non-core criterion', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', false, ''),
      createCriterion('SPEC-02', 'active', true, 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-08');
  });

  it('passes when non-core criterion depends on non-core criterion', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', false, ''),
      createCriterion('SPEC-02', 'active', false, 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result).toEqual([]);
  });

  it('fails when core criterion depends on non-core via binding', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', false, ''),
      createCriterion('SPEC-02', 'active', true, 'This criterion depends on [SPEC-01](criteria/SPEC/SPEC-01.md) for its verdict.'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result.some((v) => v.message.includes('core'))).toBe(true);
  });

  it('passes when core criterion has non-binding mention of non-core', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', false, ''),
      createCriterion('SPEC-02', 'active', true, 'See also [SPEC-01](criteria/SPEC/SPEC-01.md) for comparison.'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result).toEqual([]);
  });

  it('handles transitive dependencies', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', true, ''),
      createCriterion('SPEC-02', 'active', true, 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
      createCriterion('SPEC-03', 'active', true, 'This depends on [SPEC-02](criteria/SPEC/SPEC-02.md).'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result).toEqual([]);
  });

  it('fails on transitive dependency through non-core', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', false, ''),
      createCriterion('SPEC-02', 'active', true, 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
      createCriterion('SPEC-03', 'active', true, 'This depends on [SPEC-02](criteria/SPEC/SPEC-02.md).'),
    ];
    const result = validateCoreSetClosure(criteria);
    expect(result.some((v) => v.file.includes('SPEC-02'))).toBe(true);
  });
});

function createCriterion(
  id: string,
  status: string,
  core: boolean,
  criterion: string
): Criterion {
  const [family] = id.split('-');
  return {
    filePath: `criteria/${family}/${id}.md`,
    id,
    domain: family as any,
    status: status as any,
    core,
    since: '1.0.0',
    sections: {
      criterion,
      whyItMatters: 'Test',
      howItsAssessed: 'Test',
      meets: 'Test',
      doesNotMeet: 'Test',
      scopeNote: 'Test',
      mappings: 'Test',
    },
  };
}
