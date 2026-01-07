# proprietas - Property-Style Access for Zero-Arg Methods

**Status:** Future consideration (specialized use case)

**Concern:** Risk of making Faber feel like "TypeScript-with-a-toga." Use sparingly if at all.

---

## Problem

LLMs consistently write `items.longitudo` instead of `items.longitudo()` because they're trained on `arr.length` (JavaScript/TypeScript). For an LLM-first language, this creates first-attempt failures.

However, bending the language to match LLM expectations risks losing Faber's distinctive character. The preferred approach is helpful error messages that teach the correct pattern.

---

## Proposed Feature (If Needed)

`@ proprietas` annotation marks zero-arg methods as property-style access (no parentheses).

```faber
@ proprietas
@ verte ts (ego) -> "§.length"
@ verte py (ego) -> "len(§)"
@ verte rs (ego) -> "§.len()"
@ externa
functio longitudo() fit numerus
```

Usage:
```faber
scribe items.longitudo    # Works (no parens)
scribe items.longitudo()  # Error: property, not method
```

---

## Design Decisions

### 1. Zero-arg only

Properties by definition have no arguments. Methods with optional args stay as methods.

### 2. Mutually exclusive

A method is EITHER callable with parens OR accessible without. Not both.

- `@ proprietas` method: `items.longitudo` valid, `items.longitudo()` error
- Regular method: `items.adde(x)` valid, `items.adde` is function reference

### 3. No parser changes

`items.longitudo` already parses as MemberExpression. Only semantic analysis and codegen need updates.

### 4. Linguistic alignment

| Type | Examples | Access |
|------|----------|--------|
| Nouns/Adjectives | `longitudo`, `vacua`, `primus` | Property |
| Verbs | `adde`, `filtra`, `ordina` | Method |

Latin nouns/adjectives describe static qualities. Verbs describe actions. This maps to property vs method.

---

## Target Language Handling

The `@ verte` template handles variance:

| Target | `longitudo` Translation |
|--------|------------------------|
| TypeScript | `§.length` (property) |
| Python | `len(§)` (function) |
| Rust | `§.len()` (method call) |
| C++ | `§.size()` (method call) |
| Zig | `§.longitudo()` (wrapper) |

---

## Implementation Outline

### Phase 1: Annotation Parsing
- Add `@ proprietas` to annotation grammar (trivial - generic annotations exist)
- Store `proprietas: boolean` flag on NormaMethod

### Phase 2: Semantic Analysis
- When MemberExpression references a `@ proprietas` method, mark as valid
- When CallExpression calls a `@ proprietas` method, emit error

### Phase 3: Codegen
- In `genMemberExpression`, check norma registry for `@ proprietas` methods
- Apply template translation (same pattern as CallExpression)

### Phase 4: Stdlib Migration (if adopted)
Candidates: `longitudo`, `vacua`, `primus`, `ultimus`, `minimus`, `maximus`

---

## Alternative: Better Error Messages

Instead of implementing `@ proprietas`, provide helpful errors:

```
Error: 'longitudo' is a method, not a property. Use 'items.longitudo()'.
```

This maintains language consistency while teaching the correct pattern. LLMs adapt quickly to consistent error feedback.

---

## Recommendation

**Default:** Use helpful error messages. Keep parens-for-everything.

**Exception:** If a specific stdlib method has overwhelming LLM failure rates AND maps cleanly to properties in all target languages, consider `@ proprietas` for that method only.

The feature exists as an escape hatch, not a default pattern.

---

## Naming

`@ proprietas` (Latin: "property, characteristic quality") is the correct term. Alternatives considered:
- `@ attributum` - "attribute" (too generic)
- `@ nomen` - "noun" (doesn't cover adjectives)
- `@ qualitas` - "quality" (philosophical, awkward)
