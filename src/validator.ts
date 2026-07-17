import * as fs from 'fs';
import * as path from 'path';
import { Criterion, Violation } from './core/types';
import { parseCriterionFile } from './parsers/criterion';
import { parseGlossaryAnchors } from './parsers/glossary';
import { parseThresholds } from './parsers/thresholds';
import { validateFrontmatter } from './rules/r01';
import { validateBodySections } from './rules/r02';
import { validateIds } from './rules/r03';
import { validateGroundedExamples } from './rules/r04';
import { validateSubstantiveFailurePattern } from './rules/r05';
import { validateCrossReferences } from './rules/r06';
import { validateBindingDependencies } from './rules/r07';
import { validateCoreSetClosure } from './rules/r08';
import { validateGlossaryAnchors } from './rules/r09';
import { validateMaterialTermLinking } from './rules/r10';
import { validateThresholdConsistency } from './rules/r11';
import { validateCoreSetEquality } from './rules/r12';

export class Validator {
  private rubricRoot: string;
  private violations: Violation[] = [];

  constructor(rubricRoot: string) {
    this.rubricRoot = rubricRoot;
  }

  validate(): Violation[] {
    this.violations = [];

    // Load all criteria
    const criteria = this.loadCriteria();
    if (criteria.length === 0) {
      return this.violations;
    }

    // Load glossary and thresholds
    const glossaryAnchors = parseGlossaryAnchors(
      path.join(this.rubricRoot, 'glossary.md')
    );
    const thresholdsContent = this.readFile(
      path.join(this.rubricRoot, 'thresholds.md')
    );
    const thresholdEntries = thresholdsContent
      ? parseThresholds(thresholdsContent)
      : [];

    // Run all validation rules
    this.violations.push(...this.validateStructuralConformance(criteria));
    this.violations.push(...this.validateExampleGrounding(criteria));
    this.violations.push(...this.validateDependencyIntegrity(criteria));
    this.violations.push(...this.validateReferenceResolution(criteria, glossaryAnchors));
    this.violations.push(
      ...this.validateThresholdConsistency(criteria, thresholdEntries)
    );

    return this.violations;
  }

  private loadCriteria(): Criterion[] {
    const criteria: Criterion[] = [];
    const criteriaDir = path.join(this.rubricRoot, 'rubric', 'criteria');

    if (!fs.existsSync(criteriaDir)) {
      return criteria;
    }

    // Find all .md files in domain subdirectories
    const domains = fs.readdirSync(criteriaDir);
    for (const domain of domains) {
      const domainPath = path.join(criteriaDir, domain);
      if (!fs.statSync(domainPath).isDirectory()) {
        continue;
      }

      const files = fs.readdirSync(domainPath);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(domainPath, file);
          const criterion = parseCriterionFile(filePath);
          if (criterion) {
            criteria.push(criterion);
          }
        }
      }
    }

    return criteria;
  }

  private readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  private validateStructuralConformance(criteria: Criterion[]): Violation[] {
    const violations: Violation[] = [];

    // R-01: Frontmatter validation (run during parsing, but validate here too)
    for (const criterion of criteria) {
      // We could re-validate here if needed
    }

    // R-02: Body sections
    for (const criterion of criteria) {
      const filePath = path.join(this.rubricRoot, criterion.filePath);
      const content = this.readFile(filePath);
      if (content) {
        violations.push(...validateBodySections(content, criterion.filePath));
      }
    }

    // R-03: ID format and uniqueness
    violations.push(...validateIds(criteria));

    return violations;
  }

  private validateExampleGrounding(criteria: Criterion[]): Violation[] {
    const violations: Violation[] = [];

    // R-04: Grounded examples for core criteria
    violations.push(...validateGroundedExamples(criteria));

    // R-05: Substantive failure pattern for active criteria
    violations.push(...validateSubstantiveFailurePattern(criteria));

    return violations;
  }

  private validateDependencyIntegrity(criteria: Criterion[]): Violation[] {
    const violations: Violation[] = [];

    // R-06: Cross-references
    violations.push(...validateCrossReferences(criteria));

    // R-07: Binding dependencies
    violations.push(...validateBindingDependencies(criteria));

    // R-08: Core set closure
    violations.push(...validateCoreSetClosure(criteria));

    return violations;
  }

  private validateReferenceResolution(
    criteria: Criterion[],
    glossaryAnchors: Set<string>
  ): Violation[] {
    const violations: Violation[] = [];

    // R-09: Glossary anchors
    violations.push(...validateGlossaryAnchors(criteria, glossaryAnchors));

    // R-10: Material term linking
    violations.push(...validateMaterialTermLinking(criteria));

    return violations;
  }

  private validateThresholdConsistency(
    criteria: Criterion[],
    thresholdEntries: any[]
  ): Violation[] {
    const violations: Violation[] = [];

    // R-11: Threshold consistency
    violations.push(...validateThresholdConsistency(criteria, thresholdEntries));

    // R-12: Core set equality
    violations.push(...validateCoreSetEquality(criteria, thresholdEntries));

    return violations;
  }
}
