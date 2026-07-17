import { validateMaterialTermLinking } from './r10';
import { Criterion } from '../core/types';

describe('R-10: Material term linking', () => {
  it('passes when material contribution is linked in Criterion section', () => {
    const criterion = createCriterion(
      'Test material contribution to the code. See [material contribution](glossary.md#material-contribution).'
    );
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('passes when material change is linked in How it\'s assessed section', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'Check for material changes.',
        whyItMatters: 'Test',
        howItsAssessed: 'Assess whether there is a [material change](glossary.md#material-change).',
        meets: 'Test',
        doesNotMeet: 'Test',
        scopeNote: 'Test',
        mappings: 'Test',
      },
    };
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when material contribution is used but not linked', () => {
    const criterion = createCriterion(
      'Test material contribution to the code without linking.'
    );
    const result = validateMaterialTermLinking([criterion]);
    expect(result.some((v) => v.message.includes('material contribution'))).toBe(true);
  });

  it('fails when material change is used but not linked', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'Test',
        whyItMatters: 'Test',
        howItsAssessed: 'Check for material change.',
        meets: 'Test',
        doesNotMeet: 'Test',
        scopeNote: 'Test',
        mappings: 'Test',
      },
    };
    const result = validateMaterialTermLinking([criterion]);
    expect(result.some((v) => v.message.includes('material change'))).toBe(true);
  });

  it('ignores "immaterial"', () => {
    const criterion = createCriterion(
      'Immaterial issues can be ignored.'
    );
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('ignores "materials"', () => {
    const criterion = createCriterion(
      'The materials were reviewed.'
    );
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('ignores unrelated "material"', () => {
    const criterion = createCriterion(
      'The material was reviewed for quality.'
    );
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('passes when no material terms are used', () => {
    const criterion = createCriterion('This criterion has no material terms.');
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when material contribution appears in multiple places but not linked', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'Check for material contribution.',
        whyItMatters: 'Test',
        howItsAssessed: 'Evaluate material contribution.',
        meets: 'Test',
        doesNotMeet: 'Test',
        scopeNote: 'Test',
        mappings: 'Test',
      },
    };
    const result = validateMaterialTermLinking([criterion]);
    expect(result.length).toBe(1);
    expect(result[0].message).toContain('material contribution');
  });

  it('passes when linked in Criterion section', () => {
    const criterion: Criterion = {
      filePath: 'test.md',
      id: 'SPEC-01',
      domain: 'SPEC',
      status: 'active',
      core: false,
      since: '1.0.0',
      sections: {
        criterion: 'Check for [material contribution](glossary.md#material-contribution).',
        whyItMatters: 'Test',
        howItsAssessed: 'Evaluate material contribution.',
        meets: 'Test',
        doesNotMeet: 'Test',
        scopeNote: 'Test',
        mappings: 'Test',
      },
    };
    const result = validateMaterialTermLinking([criterion]);
    expect(result).toEqual([]);
  });
});

function createCriterion(criterion: string): Criterion {
  return {
    filePath: 'test.md',
    id: 'SPEC-01',
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
