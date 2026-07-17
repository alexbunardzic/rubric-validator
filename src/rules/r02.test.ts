import { validateBodySections } from './r02';

describe('R-02: Body sections validation', () => {
  it('passes with all seven sections in correct order', () => {
    const content = `
# Criterion

This is the criterion.

## Why it matters

This is why it matters.

## How it's assessed

This is how it's assessed.

## Meets

This meets the criterion.

## Does not meet

This does not meet the criterion.

## Scope note

This is the scope note.

## Mappings

These are the mappings.
`;
    const result = validateBodySections(content, 'test.md');
    expect(result).toEqual([]);
  });

  it('fails when Criterion section is missing', () => {
    const content = `
# Why it matters

This is why it matters.

## How it's assessed

This is how it's assessed.

## Meets

This meets the criterion.

## Does not meet

This does not meet the criterion.

## Scope note

This is the scope note.

## Mappings

These are the mappings.
`;
    const result = validateBodySections(content, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-02');
    expect(result[0].message).toContain('Criterion');
  });

  it('fails when sections are in wrong order', () => {
    const content = `
# Criterion

This is the criterion.

## How it's assessed

This is how it's assessed.

## Why it matters

This is why it matters.

## Meets

This meets the criterion.

## Does not meet

This does not meet the criterion.

## Scope note

This is the scope note.

## Mappings

These are the mappings.
`;
    const result = validateBodySections(content, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-02');
  });

  it('fails when a section is empty', () => {
    const content = `
# Criterion

# Why it matters

This is why it matters.

## How it's assessed

This is how it's assessed.

## Meets

This meets the criterion.

## Does not meet

This does not meet the criterion.

## Scope note

This is the scope note.

## Mappings

These are the mappings.
`;
    const result = validateBodySections(content, 'test.md');
    expect(result).toHaveLength(1);
    expect(result[0].rule).toBe('R-02');
    expect(result[0].message).toContain('empty');
  });

  it('fails when Mappings section is missing', () => {
    const content = `
# Criterion

This is the criterion.

## Why it matters

This is why it matters.

## How it's assessed

This is how it's assessed.

## Meets

This meets the criterion.

## Does not meet

This does not meet the criterion.

## Scope note

This is the scope note.
`;
    const result = validateBodySections(content, 'test.md');
    expect(result.some((v) => v.message.includes('Mappings'))).toBe(true);
  });
});
