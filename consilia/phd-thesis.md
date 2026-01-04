# Faber Romanus: Research-Grade Rigor Without a PhD

**Date**: 2026-01-03
**Status**: Engineering strategy document (not pursuing PhD)

## Purpose

This document is not a PhD proposal.

It is a blueprint for applying **PhD-grade rigor** (clear claims, controlled comparisons, reproducible evaluation) to:

- Improve the language and compiler via measurable feedback loops
- Strengthen the project’s positioning beyond novelty
- Produce artifacts that read like serious research engineering, even outside academia

The goal is to move the narrative from:

> “TypeScript in a toga”

to:

> “A human-legible, machine-checkable intermediate language optimized for LLM→human→compiler workflows, backed by reproducible evaluation and multi-target compilation.”

## Core Reframing

### What This Project Is Not

- Not “a Latin programming language” as the core contribution
- Not a purely aesthetic or meme-driven syntax experiment
- Not a claim about AI intelligence

### What This Project Is

**Faber Romanus is an intermediate representation (IR) that is:**

- **LLM-friendly to write** (regular, low-entropy structure)
- **Human-friendly to skim** (word-based, explicit intent)
- **Compiler-friendly to validate** (deterministic grammar + strong diagnostics)
- **Multi-target by construction** (single AST, multiple backends)

The central workflow claim is:

> LLM drafts in Faber → human approves/skims → compiler emits production targets.

Even if the keyword vocabulary were changed tomorrow, the project remains valuable if the IR/harness/compiler methodology produces measurable improvements.

## Why Latin (Positioning, Not Mysticism)

Latin is not chosen for aesthetics. It is chosen as a plausible **high-frequency linguistic substrate** for Western web-trained models:

- Latin roots permeate English technical vocabulary
- Romance languages share morphology and word roots with Latin
- Legal, medical, scientific writing contains Latin fragments

This is a _hypothesis about priors_, not a belief.

If Latin provides a measurable advantage, it should be demonstrable with ablations and baselines. If it doesn’t, the project can still succeed on the “low-entropy IR” thesis.

## The “Rigor Loop” (How This Improves the Language)

PhD-grade rigor is a development method:

1. **State a claim** precisely (what improves, relative to what).
2. **Define metrics** that are externally checkable.
3. **Build a reproducible harness** to measure those metrics.
4. **Run baselines and ablations** to isolate causes.
5. **Use the results to drive implementation** (compiler features, diagnostics, grammar constraints).
6. **Repeat**, keeping historical results to detect regressions.

This makes language evolution measurable rather than aesthetic.

## Claims (Keep It Small and Falsifiable)

A strong strategy is to pick **2–3 primary claims** and treat everything else as supportive evidence.

### Claim A: LLM generation reliability improves

**Claim**: For a fixed task suite and prompting protocol, generating Faber yields lower failure rates than generating target languages directly.

**Primary metrics** (externally scored):

- Parse success rate
- Typecheck success rate
- End-to-end success rate (tests pass)
- Repair cost (number of edit iterations to pass)
- Token cost per passing solution

**Baselines** (minimum):

- Direct TypeScript (or Rust) generation
- Faber → TypeScript (or Rust) compilation

**Ablations** (to isolate mechanism):

- Faber-English (same grammar, English keywords)
- Faber-Symbols (same structure, symbolic keywords)

If Faber-English ≈ Faber-Latin, then the mechanism is primarily structure/regularity. That is still valuable; the narrative shifts accordingly.

### Claim B: Reviewability improves (human or AI)

**Claim**: Under fixed budget constraints (time for humans, token budget for AI), reviewing Faber yields higher bug recall / lower false positives than reviewing target language equivalents.

**Primary metrics**:

- Bug recall on seeded defects
- False positive rate
- Time-to-decision (humans)
- Token-to-decision (AI)

**Important constraint**: review must be graded against a labeled bug corpus. No self-judged “looks correct” scoring.

### Claim C: Multi-target compilation preserves semantics for a defined subset

**Claim**: For an explicitly defined subset of the language, code generated for N targets preserves semantics as validated by a shared test suite.

**Primary metrics**:

- Cross-target test pass rate
- Feature coverage (what subset is included)
- Determinism (same input → same output)

This claim builds compiler credibility, which is a major part of reputation.

## What Makes This “Research-Grade”

### 1) Reproducibility First

The project becomes reputable when third parties can rerun the same evaluation and see similar outcomes.

- Fixed harness
- Logged prompts
- Versioned task suite
- Deterministic formatting
- Stable diagnostics
- Clear failure taxonomy

### 2) External Scoring (Not Vibes)

Where possible, evaluate via:

- Compiler success/failure
- Typechecking
- Tests
- Runtime behavior

Prefer “the program passed” over “the model said it passed.”

### 3) Baselines You Control

To avoid the “TypeScript in a toga” critique, comparisons must separate:

- surface vocabulary vs structure
- structure vs toolchain feedback
- IR merits vs backend quality

Faber-English is strategically important because it removes Latin as a confound while keeping the grammar identical.

### 4) Confounds to Track Explicitly

If you want the results to survive skeptical readers, track these as covariates:

- Tokenization (tokens per program)
- Prompt length and format
- Allowed tools/feedback loops (compilers, error messages)
- Model versions (silent updates happen)

Treat “temperature=0” as “reduced randomness,” not absolute determinism.

## The Evaluation Harness (Practical Design)

The most valuable artifact (for both engineering and reputation) is a harness that can:

- Generate or accept Faber source
- Compile with `bun run faber compile`
- Compile to multiple targets
- Execute target test suites
- Score outcomes with a consistent rubric

### Suggested outcome taxonomy

Every run should end in exactly one bucket:

- `tokenize_error`
- `parse_error`
- `semantic_error` (type errors, name resolution, etc.)
- `codegen_error` (backend failure)
- `runtime_error`
- `test_failure`
- `success`

This taxonomy directly drives compiler work: improvements are measured by moving failures “left” (runtime → compile-time) and decreasing total failures.

## Evidence That Improves Implementation

Rigor is not just for positioning; it directly improves the language:

- If parse errors dominate, improve grammar constraints and diagnostics.
- If semantic errors dominate, improve type system, name resolution, error messages.
- If codegen errors dominate, tighten AST invariants and backend conformance.
- If runtime/test failures dominate, improve standard library + semantic checks.

This also produces a clean roadmap driven by data rather than taste.

## Positioning (How to Talk About It)

### Don’t lead with

- “Latin programming language”
- “over-represented substrate” (as a claim without measurements)
- “unfair advantage” (fun, but reads like marketing)

### Lead with

- “LLM-oriented intermediate representation with deterministic compilation”
- “multi-target compiler”
- “measured improvements in compilation success / test pass rate”
- “reproducible benchmark harness”

### Optional secondary story

Once measured:

- “Vocabulary alignment with high-frequency linguistic priors may help reliability”

Only elevate this if the ablations support it.

## Deliverables (Reputation Comes From Artifacts)

If you want non-academic credibility, produce things that look like serious engineering research:

- A “claims + metrics” one-pager
- A benchmark suite (small, curated at first)
- A harness to run it reproducibly
- A short technical report (8–20 pages) with results and limitations
- A public dashboard-like summary (even a markdown table) tracking regressions

## A Practical Roadmap

### Phase 1: Define the claims (days)

- Choose 2–3 claims.
- Write the scoring rubric.
- Decide baselines and ablations.

### Phase 2: Build the harness (1–3 weeks)

- Automate compilation + testing for at least one target.
- Log every input/output.
- Implement the failure taxonomy.

### Phase 3: Run small pilots (days)

- 10–30 tasks.
- 2–3 model families if possible.
- Identify dominant failure modes.

### Phase 4: Improve implementation using data (ongoing)

- Fix the most common failure class.
- Re-run.
- Track regressions.

### Phase 5: Scale tasks + publish results (ongoing)

- Grow to 100+ tasks.
- Add more targets.
- Publish the technical report.

## Notes on “AI Participants”

Using AI participants is aligned with the actual workflow being optimized: LLMs produce the drafts.

However:

- AI-based evaluation must be externally scored (compiler/tests).
- Human studies can be minimal and still useful: validate that the IR is skimmable enough for approval gates.

The hybrid approach is pragmatic:

- AI runs provide scale and reproducibility.
- Small human validation ensures the “approval gate” assumption is real.

## Bottom Line

This is a path to build a reputable language project without academia:

- Make a small number of falsifiable claims.
- Build a reproducible harness.
- Measure baselines and ablations.
- Use the data to drive language/compiler changes.

If you do this, the project stops being “a cute syntax” and becomes a serious, repeatable system: an LLM-oriented IR + compiler with evidence.
