# Pipeline Research: Drafter → Verifier Architecture

**Date**: 2026-01-06
**Framework Version**: 1.2

## Overview

This document summarizes research into two-stage LLM pipelines for Faber code generation, where a "drafter" model produces initial code and a "verifier" model reviews and potentially corrects it.

## Key Findings

### 1. Pipeline Works for Simple Tasks

On simple `ts_to_faber` tasks with grammar-only context:

| Configuration | Accuracy | Recovery Rate | Damage Rate |
|--------------|----------|---------------|-------------|
| Single model (various) | 86-100% | N/A | N/A |
| Any drafter → llama-3.1-70b | **100%** | 100% | 0% |
| Any drafter → gpt-4o | 100% | 100% | 0% |

**All tested pairings achieved 100% on simple tasks with zero damage.**

### 2. Self-Improvement Works (Simple Tasks)

When a model reviews its own output:

| Model | Single | Self-Pipeline | Improvement |
|-------|--------|---------------|-------------|
| codestral → codestral | 90.9% | **100%** | +9.1% |
| gpt-4o → gpt-4o | 100% | 100% | 0% (already perfect) |

Self-review catches mistakes that single-pass misses.

### 3. Recovery from Total Failure

Even a 0% drafter can be recovered:

| Pipeline | Drafter Alone | Pipeline Final |
|----------|---------------|----------------|
| llama-3.2-1b → gpt-4o | **0%** | **100%** |

The drafter output serves as a scaffold—even wrong output helps the verifier.

### 4. Cost Efficiency

Budget pairings match expensive single models:

| Configuration | Accuracy | Cost (11 tasks) |
|--------------|----------|-----------------|
| gpt-4o alone | 100% | $0.020 |
| gpt-4o → gpt-4o | 100% | $0.049 |
| llama-3.1-8b → llama-3.1-70b | **100%** | **$0.004** |
| codestral → llama-3.1-70b | 100% | $0.006 |

**Budget pipeline is 5-12x cheaper than frontier models.**

### 5. Complex Tasks Tell a Different Story

On complex tasks (recursion, nested loops, multiple functions):

| Configuration | Accuracy | Notes |
|--------------|----------|-------|
| gpt-4o alone | 68% | Baseline |
| gpt-4o → gpt-4o | 68% | **No improvement** |
| codestral alone | 79% | Better than gpt-4o! |
| codestral → gpt-4o | 74% | **Damage (-5%)** |

**Self-improvement fails on hard tasks. Strong verifiers can cause damage.**

### 6. Heterogeneous Pairings Enable Recovery

Different model families have different failure modes:

| Pipeline | Preserved | Damaged | Recovered | Final |
|----------|-----------|---------|-----------|-------|
| gpt-4o → gpt-4o | 13 | 0 | **0** | 68% |
| codestral → gpt-4o | 14 | **1** | 0 | 74% |
| gpt-4o → codestral | 13 | 0 | **2** | 79% |
| qwen3-coder → gpt-4o | 13 | 0 | **2** | 79% |

**Recovery only happens with heterogeneous pairings** (different model families).

### 7. Context Limits Pipeline Effectiveness

With examples-only context (no vocabulary):

| Configuration | Accuracy |
|--------------|----------|
| codestral alone | 91% |
| codestral → llama-3.1-70b | 91% |
| llama-3.1-8b alone | 73% |
| llama-3.1-8b → llama-3.1-70b | 73% |

**Pipeline provides zero lift when both models lack necessary knowledge.** Verification amplifies capability, it doesn't create it.

---

## Transition Types

Pipeline results are categorized by transition:

| Transition | Meaning | Desirable? |
|------------|---------|------------|
| **preserved** | Drafter correct → Verifier correct | ✓ Yes |
| **recovered** | Drafter wrong → Verifier fixed | ✓ Yes |
| **damaged** | Drafter correct → Verifier broke | ✗ No |
| **failed** | Drafter wrong → Verifier still wrong | Neutral |

---

## Design Principles

### When Pipeline Helps

1. **Simple tasks with capable models** — Pushes 90% → 100%
2. **Heterogeneous model pairs** — Different failure modes cancel out
3. **Self-review on moderate tasks** — Model catches own mistakes
4. **Budget optimization** — Cheap drafter + mid-tier verifier = frontier accuracy

### When Pipeline Hurts

1. **Same model on hard tasks** — No new information, no recovery
2. **"Smarter" verifier on edge cases** — May break correct but unusual solutions
3. **Insufficient context** — Both models fail the same way
4. **Homogeneous failure modes** — Same training data = correlated errors

### Recommendations

1. **Use heterogeneous pairings** — Mix model families (OpenAI + Meta, Mistral + Anthropic)
2. **Consider verifier strength carefully** — Stronger isn't always better
3. **Ensure adequate context** — Pipeline can't compensate for missing vocabulary
4. **Self-improvement for moderate tasks** — Effective when model "almost" knows the answer
5. **Budget path**: llama-3.1-8b → llama-3.1-70b for production at low cost

---

## Implementation

Pipeline mode added to `harness/runner.ts`:

```bash
# Single-stage (baseline)
bun run harness/runner.ts --model codestral --context grammar-only

# Pipeline mode
bun run harness/runner.ts --model codestral --verifier gpt-4o --context grammar-only
```

Output symbols:
- `.` = preserved
- `+` = recovered
- `-` = damaged
- `x` = failed

Results include pipeline-specific fields:
- `verifier_model`, `drafter_correct`, `verifier_correct`
- `transition` (preserved/damaged/recovered/failed)
- `drafter_cost`, `verifier_cost`, `total_cost`

---

## Grammar Improvements

During testing, we identified grammar clarifications that improved accuracy:

| Issue | Fix | Impact |
|-------|-----|--------|
| `sin si` for else-if | Clarified `sin` = else-if (not else) | +5% |
| Missing array syntax | Added `numerus[]` and `lista<numerus>` | +2% |
| Missing `===` guidance | Noted Faber uses `==` only | +1% |
| Missing collection methods | Added `.longitudo()`, `pavimentum()` | Partial |

**Grammar-only context went from 68% → 79% on complex tasks** with these fixes.

---

## Future Work

1. **Ensemble voting** — Multiple drafters, majority vote on verifier input
2. **Conditional verification** — Skip verifier when drafter confidence is high
3. **Failure-aware routing** — Route hard tasks to specific model pairs
4. **Cross-family pipelines** — Systematic testing of all family combinations
5. **Multi-pass refinement** — Drafter → Verifier → Verifier (diminishing returns?)

---

## Appendix: Tested Model Pairings

### Simple Tasks (ts_to_faber, grammar-only, n-shot=3)

All achieved 100% with llama-3.1-70b or gpt-4o as verifier:
- codestral, gpt-4o-mini, gpt-3.5-turbo, deepseek-v3.1, qwen3-coder, claude-3-haiku, llama-3.1-8b

### Complex Tasks (complex_ts_to_faber, grammar-only, n-shot=3)

| Drafter | Verifier | Final | Transition Summary |
|---------|----------|-------|-------------------|
| gpt-4o | gpt-4o | 68% | 0 recovered, 0 damaged |
| codestral | gpt-4o | 74% | 0 recovered, 1 damaged |
| codestral | llama-3.1-70b | 68% | 0 recovered, 2 damaged |
| gpt-4o | codestral | 79% | 2 recovered, 0 damaged |
| qwen3-coder | gpt-4o | 79% | 2 recovered, 0 damaged |
