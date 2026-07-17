import { validateCrossReferences } from './r06';
import { Criterion } from '../core/types';

describe('R-06: Cross-reference resolution', () => {
  it('passes when all cross-references resolve', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'See [SPEC-02](criteria/SPEC/SPEC-02.md) for details.'),
      createCriterion('SPEC-02', 'Related to [SPEC-01](criteria/SPEC/SPEC-01.md).'),
    ];
    const result = validateCrossReferences(criteria);
    expect(result).toEqual([]);
  });

  it('fails when cross-reference points to non-existent file', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'See [SPEC-99](criteria/SPEC/SPEC-99.md) for details.'),
    ];
    const result = validateCrossReferences(criteria);
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-06');
    expect(result[0].message).toContain('SPEC-99');
  });

  it('passes with non-criteria links', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'See [example](https://example.com) for details.'),
    ];
    const result = validateCrossReferences(criteria);
    expect(result).toEqual([]);
  });

  it('detects multiple broken cross-references in one section', () => {
    const criteria: Criterion[] = [
      createCriterion(
        'SPEC-01',
        'See [SPEC-99](criteria/SPEC/SPEC-99.md) and [VER-88](criteria/VER/VER-88.md).'
      ),
    ];
    const result = validateCrossReferences(criteria);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((v) => v.rule === 'R-06')).toBe(true);
  });

  it('checks all sections for cross-references', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'See [SPEC-99](criteria/SPEC/SPEC-99.md).',
        whyItMatters: 'Test',
        howItsAssessed: 'Test',
        meets: 'See [AGENT-88](criteria/AGENT/AGENT-88.md).',
        doesNotMeet: 'Test',
        scopeNote: 'See [VER-77](criteria/VER/VER-77.md).',
        mappings: 'Test',
      },
    };
    const result = validateCrossReferences([criterion]);
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it('handles links across different domains', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', ''),
      createCriterion('VER-01', ''),
      createCriterion('AGENT-01', ''),
    ];
    const criterion = createCriterion('HUMAN-01', '');
    criterion.sections.criterion = 'See [SPEC-01](criteria/SPEC/SPEC-01.md), [VER-01](criteria/VER/VER-01.md), and [AGENT-01](criteria/AGENT/AGENT-01.md).';
    criteria.push(criterion);

    const result = validateCrossReferences(criteria);
    expect(result).toEqual([]);
  });
});

function createCriterion(id: string, criterion: string): Criterion {
  const [family] = id.split('-');
  return {
    filePath: `criteria/${family}/${id}.md`,
    id,
    domain: family as any,
    status: 'active',
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
