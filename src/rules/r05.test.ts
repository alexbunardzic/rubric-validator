import { validateSubstantiveFailurePattern } from './r05';
import { Criterion } from '../core/types';

describe('R-05: Substantive failure pattern for active criteria', () => {
  it('passes with active criterion having substantive failure pattern', () => {
    const criterion = createCriterion('active', `
The criterion fails when:
- The spec is incomplete
- The implementation does not follow the spec
- The tests do not cover edge cases
`);
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toEqual([]);
  });

  it('passes with draft criterion having placeholder', () => {
    const criterion = createCriterion('draft', 'TBD');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when active criterion has empty Does not meet', () => {
    const criterion = createCriterion('active', '');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-05');
  });

  it('fails when active criterion has placeholder text', () => {
    const criterion = createCriterion('active', 'TBD');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-05');
  });

  it('fails when active criterion has single trivial line', () => {
    const criterion = createCriterion('active', 'The spec is incomplete.');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-05');
  });

  it('passes with multi-line substantive content', () => {
    const criterion = createCriterion('active', `
The criterion fails when one or more of:
1. The specification is incomplete or ambiguous.
2. The implementation contradicts the specification.
3. The verification process is insufficient.
`);
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toEqual([]);
  });

  it('passes with deprecated criterion having placeholder', () => {
    const criterion = createCriterion('deprecated', '...');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when active criterion has only "to be added"', () => {
    const criterion = createCriterion('active', 'to be added');
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-05');
  });

  it('passes with multiple substantive paragraphs', () => {
    const criterion = createCriterion('active', `
The criterion fails when:

The specification lacks clarity or completeness. Examples include:
- Undefined terms used without glossary reference
- Edge cases not addressed
- Contradictory requirements

The verification process is insufficient because:
- Tests do not cover documented behavior
- Acceptance criteria are not met
`);
    const result = validateSubstantiveFailurePattern([criterion]);
    expect(result).toEqual([]);
  });
});

function createCriterion(status: string, doesNotMeet: string): Criterion {
  return {
    filePath: 'test.md',
    id: 'SPEC-01',
    domain: 'SPEC',
    status: status as any,
    core: false,
    since: '1.0.0',
    sections: {
      criterion: 'Test',
      whyItMatters: 'Test',
      howItsAssessed: 'Test',
      meets: 'Test',
      doesNotMeet,
      scopeNote: 'Test',
      mappings: 'Test',
    },
  };
}
