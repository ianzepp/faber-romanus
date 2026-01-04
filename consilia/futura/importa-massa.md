# Importa Massa (Import Block)

Introduce a top-level `importa ... { ... }` block that contains _all_ module imports.

## Motivation

Today, imports use the same surface form as other statements:

```fab
ex "../resolvitor" importa Resolvitor
```

This blends into normal code and keeps `ex` heavily overloaded:

- `ex "..." importa ...` (import)
- `ex items pro item { ... }` (iteration)
- `ex obj fixum a, b` (destructure)

A dedicated import block makes the file preamble visually explicit and de-overloads `ex`:

- **Inside** `importa {}`: `ex` always means import.
- **Outside** `importa {}`: `ex` never means import.

This is both human-friendly and LLM-friendly: one canonical preamble region, low ambiguity.

## Goals

- A single, visually obvious import preamble.
- Remove import/distructure/loop ambiguity around `ex`.
- Allow a block-level base path (`radix`) to reduce repeated relative prefixes.
- Provide crisp compiler errors for misplaced imports.

## Non-Goals

- No new inner DSL: import lines remain `ex "..." importa ...`.
- No nesting (this is not a general scoping construct).
- No attempt to merge imports or change codegen semantics.

## Proposed Syntax

### Import Block

```fab
importa radix "../" {
    ex "resolvitor" importa Resolvitor
    ex "ast/positio" importa Locus
    ex "ast/expressia" importa Expressia
}
```

- `importa` must start at column 0.
- `radix "..."` is optional.
- Block body is a list of normal import statements (same syntax as today).

### Import Lines (unchanged)

Inside the block, keep the existing import grammar:

```fab
ex "../../ast/lexema" importa SymbolumGenus
ex "./foo" importa Bar ut Baz
ex "./foo" importa ceteri
```

(The exact supported forms remain whatever `ImportaSententia` supports.)

## Semantic Rules (Strict Mode)

### 1) Exactly one block

- A module may contain **at most one** `importa { ... }` block.

### 2) No nesting

- `importa { ... }` is only permitted at the module (top) level.

### 3) Must come before any code

- The import block must be the first non-trivia construct in the file.
- Allowed before the block:
    - blank lines
    - comments
- Disallowed before the block:
    - any executable statement
    - any declaration

### 4) No imports outside the block

- Any `ex "..." importa ...` outside the import block is a compile error.

This is the key rule that de-overloads `ex` elsewhere.

## `radix` Resolution

If the block specifies `radix`, it is applied to each import line in that block.

Example:

```fab
importa radix "../" {
    ex "ast/positio" importa Locus
}
```

Is equivalent to:

```fab
ex "../ast/positio" importa Locus
```

Path-join rule:

- Join as text with exactly one `/` boundary.
- `radix` is a text literal (not an expression).

## Lowering Strategy

Treat `importa { ... }` as a pre-parse/module-preamble construct that lowers to a list of normal `ImportaSententia` nodes.

- Parse `ImportaMassaSententia` (new AST node)
- Validate placement rules
- Lower by:
    - rewriting each import path using `radix` (if provided)
    - emitting a flat list of existing import statements

Keeping the existing import node as the post-lowering representation avoids touching target codegen.

## Diagnostics

Suggested error messages (exact text TBD):

- Import outside block:
    - "Imports must appear inside a top-level `importa { ... }` block."

- Block not first:
    - "`importa { ... }` must appear before any non-comment code."

- Multiple blocks:
    - "Only one `importa { ... }` block is allowed per module."

- Nesting:
    - "`importa { ... }` is only allowed at module scope."

## Future Extensions

- Allow additional header keys (still simple key + text literal), e.g.:
    - `dialectus "ts"` for filtering
    - `modus "strict"` for per-file policy

These should remain non-expression, declarative options to keep the preamble deterministic and easy to parse.

## Migration Notes

This is a breaking change if enforced by default.

A practical migration path:

- Phase 1: accept both styles, but add a lint/formatter warning for imports outside the block.
- Phase 2: add a compiler flag to enforce strict mode.
- Phase 3: flip the default once the ecosystem migrates.
