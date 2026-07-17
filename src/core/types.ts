export type CriterionStatus = 'draft' | 'active' | 'deprecated';
export type Domain = 'SPEC' | 'VER' | 'AGENT' | 'HUMAN' | 'EVOLVE' | 'PROV';

export interface Criterion {
  filePath: string;
  id: string;
  domain: Domain;
  status: CriterionStatus;
  core: boolean;
  since: string;
  revised?: string;
  sections: {
    criterion: string;
    whyItMatters: string;
    howItsAssessed: string;
    meets: string;
    doesNotMeet: string;
    scopeNote: string;
    mappings: string;
  };
}

export interface ParsedCriteria {
  criteria: Criterion[];
  glossaryAnchors: Set<string>;
  coreInThresholds: Set<string>;
}

export interface ValidationResult {
  violations: Violation[];
  exitCode: number;
}

export interface Violation {
  file: string;
  rule: string;
  message: string;
}
