import { validateBindingDependencies } from './r07';
import { Criterion } from '../core/types';

describe('R-07: Binding dependency integrity', () => {
  it('passes when active criterion has no dependencies', () => {
    const criteria: Criterion[] = [createCriterion('SPEC-01', 'active', '')];
    const result = validateBindingDependencies(criteria);
    expect(result).toEqual([]);
  });

  it('passes when active criterion depends on active criterion', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', ''),
      createCriterion('SPEC-02', 'active', 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toEqual([]);
  });

  it('fails when active criterion has binding dependency on draft', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'draft', ''),
      createCriterion(
        'SPEC-02',
        'active',
        'This criterion depends on [SPEC-01](criteria/SPEC/SPEC-01.md) for its verdict.'
      ),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-07');
  });

  it('fails when active criterion has binding dependency on deprecated', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'deprecated', ''),
      createCriterion(
        'SPEC-02',
        'active',
        'The substrate for this criterion is [SPEC-01](criteria/SPEC/SPEC-01.md).'
      ),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-07');
  });

  it('passes when active criterion has non-binding mention of draft', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'draft', ''),
      createCriterion('SPEC-02', 'active', 'See also [SPEC-01](criteria/SPEC/SPEC-01.md) for comparison.'),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toEqual([]);
  });

  it('passes when active criterion has hand-off mention of draft', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'draft', ''),
      createCriterion(
        'SPEC-02',
        'active',
        'Correctness is out of scope; see [SPEC-01](criteria/SPEC/SPEC-01.md).'
      ),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toEqual([]);
  });

  it('detects "if X fails, this criterion fails" as binding', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'draft', ''),
      createCriterion(
        'SPEC-02',
        'active',
        'If [SPEC-01](criteria/SPEC/SPEC-01.md) fails, this criterion fails on that ground first.'
      ),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result.some((v) => v.message.includes('binding'))).toBe(true);
  });

  it('passes for draft and deprecated criteria with any dependencies', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'draft', ''),
      createCriterion('SPEC-02', 'draft', 'This depends on [SPEC-01](criteria/SPEC/SPEC-01.md).'),
      createCriterion('SPEC-03', 'deprecated', 'This depends on [SPEC-02](criteria/SPEC/SPEC-02.md).'),
    ];
    const result = validateBindingDependencies(criteria);
    expect(result).toEqual([]);
  });
});

function createCriterion(id: string, status: string, criterion: string): Criterion {
  const [family] = id.split('-');
  return {
    filePath: `criteria/${family}/${id}.md`,
    id,
    domain: family as any,
    status: status as any,
    core: false,
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
