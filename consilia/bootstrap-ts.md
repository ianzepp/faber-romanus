# Bootstrap: Self-Hosted Faber Compiler (TypeScript Target)

Rewrite the Faber compiler in Faber, targeting TypeScript/Bun.

## Current State

**Phase 5 (Integration) in progress.** All 51 files compile to TypeScript (~11,090 lines). TypeScript type-checking has 299 errors remaining.

| Module    | Location             |  Files |      Lines |
| --------- | -------------------- | -----: | ---------: |
| AST       | `fons-fab/ast/`      |      6 |      1,112 |
| Lexicon   | `fons-fab/lexicon/`  |      1 |        221 |
| Lexor     | `fons-fab/lexor/`    |      2 |        853 |
| Parser    | `fons-fab/parser/`   |     18 |      4,134 |
| Semantic  | `fons-fab/semantic/` |     17 |      2,844 |
| Codegen   | `fons-fab/codegen/`  |      6 |      1,859 |
| CLI       | `fons-fab/cli.fab`   |      1 |         67 |
| **Total** |                      | **51** | **11,090** |

### TypeScript Type-Check Errors (299 remaining)

```bash
cd opus/bootstrap && npx tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler cli.ts
```

| Category                        | Count | Fix                                                       |
| ------------------------------- | ----: | --------------------------------------------------------- |
| Missing exports                 |   ~24 | Add `@ publicum` to `genus`/`ordo` declarations           |
| Private method accessibility    |   ~22 | Add `@ publicum` to methods or refactor architecture      |
| Discriminated union narrowing   |   ~70 | Review `discerne` codegen — types not narrowing correctly |
| Missing `tabula.habet()` method |    ~4 | Add `habet` → `.has()` to `fons/codegen/tabula.ts`        |
| Import placement                |    ~5 | Fix codegen placing imports inside functions              |

### Active Workarounds

- **Method call return types** — Use `scriptum()` instead of string concatenation with method calls
- **Nullable parameters** — Use `ignotum` type instead of `Type?` in parameter position

## Build Commands

```bash
# Compile all fons-fab files to opus/bootstrap/
for f in fons-fab/**/*.fab; do
  outfile="opus/bootstrap/${f#fons-fab/}"; outfile="${outfile%.fab}.ts"
  mkdir -p "$(dirname "$outfile")"
  bun run faber compile "$f" -o "$outfile"
done

# TypeScript type-check
cd opus/bootstrap && npx tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler cli.ts

# Run compiled compiler (once type-checking passes)
bun opus/bootstrap/cli.ts < input.fab > output.ts

# Self-compile
bun opus/bootstrap/cli.ts < fons-fab/**/*.fab > opus2/
diff -r opus/bootstrap/ opus2/  # Should be identical
```

## Key Patterns

### Resolvitor (Mutual Recursion)

The `pactum Resolvitor` interface breaks circular dependencies between expression and statement parsers:

```fab
pactum Resolvitor {
    functio parser() -> Parser
    functio expressia() -> Expressia
    functio sententia() -> Sententia
}

functio parseCondicio(Resolvitor r) -> Expressia {
    fixum p = r.parser()
    si p.congruetVerbum("sic") {
        fixum consequens = r.expressia()  # Cross-module call
    }
}
```

### Discretio Construction

Use `finge` to construct tagged union variants:

```fab
functio parseBinaria(Resolvitor r) -> Expressia {
    redde finge Binaria { locus: l, signum: s, sinister: a, dexter: b } qua Expressia
}
```

### Discerne Binding: `ut` vs `pro`

- `si Variant ut v { v.field }` — binds whole variant, access fields via `v.`
- `si Variant pro a, b { }` — extracts fields positionally (fragile, avoid)

### Scriptum for String Formatting

Avoid method call return type bugs by using `scriptum()`:

```fab
# Good
fixum line = scriptum("{}if ({}) {{", g.ind(), cond)

# Bad (method return type may be wrong)
fixum line = g.ind() + "if (" + cond + ") {"
```

Use `{{` and `}}` for literal braces.

## Latin Naming Reference

| English | Latin     | English    | Latin     |
| ------- | --------- | ---------- | --------- |
| parse   | resolvere | left       | sinister  |
| current | index     | right      | dexter    |
| tokens  | symbola   | operator   | signum    |
| peek    | specta    | body       | corpus    |
| advance | procede   | expression | expressia |
| match   | congruet  | statement  | sententia |
| expect  | expecta   | report     | renuncia  |

## Success Criteria

1. `fons-fab/` compiles to valid TypeScript (type-checks pass)
2. Compiled compiler produces correct output for test files
3. Self-compilation produces identical output
4. No runtime dependencies beyond Bun

## Design Decisions

### Target Languages (Post-Bootstrap)

| Target | Keep | Rationale                                               |
| ------ | ---- | ------------------------------------------------------- |
| TS     | ✅   | Bootstrap, web, primary target                          |
| Zig    | ✅   | Native, systems, explicit memory                        |
| Rust   | ✅   | Native alternative, WASM, `de`/`in` aligns with borrows |
| Fab    | ✅   | Self-hosting, canonical formatting                      |
| Python | ❌   | Dynamic mismatch, heavy maintenance burden              |
| C++    | ❌   | No audience, no compelling differentiator               |

After bootstrap: remove `fons/codegen/py/` and `fons/codegen/cpp/`.
