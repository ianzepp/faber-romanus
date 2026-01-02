# Bootstrap: Self-Hosted Faber Compiler (TypeScript Target)

Rewrite the Faber compiler in Faber, targeting TypeScript/Bun.

## Current State

**Phase 0 (Syntax Modernization) in progress.** Updating fons-fab source to use modern syntax (`casu`/`ceterum`, `intra`/`inter`).

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

### Bootstrap Blockers (Critical Path)

**P0 - Syntax Modernization**

- fons/ compiler now requires `casu`/`ceterum` syntax for `elige`/`discerne` (commit c217493)
- fons-fab/ still uses old `si` syntax → parse errors prevent compilation
- Must update ~85 elige/discerne statements across all modules
- Add missing operators: `intra`, `inter` (commit 4ebac0b)

**P1 - Module System**

- Import/export codegen must work correctly
- 51 files with cross-module dependencies require proper `import` statement generation

**P2 - TypeScript Type Errors (299 remaining)**

```bash
cd opus/bootstrap && npx tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler cli.ts
```

| Category                        | Count | Fix                                                       |
| ------------------------------- | ----: | --------------------------------------------------------- |
| Discriminated union narrowing   |   ~70 | Review `discerne` codegen — types not narrowing correctly |
| Missing exports                 |   ~24 | Add `@ publicum` to `genus`/`ordo` declarations           |
| Private method accessibility    |   ~22 | Add `@ publicum` to methods or refactor architecture      |
| Missing `tabula.habet()` method |    ~4 | Add `habet` → `.has()` to `fons/codegen/tabula.ts`        |
| Import placement                |    ~5 | Fix codegen placing imports inside functions              |

**P3 - Comment Preservation**

- AST has `notaePrae`/`notaePost` fields
- TS codegen must emit comments to maintain readability in self-hosted source

### Out of Scope for Bootstrap

- **Stdlib registries** (lista/tabula/copia) - Not needed for TS target (native Array/Map/Set)
- **Morphological parsing** (lexicon declensions/conjugations) - Keyword lookup sufficient
- **Preamble templates** - Only needed for non-TS targets
- **Unit tests** - YAML integration tests provide coverage
- **Other codegen targets** (Zig, Rust, Fab) - Add after TS self-compiles

## Bootstrap Phases

### Phase 0: Syntax Modernization (Current)

**Goal**: Update fons-fab source to use modern syntax so fons/ compiler can parse it

**Tasks**:

1. Add `casu`, `ceterum`, `intra`, `inter` keywords to `fons-fab/lexicon/verba.fab`
2. Update `fons-fab/lexor/` to tokenize new keywords
3. Replace `si` → `casu` in all `elige`/`discerne` blocks (~85 statements)
4. Replace `secus` → `ceterum` in `elige` default cases
5. Verify: `bun run faber compile fons-fab/cli.fab` succeeds

### Phase 1: TypeScript Compilation

**Goal**: All 51 files compile to TypeScript without type errors

**Tasks**:

1. Fix module import codegen (imports must appear at top of file)
2. Fix discriminated union type narrowing in `discerne` codegen
3. Add missing `@ publicum` exports
4. Implement comment preservation in TS codegen
5. Verify: `cd opus/bootstrap && npx tsc --noEmit cli.ts` passes

### Phase 2: Self-Compilation (TypeScript)

**Goal**: Bootstrap compiler can compile itself to TypeScript

**Tasks**:

1. Compile fons-fab with fons: `bun run faber compile fons-fab/cli.fab -o opus/bootstrap/cli.ts`
2. Compile all fons-fab modules to opus/bootstrap/
3. Run bootstrap compiler: `bun opus/bootstrap/cli.ts compile <test.fab>`
4. Compare output with fons compiler (functional equivalence)

### Phase 3: YAML Test Verification

**Goal**: Confirm feature coverage parity with fons compiler

**Tasks**:

1. Run proba/\*_/_.yaml tests through both compilers
2. Compare generated code (semantically equivalent, whitespace may differ)
3. Identify any missing features or edge cases
4. Document known differences

### Phase 4: Fab Codegen Target

**Goal**: True self-hosting (Faber → Faber)

**Tasks**:

1. Implement `fons-fab/codegen/fab/` target
2. Self-compile fons-fab with bootstrap compiler to Faber
3. Verify output is identical to fons-fab source (canonical formatting)
4. Switch to using fons-fab as primary compiler

### Phase 5: Additional Targets

**Goal**: Add Zig and Rust codegen for post-bootstrap goals

**Tasks**:

1. Implement `fons-fab/codegen/zig/` target + runtime
2. Implement `fons-fab/codegen/rs/` target
3. Run YAML tests to verify correctness
4. Remove fons/codegen/py/ and fons/codegen/cpp/ from original compiler

## Build Commands

```bash
# Current: Compile single file for testing (Phase 0)
bun run faber compile fons-fab/cli.fab -o /tmp/test.ts

# Phase 1: Compile all fons-fab files to opus/bootstrap/
for f in fons-fab/**/*.fab; do
  outfile="opus/bootstrap/${f#fons-fab/}"; outfile="${outfile%.fab}.ts"
  mkdir -p "$(dirname "$outfile")"
  bun run faber compile "$f" -o "$outfile"
done

# Phase 1: TypeScript type-check
cd opus/bootstrap && npx tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler cli.ts

# Phase 2: Run compiled compiler
bun opus/bootstrap/cli.ts compile input.fab -o output.ts

# Phase 2: Self-compile verification
bun opus/bootstrap/cli.ts compile fons-fab/cli.fab -o /tmp/cli2.ts
diff opus/bootstrap/cli.ts /tmp/cli2.ts  # Should be identical

# Phase 3: YAML test verification
bun run faber compile proba/fundamenta.yaml -o /tmp/old.ts
bun opus/bootstrap/cli.ts compile proba/fundamenta.yaml -o /tmp/new.ts
diff /tmp/old.ts /tmp/new.ts
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

- `casu Variant ut v { v.field }` — binds whole variant, access fields via `v.`
- `casu Variant pro a, b { }` — extracts fields positionally (fragile, avoid)

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

## Success Criteria (Phase 2 Complete)

1. ✅ fons-fab/ source uses modern syntax (casu/ceterum/intra/inter)
2. ✅ fons-fab/ compiles to valid TypeScript (type-checks pass)
3. ✅ Module system works (correct import statements generated)
4. ✅ Comments preserved in generated TypeScript
5. ✅ Bootstrap compiler can compile itself
6. ✅ Self-compilation produces functionally equivalent output
7. ✅ No runtime dependencies beyond Bun

## Success Criteria (Full Bootstrap - Phase 4 Complete)

8. ✅ Fab codegen target implemented
9. ✅ fons-fab self-compiles to Faber with canonical formatting
10. ✅ YAML test suite passes with bootstrap compiler
11. ✅ Bootstrap compiler becomes primary compiler

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
