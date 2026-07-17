# rubric-validator

A command-line tool that checks a set of [ACG Rubric](https://github.com/alexbunardzic/ACG-Rubric)
criterion files against the rubric's own structural rules — that every
criterion has the required shape, that dependencies resolve, that the core set
is internally consistent, and so on.

It is also something less usual: **the first codebase the AI Craftspeople Guild
built with an agent and then assessed, in public, against the very standard it
enforces.** It did not pass its own assessment cleanly. That is the point, and
the findings are below.

---

## Why this repo exists

The Guild's thesis is that as AI makes code cheap to generate, independent
judgment about whether that code is trustworthy becomes the scarce thing. A
standard is only worth something if its authors are willing to be measured by
it — including when the result is unflattering.

So we built a real, useful tool the way a real team would: we wrote a
specification, handed it to a coding agent, and asked for a test-first
implementation. Then we assessed the result against the ACG Rubric — reading
the tests against the specification rather than trusting the passing count —
exactly as we would assess a client's codebase.

The specification the agent was given is committed here as
[`rubric-validator-SPEC.md`](./rubric-validator-SPEC.md). The assessment
findings are below. Nothing has been quietly fixed to make this README look
better; where the tool is weak, it says so, and the weaknesses are being
tracked as issues.

---

## What the tool does

Pointed at a rubric repository, it reads the criterion files, the glossary, and
the thresholds document, and reports every structural violation it finds, with
a non-zero exit code if there are any — so it can be used as a merge gate.

The rules it checks (R-01 through R-12) cover four concerns: structural
conformance (every criterion has the required frontmatter and the seven body
sections, in order), example grounding (core criteria must have real Meets and
Does-not-meet examples), dependency and reference integrity (cross-references
and glossary links resolve; active criteria don't depend on unfinished ones;
the core set is closed under dependency), and threshold consistency (the
declared core set and the criterion files agree).

## Usage

```
npm install
npm run build
node dist/index.js <path-to-rubric-repo>
```

Exit code `0` means no violations; non-zero means violations were found and
printed as `<file>: <rule-id>: <message>`.

Requires Node.js. Written in TypeScript, tested with Jest.

---

## Self-assessment findings

The tool was assessed against the ACG Rubric. Twelve rules exist; six were
examined in depth, chosen to test the rules most likely to diverge between
"the tests pass" and "the check is correct." The remaining rules were
characterised by inference from the same pattern and are a follow-up, not a
completed audit. **This scope is stated deliberately: the assessment goes as
far as the evidence needed to reach a defensible verdict, and discloses where
it stops.**

> **These are pre-session findings.** They come from an initial review, not
> from the Guild's core-team assessment. The mob session — where the core team
> assesses this repository against the rubric together, in the open — is the
> event that confirms, revises, or extends what is below. Treat this table as
> the starting point the session works from, not the Guild's final verdict.

The headline result: **the tool implements decidable rules correctly and
narrows judgment-requiring rules to weaker proxies** — and in every narrowed
case, the accompanying tests assert the proxy rather than the rule the
specification describes. A green test suite therefore confirms the code agrees
with its own tests; it does not, on its own, confirm the code meets the spec.

| Rule | Verdict | Notes |
|------|---------|-------|
| R-03 (ID format, uniqueness, no deprecated-ID reuse) | **Pass** | Decidable rule, fully implemented, including the compound "no reuse" clause, with a test that genuinely exercises it. |
| R-12 (core set equality, both directions) | **Pass** | Bidirectional set-equality implemented and honestly tested. Its end-to-end behaviour depends on the thresholds parser (see open questions). |
| R-04 (grounded examples) | **Weak** | "Grounded" is checked against a fixed blocklist of placeholder strings, not for actual groundedness. Content that is empty-of-substance but absent from the blocklist (e.g. "example forthcoming") passes. |
| R-05 (substantive failure patterns) | **Weak** | "Substantive" is approximated by formatting (length or list markers). A meaningless `"- asdf"` passes; a genuine short failure description can fail. Inherits R-04's blocklist. |
| R-07 (binding dependency vs. mention) | **Weak** | A genuinely semantic distinction is approximated by keyword lists. Binding dependencies phrased outside the keyword set are missed; a non-binding keyword anywhere nearby can suppress a real one. |
| R-10 (material-term linking) | **Weak** | Scoped to the exact phrases "material contribution" / "material change"; misses the glossary's own "materially contributed." A false-positive guard has document-wide reach and can suppress real violations. |
| Build cadence (TDD) | **Not followed** | The specification asked for red-then-green with the failing test committed separately. Test and implementation were committed together per rule, so no test ever stood alone against the spec before code existed — the mechanism behind the narrowed checks above. |
| Provenance | **Partial** | Agent-authored commits carry a co-authorship trailer naming the model, but not the `Agent-Authored` attestation with tool the spec asked for. Human-authored commits are correctly left untrailed. |

The pattern worth naming: the two rules that **pass** (R-03, R-12) are the two
that are fully *decidable* — set membership, set equality, no judgment
required. The rules that came out **weak** are the four that require judging a
property — is this grounded, is this substantive, is this dependency binding,
is this use load-bearing — and in each case the implementation substitutes a
syntactic proxy and the tests verify the proxy. This is precisely the failure
mode the ACG Rubric exists to catch, reproduced by an agent, in the tool built
to enforce the rubric.

## Open questions (not yet assessed)

- **The parser layer.** The frontmatter and section parsers were not assessed.
  A lenient parser that coerces malformed input rather than rejecting it would
  silently weaken every rule built on top of it, including the two that
  currently pass. Audit this before relying on the tool in anger.
- **The remaining rules** (R-06, R-08, R-09, R-11) were not examined in depth.
  R-08 reuses R-07's binding-dependency detection and therefore inherits its
  weakness; the others are expected to resemble the decidable passes but this
  is inference, not verification.

## Status

This is a working tool and an honest specimen, not a finished product. The
weak rules above are real and are being tracked. The intended path is to
strengthen each narrowed check to test the property the specification names
rather than a proxy for it, and to re-assess — in public — as that work lands.

---

## License

See [LICENSE](./LICENSE).

*Built with an agent. Assessed against the ACG Rubric. Findings published
whether or not they flatter.*
