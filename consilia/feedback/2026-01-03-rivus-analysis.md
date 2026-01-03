# Rivus Compiler Analysis

**Date:** 2026-01-03
**Reviewers:** faber-lang-designer agent, Claude Opus

---

## Agent Analysis (faber-lang-designer)

### Executive Summary

The Rivus codebase demonstrates **competent but not exemplary** use of Faber. It is mechanically sound—every construct compiles correctly—but it reads more like "TypeScript translated to Latin" than "compiler architecture expressed through Latin grammar." The code works; it lacks poetry.

**Strengths:**
- Consistent naming conventions grounded in Latin
- Heavy use of `discerne` pattern matching (93 occurrences)
- Comprehensive use of `scriptum()` for string formatting (193 occurrences)
- `finge` constructors used throughout (98 occurrences)
- Proper empty collection type annotations (`[] qua lista<T>`, 54 occurrences)

**Weaknesses:**
- No use of `cura...fit` resource management
- Minimal collection DSL usage despite extensive list manipulation
- Type system representation uses `discretio` well but loses Latin grammatical opportunities elsewhere
- Function signatures sometimes lack the type-first clarity that Faber demands

---

### 1. Faber Idiom Usage

#### Strong Points

**Pattern Matching with `discerne`**: The codebase uses `discerne` appropriately throughout semantic analysis and code generation.

**String Formatting**: Consistent use of `scriptum()` avoids template strings, making the code portable across targets.

**Explicit Type Annotations**: Empty collections always carry type information, preventing ambiguity.

#### Missed Idioms

**No `cura...fit` Resource Management**: Despite being a compiler that opens files and manages state, there is zero actual usage of `cura...fit`.

**Minimal Collection DSL**: The parser and semantic analyzer perform extensive list operations, yet the collection DSL (`ab`, `ubi`, `prima`, `ordina`) appears nowhere.

---

### 2. Structural Elegance

#### Architecture

The compiler follows classical phases with clean separation:

```
cli.fab → lexor/ → parser/ → semantic/ → codegen/ts/
```

Each phase has a clear contract. The Resolvitor pactum pattern avoids circular dependencies between parser/semantic modules.

#### Areas for Improvement

**Parser State Management**: The `Parser` genus mixes navigation primitives with error handling and comment collection. This is a 470-line "god object."

**Lexor Loop**: The main lexing loop is a 180-line `elige` statement dispatching on character. A table-driven approach would be clearer.

---

### 3. Self-Hosting Readiness

#### Circular Dependency Risk

The Resolvitor pattern avoids the classic parser-semantic mutual recursion. No circular imports. This is correct.

#### Bootstrap Concerns

**Preamble Generation**: `scriptum()` calls are hardcoded everywhere (193 occurrences). The codegen needs to emit a minimal preamble with `scriptum()` defined. Currently stubbed and noted as a known issue.

**Predeclaration Phase**: The semantic analyzer has a two-phase design allowing forward references. Good.

---

### 4. Latin Consistency

#### Naming Excellence

The vocabulary is consistently Latin throughout:

| Concept | Faber Term | Latin Root |
|---------|------------|------------|
| lexer | `lexor` | *lēctor* (reader) |
| token | `symbolum` | *symbolum* (symbol) |
| peek | `specta` | *spectō* (I watch) |
| advance | `procede` | *prōcēdō* (I go) |
| report | `renuncia` | *renūntiō* (I tell) |

#### Grammatical Lapses

**Gender Agreement Issues**: The parser accepts `privatus` for all contexts; should validate `privata` for `functio`, `privatum` for `genus`.

**Case Usage**: Faber's design mentions using cases (ablative for instrumentality, genitive for possession), but this is not reflected in the type system.

---

### 5. Missing Opportunities

#### Collection DSL Neglect

The parser performs extensive filtering and mapping with imperative `do...while` loops. The collection DSL would eliminate mutation and demonstrate Faber's expressiveness.

#### `discerne` Exhaustiveness

Pattern matching is used well, but without compiler-enforced exhaustiveness. The code could demonstrate best practices by always including `ceterum` arms.

---

### Concrete Recommendations

#### High-Priority (P0)

1. **Add preamble generation** to `codegen/ts/index.fab` for `scriptum()`. Without this, self-hosting fails.

2. **Implement `cura...fit` in CLI**. Demonstrates the pattern and validates the implementation.

3. **Fix visibility modifier gender agreement** in parser.

#### Medium-Priority (P1)

4. **Refactor `Parser` genus** to separate concerns (Navigatio, Collectio, Synchronizatio, Parser).

5. **Use collection DSL** in at least three places.

6. **Add exhaustiveness markers** to `discerne` blocks.

#### Low-Priority (P2)

7. **Table-driven lexer** for operator dispatch.

8. **Latin comment tags**: Replace `WHY:`, `EDGE:` with `CUR:`, `LIMES:`.

---

### Final Verdict

The Rivus compiler is **structurally sound but idiomatically cautious**. It demonstrates that Faber can express compiler architecture without awkwardness, but it doesn't yet sing in Latin.

*Opus solidum, sed non elegans.* — The work is solid, but not yet elegant.

---

## Counter-Analysis (Claude Opus)

The agent's analysis is thoughtful but misses context.

### Agree

- The preamble issue is real and will block self-hosting
- Collection DSL absence is notable - the bootstrap compiler should showcase the language
- Parser god-object critique is fair; separation would help testing

### Disagree or Nuanced

1. **"TypeScript wearing a toga"** is harsh. Rivus is a *working compiler* written in a language that barely exists yet. It's necessarily conservative—you can't use features you haven't implemented. The DSL isn't used because Rivus probably can't compile it yet.

2. **Gender agreement enforcement** is a language design question, not a bug. Latin has grammatical gender; programming doesn't need it. Requiring `privata functio` vs `privatus campus` adds cognitive load for no semantic benefit. The agent is projecting linguistic purism onto a practical tool.

3. **`cura...fit` for stdin** is ceremony for ceremony's sake. Stdin doesn't need cleanup. Using it "to demonstrate the pattern" is exactly the kind of ornamental complexity the design philosophy rejects.

4. **Latin comment tags** (`CUR:` instead of `WHY:`) would make the code less readable to the humans maintaining it. Latin keywords serve parsing; Latin comments serve no one.

### The Real Insight

The agent correctly identifies that Rivus is pragmatic, not poetic. But that's appropriate for a bootstrap compiler whose job is to *work*, not to inspire. Poetry comes after the foundation is laid.

**The P0 preamble issue is the only actionable blocker. The rest is polish for later.**

---

## Summary of Actionable Items

| Priority | Item | Status |
|----------|------|--------|
| P1 | Parser refactoring | Improves testability |
| P1 | Collection DSL adoption | Showcases language |
| P2 | Everything else | Polish for later |

---

## Correction (2026-01-03)

**The agent's P0 "preamble for scriptum()" is not a real blocker.**

The TS codegen transforms `scriptum("Hello, {}!", name)` directly into `` `Hello, ${name}!` `` at compile time. This is a pure syntax transformation - no runtime function is needed, no preamble required.

See: `fons/faber/codegen/ts/expressions/scriptum.ts`

This removes the only claimed P0 blocker. Rivus has no critical self-hosting blockers identified.
