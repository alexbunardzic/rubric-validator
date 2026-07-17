import { validateThresholdConsistency } from './r11';
import { Criterion } from '../core/types';

describe('R-11: Threshold consistency', () => {
  it('passes when threshold entries match criteria', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', true),
      createCriterion('SPEC-02', 'draft', false),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
      { id: 'SPEC-02', status: 'draft', core: false },
    ];
    const result = validateThresholdConsistency(criteria, thresholdEntries);
    expect(result).toEqual([]);
  });

  it('fails when threshold references non-existent criterion', () => {
    const criteria: Criterion[] = [createCriterion('SPEC-01', 'active', true)];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
      { id: 'SPEC-99', status: 'active', core: true },
    ];
    const result = validateThresholdConsistency(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('SPEC-99'))).toBe(true);
  });

  it('fails when status mismatch between threshold and criterion', () => {
    const criteria: Criterion[] = [createCriterion('SPEC-01', 'active', true)];
    const thresholdEntries = [{ id: 'SPEC-01', status: 'draft', core: true }];
    const result = validateThresholdConsistency(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('status'))).toBe(true);
  });

  it('fails when core value mismatch between threshold and criterion', () => {
    const criteria: Criterion[] = [createCriterion('SPEC-01', 'active', true)];
    const thresholdEntries = [{ id: 'SPEC-01', status: 'active', core: false }];
    const result = validateThresholdConsistency(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('core'))).toBe(true);
  });

  it('detects multiple mismatches', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'active', true),
      createCriterion('SPEC-02', 'draft', false),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'draft', core: false },
      { id: 'SPEC-02', status: 'active', core: true },
    ];
    const result = validateThresholdConsistency(criteria, thresholdEntries);
    expect(result.length).toBeGreaterThan(0);
  });
});

function createCriterion(
  id: string,
  status: string,
  core: boolean
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
      criterion: 'Test',
      whyItMatters: 'Test',
      howItsAssessed: 'Test',
      meets: 'Test',
      doesNotMeet: 'Test',
      scopeNote: 'Test',
      mappings: 'Test',
    },
  };
}
