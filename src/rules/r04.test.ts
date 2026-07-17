import { validateGroundedExamples } from './r04';
import { Criterion } from '../core/types';

describe('R-04: Grounded examples for core criteria', () => {
  it('passes with core criterion having grounded Meets and Does not meet', () => {
    const criterion = createCriterion(true, 'Real example.', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result).toEqual([]);
  });

  it('passes with non-core criterion having placeholder text', () => {
    const criterion = createCriterion(false, 'TBD', '...');
    const result = validateGroundedExamples([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when core criterion has empty Meets section', () => {
    const criterion = createCriterion(true, '', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Meets'))).toBe(true);
  });

  it('fails when core criterion has empty Does not meet section', () => {
    const criterion = createCriterion(true, 'Real example.', '');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Does not meet'))).toBe(true);
  });

  it('fails when core criterion has TBD in Meets', () => {
    const criterion = createCriterion(true, 'TBD', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Meets'))).toBe(true);
  });

  it('fails when core criterion has "to be added" in Does not meet', () => {
    const criterion = createCriterion(true, 'Real example.', 'to be added');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Does not meet'))).toBe(true);
  });

  it('fails when core criterion has "to be written" in Meets', () => {
    const criterion = createCriterion(true, 'to be written', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Meets'))).toBe(true);
  });

  it('fails when core criterion has "coming soon" in Does not meet', () => {
    const criterion = createCriterion(true, 'Real example.', 'coming soon');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Does not meet'))).toBe(true);
  });

  it('fails when core criterion has lone punctuation in Meets', () => {
    const criterion = createCriterion(true, '...', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Meets'))).toBe(true);
  });

  it('fails when core criterion has empty list item in Does not meet', () => {
    const criterion = createCriterion(true, 'Real example.', '- ');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Does not meet'))).toBe(true);
  });

  it('allows "material" and other normal words in core criterion', () => {
    const criterion = createCriterion(
      true,
      'Material contribution to the project.',
      'Did not make a material change.'
    );
    const result = validateGroundedExamples([criterion]);
    expect(result).toEqual([]);
  });

  it('fails when core criterion has only whitespace in Meets', () => {
    const criterion = createCriterion(true, '   \n   ', 'Real failure case.');
    const result = validateGroundedExamples([criterion]);
    expect(result.some((v) => v.message.includes('Meets'))).toBe(true);
  });
});

function createCriterion(core: boolean, meets: string, doesNotMeet: string): Criterion {
  return {
    filePath: 'test.md',
    id: 'SPEC-01',
    domain: 'SPEC',
    status: 'active',
    core,
    since: '1.0.0',
    sections: {
      criterion: 'Test',
      whyItMatters: 'Test',
      howItsAssessed: 'Test',
      meets,
      doesNotMeet,
      scopeNote: 'Test',
      mappings: 'Test',
    },
  };
}
