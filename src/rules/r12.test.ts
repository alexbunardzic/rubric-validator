import { validateCoreSetEquality } from './r12';
import { Criterion } from '../core/types';

describe('R-12: Core set equality', () => {
  it('passes when core criteria match threshold table', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', true),
      createCriterion('SPEC-02', false),
      createCriterion('VER-01', true),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
      { id: 'VER-01', status: 'active', core: true },
    ];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result).toEqual([]);
  });

  it('fails when core criterion is missing from threshold table', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', true),
      createCriterion('SPEC-02', true),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
    ];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('SPEC-02'))).toBe(true);
  });

  it('fails when non-core criterion is marked as core in threshold table', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', false),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
    ];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('SPEC-01'))).toBe(true);
  });

  it('fails in both directions', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', true),
      createCriterion('SPEC-02', false),
      createCriterion('SPEC-03', true),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
      { id: 'SPEC-04', status: 'active', core: true },
    ];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('passes with empty core sets', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', false),
      createCriterion('SPEC-02', false),
    ];
    const thresholdEntries: any[] = [];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result).toEqual([]);
  });

  it('catches mismatch across multiple domains', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', true),
      createCriterion('VER-01', true),
      createCriterion('AGENT-01', false),
    ];
    const thresholdEntries = [
      { id: 'SPEC-01', status: 'active', core: true },
      { id: 'AGENT-01', status: 'active', core: true },
    ];
    const result = validateCoreSetEquality(criteria, thresholdEntries);
    expect(result.some((v) => v.message.includes('VER-01'))).toBe(true);
  });
});

function createCriterion(id: string, core: boolean): Criterion {
  const [family] = id.split('-');
  return {
    filePath: `criteria/${family}/${id}.md`,
    id,
    domain: family as any,
    status: 'active',
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
