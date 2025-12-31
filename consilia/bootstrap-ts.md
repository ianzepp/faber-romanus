# Bootstrap: Self-Hosted Faber Compiler (TypeScript Target)

Rewrite the Faber compiler in Faber, targeting TypeScript/Bun.

## Rationale

1. **Path of least resistance** — TS codegen is the most mature (632 test expectations)
2. **Same runtime** — Bun runs both current compiler and output
3. **No memory management** — GC handles allocation; no `cura`/`curata` complexity
4. **Faster iteration** — Fix issues in Faber, recompile, test immediately

## Current State

### Completed (Phase 5a-5b)

| Module | Location | Lines | Status |
|--------|----------|-------|--------|
| AST types | `fons-fab/ast/` | ~600 | Complete (20 files) |
| Lexer | `fons-fab/lexor/` | ~760 | Complete |
| Keywords | `fons-fab/lexicon/` | ~135 | Complete |

### Remaining

| Module | Source | Est. Lines | Notes |
|--------|--------|------------|-------|
| Parser | `fons/parser/index.ts` | ~5,000 | Largest module |
| Semantic | `fons/semantic/` | ~2,600 | Type checking, scopes |
| Codegen (TS) | `fons/codegen/ts/` | ~2,000 | TS target only |
| CLI | `fons/cli.ts` | ~600 | Entry point |

## Bootstrap Strategy

### Phase 1: Parser (`fons-fab/parser/`)

Port `fons/parser/index.ts` to Faber:

1. Create `genus Parser` with token stream state
2. Port parsing functions as methods
3. Refactor closures → struct methods (same pattern as Lexor)

The parser is the largest single module but mechanically similar to the lexer.

### Phase 2: Semantic Analyzer (`fons-fab/semantic/`)

Port `fons/semantic/`:

1. Symbol tables using `tabula<textus, Symbol>`
2. Scope stack management
3. Type inference and checking

### Phase 3: TypeScript Codegen (`fons-fab/codegen/ts/`)

Port only the TS target from `fons/codegen/ts/`:

1. Statement generators
2. Expression generators
3. Type emission

Skip other targets (py, rs, cpp, zig, fab) — they can be added later.

### Phase 4: CLI (`fons-fab/cli.fab`)

Minimal CLI:

```faber
functio main(lista<textus> args) -> numerus {
    fixum source = lege()  // stdin
    fixum result = compile(source)
    scribe result          // stdout
    redde 0
}
```

### Phase 5: Integration

1. Compile `fons-fab/*.fab` with TS compiler → `opus/*.ts`
2. Run with Bun, verify it compiles test files correctly
3. Self-compile: use Faber compiler to compile itself
4. Verify round-trip: both compilers produce identical output

## Key Patterns

### Closure → Genus Refactoring

TypeScript closures become `genus` with methods:

```typescript
// TypeScript
function parse(tokens: Token[]) {
    let current = 0;
    function advance() { return tokens[current++]; }
    // ...
}
```

```faber
// Faber
genus Parser {
    lista<Symbolum> tokens
    numerus current
    
    functio advance() -> Symbolum {
        fixum t = ego.tokens[ego.current]
        ego.current = ego.current + 1
        redde t
    }
}
```

### Latin Naming

All bootstrap code uses Latin identifiers:

| English | Latin | Usage |
|---------|-------|-------|
| `parse` | `resolvere` | Parse/resolve |
| `current` | `index` | Current position |
| `tokens` | `symbola` | Token list |
| `error` | `error` | Error (Latin origin) |
| `peek` | `specta` | Look without consuming |
| `advance` | `procede` | Move forward |

### Result Types

Functions return result types instead of throwing:

```faber
genus ParseResult {
    Programma? program
    lista<ParseError> errors
}

functio parse(lista<Symbolum> symbola) -> ParseResult {
    // ...
}
```

## Build Commands

```bash
# Compile bootstrap to TypeScript
bun run faber compile fons-fab/**/*.fab -t ts -o opus/

# Run compiled compiler
bun opus/cli.ts < input.fab > output.ts

# Self-compile (once working)
bun opus/cli.ts < fons-fab/**/*.fab > opus2/
diff -r opus/ opus2/  # Should be identical
```

## Success Criteria

1. `fons-fab/` compiles to valid TypeScript
2. Compiled compiler passes existing test suite
3. Self-compilation produces identical output
4. No runtime dependencies beyond Bun

## Timeline

| Phase | Scope | Est. Days |
|-------|-------|-----------|
| Parser | ~5,000 lines | 5-7 |
| Semantic | ~2,600 lines | 3-4 |
| Codegen | ~2,000 lines | 3-4 |
| CLI | ~600 lines | 1 |
| Integration | Debug, iterate | 2-3 |
| **Total** | | **14-19 days** |

Significantly faster than Zig bootstrap (~20-28 days) due to:
- No allocator threading
- Mature TS codegen
- Simpler error handling (exceptions work)
