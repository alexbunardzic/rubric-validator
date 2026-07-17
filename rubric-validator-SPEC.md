# `rubric-validator` — Build Specification

## Purpose

A command-line tool that validates a directory of ACG Rubric criterion files
against the rubric's structural rules. It reads the criterion files, the
glossary, and the thresholds document, and reports every conformance violation
it finds.

The tool is used by the Guild to keep the rubric internally consistent as it
grows: new criteria are linted against these rules before they are considered
part of the rubric.

## Inputs

The tool is pointed at a rubric repository root and reads:

- `rubric/criteria/**/*.md` — the criterion files (the primary input).
- `rubric/glossary.md` — the glossary of defined terms.
- `rubric/thresholds.md` — the document declaring which criteria are in the
  core set for each badge level.

## Core data model

A **criterion** is parsed from a single markdown file consisting of YAML
frontmatter followed by six required body sections.

**Frontmatter fields:**

| field     | type    | notes                                        |
|-----------|---------|----------------------------------------------|
| `id`      | string  | e.g. `SPEC-03`                               |
| `domain`  | string  | one of the six domain names                  |
| `status`  | enum    | one of `draft`, `active`, `deprecated`       |
| `core`    | boolean | whether the criterion is in the core set     |
| `since`   | string  | version the criterion first appeared         |
| `revised` | string  | optional; version last revised               |

**Body sections, in this exact order:**

1. `Criterion`
2. `Why it matters`
3. `How it's assessed`
4. `Meets`
5. `Does not meet`
6. `Scope note`
7. `Mappings`

The six domains are: `SPEC` (Specification Integrity), `VER` (Verification
Integrity), `AGENT` (Agent Boundaries), `HUMAN` (Human Accountability),
`EVOLVE` (Evolvability), `PROV` (Provenance).

## Validation rules

Each rule has an ID so that violations can be reported and cited. A violation
is reported as `<file>: <rule-id>: <message>`.

### Group A — Structural conformance

- **R-01.** Every criterion file has valid frontmatter with all required
  fields present and correctly typed. `status` must be one of the three
  allowed values. `core` must be a boolean.
- **R-02.** Every criterion file contains all seven body sections listed above,
  in the specified order, and each section is non-empty.
- **R-03.** Every `id` matches the pattern `<FAMILY>-<NN>`, where `<FAMILY>` is
  one of the six domains and `<NN>` is a number. Every `id` must be unique
  across the entire corpus. In addition, an `id` that belongs to a
  `deprecated` file must never be reused by any other file — deprecated IDs are
  retired permanently, not recycled.

### Group B — Example grounding

- **R-04.** Any criterion with `core: true` must have grounded, non-placeholder
  `Meets` and `Does not meet` sections. A section that is empty, or that
  consists only of a placeholder (such as "TBD", "to be added", "to be
  written", "coming soon", a lone punctuation mark, or an empty list item),
  fails this rule. The check is for whether the section is *actually
  grounded*, not merely whether it contains a particular word.
- **R-05.** The `Does not meet` section of every `active` criterion must
  contain at least one concrete, substantive failure pattern — not a
  placeholder and not a single trivial line.

### Group C — Dependency integrity

- **R-06.** Every cross-reference from one criterion to another (a markdown link
  pointing at `criteria/<FAMILY>/<ID>.md`) must resolve to a file that exists.
- **R-07.** No `active` criterion may declare a **binding dependency** on a
  `draft` or `deprecated` criterion.
  A *binding dependency* is a reference, in the `Criterion` or `Scope note`
  section, asserting that this criterion relies on another for its verdict
  (for example: "this criterion depends on X", "if X fails, this criterion
  fails on that ground first", "X is the substrate this builds on"). This is
  distinct from a non-binding **mention** — a "see also", a "compare X", or a
  hand-off of a neighbouring concern ("correctness is out of scope; see X") —
  which does not create a dependency. The rule fires only on binding
  dependencies, not on mentions.
- **R-08.** Every `core: true` criterion's binding dependencies must themselves
  be `core: true`. The core set must be closed under dependency: a criterion
  required for a badge cannot rest on a criterion that is outside the required
  set.

### Group D — Reference resolution

- **R-09.** Every markdown link into the glossary
  (`glossary.md#<anchor>`) must resolve to an anchor that actually exists in
  `glossary.md`.
- **R-10.** "Material" is a load-bearing defined term (it appears as *material
  contribution* and *material change*, each defined in the glossary). Every
  criterion that uses the term in this load-bearing sense — in its `Criterion`
  or `How it's assessed` section — must link it to its glossary definition at
  least once. The rule targets the defined-term uses; it must not fire on
  unrelated appearances of the string (such as "immaterial", "materials", or
  "the material was reviewed").

### Group E — Threshold consistency

- **R-11.** Every criterion listed in the core-set table of `thresholds.md`
  must exist as a file, and the `core` and `status` values in that file must
  match what the threshold table asserts about it. A mismatch (for example, the
  table calls a criterion `active` but its file says `draft`) is a violation.
- **R-12.** The set of files with `core: true` must be exactly equal to the
  core set declared in `thresholds.md` — in both directions. A `core: true`
  file that is missing from the table is a violation, and a table entry that
  has no corresponding `core: true` file is also a violation.

## Provenance requirements

These are process requirements for building this repository, and must hold of
the repository's own git history.

- **P-01.** Every commit to which an agent materially contributes must carry, at
  commit time, a durable machine-readable attestation of agent authorship — for
  example a commit trailer `Agent-Authored: true` together with the tool and
  model used. The attestation must survive in the git history and be
  retrievable without asking the person who made the commit.
- **P-02.** The attestation must be produced by the commit workflow itself, not
  by a default value that a committer can leave in place without noticing.

## Build cadence

Build the tool test-first, following a red / green / refactor cadence:

- Write a failing test that expresses the next small piece of required
  behaviour before writing the code that satisfies it.
- Write the minimum implementation that makes the test pass.
- Refactor with the tests green.

Keep the git history granular and honest about this sequence. Commit at the
natural TDD boundaries rather than squashing them: the failing test lands as
its own commit, and the implementation that makes it pass lands as a separate
commit. The history should read as a truthful record of how the behaviour was
built up, one step at a time — not a set of large commits that collapse many
steps into one.

Apply the provenance discipline described above (P-01, P-02) to every commit as
it is made, not retroactively. Each commit that an agent materially contributes
to carries its authorship attestation at the time it is committed.

## Output

- Plain-text report to stdout, one line per violation:
  `<file>: <rule-id>: <message>`.
- A summary line with the total count of violations.
- Exit code `0` if there are no violations, non-zero otherwise (so the tool can
  be used as a merge gate).

## Out of scope

To keep the tool focused and small:

- No web UI, no HTTP server, no database, no persistent state.
- No configuration system — the rules above are the rules.
- No support for input formats other than the markdown-with-frontmatter
  described here.
- One implementation language. Dependencies are limited to the language's
  standard library plus a YAML parser and a markdown parser. Do not introduce
  additional third-party dependencies beyond those two.

## Acceptance

The tool is complete when:

- It runs against the rubric repository and reports violations in the specified
  format with the specified exit-code behaviour.
- Each rule R-01 through R-12 is implemented and covered by tests that exercise
  both a passing case and a violating case.
- P-01 and P-02 hold of this repository's own commit history.
