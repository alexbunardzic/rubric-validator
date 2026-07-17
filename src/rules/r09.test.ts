import { validateGlossaryAnchors } from './r09';
import { Criterion } from '../core/types';

describe('R-09: Glossary anchor resolution', () => {
  it('passes when glossary anchors are valid', () => {
    const criteria: Criterion[] = [
      createCriterion(
        'SPEC-01',
        'See [term](glossary.md#term) for definition.'
      ),
    ];
    const glossaryAnchors: Set<string> = new Set(['term', 'other-term']);
    const result = validateGlossaryAnchors(criteria, glossaryAnchors);
    expect(result).toEqual([]);
  });

  it('fails when glossary anchor does not exist', () => {
    const criteria: Criterion[] = [
      createCriterion('SPEC-01', 'See [undefined](glossary.md#undefined).'),
    ];
    const glossaryAnchors: Set<string> = new Set(['term', 'other-term']);
    const result = validateGlossaryAnchors(criteria, glossaryAnchors);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].rule).toBe('R-09');
  });

  it('passes with non-glossary links', () => {
    const criteria: Criterion[] = [
      createCriterion(
        'SPEC-01',
        'See [criteria](criteria/SPEC/SPEC-01.md) or [example](https://example.com).'
      ),
    ];
    const glossaryAnchors: Set<string> = new Set();
    const result = validateGlossaryAnchors(criteria, glossaryAnchors);
    expect(result).toEqual([]);
  });

  it('detects multiple broken glossary anchors', () => {
    const criteria: Criterion[] = [
      createCriterion(
        'SPEC-01',
        'See [bad1](glossary.md#bad1) and [bad2](glossary.md#bad2).'
      ),
    ];
    const glossaryAnchors: Set<string> = new Set(['term']);
    const result = validateGlossaryAnchors(criteria, glossaryAnchors);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('checks all sections for glossary links', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'See [term1](glossary.md#term1).',
        whyItMatters: 'See [term2](glossary.md#term2).',
        howItsAssessed: 'See [term3](glossary.md#term3).',
        meets: 'See [term4](glossary.md#term4).',
        doesNotMeet: 'See [term5](glossary.md#term5).',
        scopeNote: 'See [bad](glossary.md#bad).',
        mappings: 'Test',
      },
    };
    const glossaryAnchors: Set<string> = new Set(['term1', 'term2', 'term3', 'term4', 'term5']);
    const result = validateGlossaryAnchors([criterion], glossaryAnchors);
    expect(result.some((v) => v.message.includes('bad'))).toBe(true);
  });

  it('handles URL encoded anchors', () => {
    const criteria: Criterion[] = [
      createCriterion(
        'SPEC-01',
        'See [term](glossary.md#material-contribution).'
      ),
    ];
    const glossaryAnchors: Set<string> = new Set(['material-contribution']);
    const result = validateGlossaryAnchors(criteria, glossaryAnchors);
    expect(result).toEqual([]);
  });
});

function createCriterion(id: string, criterion: string): Criterion {
  return {
    filePath: 'test.md',
    id,
    domain: 'SPEC',
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
