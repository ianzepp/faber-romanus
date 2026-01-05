---
status: planned
updated: 2026-01
---

# Rivus Module Resolution

Rivus needs local file import resolution to match faber's `semantic/modules.ts`. This document describes the required implementation.

## Problem Statement

The exempla `statements/importa-local/main.fab` fails because rivus parses the `importa` statement but doesn't resolve symbols from the imported file:

```fab
# main.fab
ex "./utils" importa greet, ANSWER, Point

fixum textus message = greet("World")  # Error: undefined symbol 'greet'
```

The parser produces an `ImportaSententia` node with the source path and specifiers, but the semantic layer never loads `utils.fab` to extract `greet`, `ANSWER`, and `Point` into scope.

## Faber's Implementation

Faber handles this in `fons/faber/semantic/modules.ts` (~400 lines):

### Key Components

| Component             | Purpose                                               |
| --------------------- | ----------------------------------------------------- |
| `isLocalImport()`     | Checks if source starts with `./` or `../`            |
| `resolveModulePath()` | Resolves relative path, adds `.fab` extension         |
| `extractExports()`    | Scans AST for exportable declarations                 |
| `resolveModule()`     | Main entry: cache check, cycle detect, parse, extract |
| `ModuleContext`       | Tracks `basePath`, `cache`, `inProgress`              |

### Types

```typescript
interface ModuleExport {
    name: string;
    type: SemanticType;
    kind: 'function' | 'variable' | 'type' | 'genus' | 'pactum' | 'ordo' | 'discretio';
}

interface ModuleExports {
    exports: Map<string, ModuleExport>;
    program: Program;
    filePath: string;
}

interface ModuleContext {
    basePath: string;
    cache: Map<string, ModuleExports>;
    inProgress: Set<string>;
}
```

### Resolution Flow

```
resolveModule(source, ctx)
    │
    ├─ resolveModulePath() ───► absolute path (add .fab if needed)
    │
    ├─ cache.get(path) ───► return cached if exists
    │
    ├─ inProgress.has(path) ───► return empty exports (cycle)
    │
    ├─ inProgress.add(path)
    │
    ├─ readFile() ───► source code
    │
    ├─ tokenize() + parse() ───► Program AST
    │
    ├─ extractExports() ───► ModuleExports
    │
    ├─ cache.set(path, exports)
    │
    ├─ for each ImportaDeclaration in program:
    │      resolveModule(childSource, childCtx)  # recursive
    │
    └─ inProgress.delete(path)
```

### Export Extraction

All top-level declarations are considered exports:

| Declaration     | Export Kind |
| --------------- | ----------- |
| `functio`       | `function`  |
| `genus`         | `genus`     |
| `pactum`        | `pactum`    |
| `ordo`          | `ordo`      |
| `discretio`     | `discretio` |
| `typus`         | `type`      |
| `fixum`/`varia` | `variable`  |

## Rivus Implementation Plan

### File Structure

```
fons/rivus/semantic/
├── index.fab          # Main semantic analyzer entry
├── modulus.fab        # Module resolution (new)
├── typus.fab          # Type system (if needed)
└── scopus.fab         # Symbol table / scope (if needed)
```

Alternatively, module resolution could live in the parser layer as `fons/rivus/parser/modulus.fab` if semantic analysis is deferred.

### Required Types (in AST or semantic layer)

```fab
# Export information
genus ModulusExportum {
    textus nomen
    textus genus        # "functio" | "variabilis" | "typus" | "genus" | "pactum" | "ordo" | "discretio"
}

# Resolved module
genus ModulusResolutum {
    tabula<textus, ModulusExportum> exporta
    textus via          # absolute file path
}

# Resolution context
genus ModulusContextus {
    textus viaBasica                           # importing file's path
    tabula<textus, ModulusResolutum> cache     # path -> resolved module
    copia<textus> inProgressu                  # cycle detection
}
```

### Core Functions

```fab
# Check if import is local file
functio estLocaleImportum(textus fons) -> bivalens {
    redde fons.initioCum("./") aut fons.initioCum("../")
}

# Resolve import path to absolute filesystem path
functio resolveViaModuli(textus fons, textus viaBasica) -> textus? {
    # 1. Get directory of importing file
    # 2. Add .fab extension if missing
    # 3. Resolve to absolute path
    # 4. Return nihil if file doesn't exist
}

# Extract exports from parsed program
functio extraheExporta(NodusRadix program) -> tabula<textus, ModulusExportum> {
    # Walk program.sententiae
    # For each FunctioDeclaratio, GenusDeclaratio, etc:
    #   Add to exports map
}

# Main resolution entry point
functio resolveModulum(textus fons, ModulusContextus ctx) -> ModulusResolutum? {
    # 1. Resolve path
    # 2. Check cache
    # 3. Check cycle (inProgressu)
    # 4. Mark in progress
    # 5. Read file, tokenize, parse
    # 6. Extract exports
    # 7. Cache result
    # 8. Recursively resolve child imports
    # 9. Remove from in progress
    # 10. Return result
}
```

### Integration Points

#### Parser Layer

The parser already produces `ImportaSententia` nodes. No parser changes needed.

#### Semantic Layer (if exists)

When processing `ImportaSententia`:

1. Call `resolveModulum()` for local imports
2. Add exported symbols to current scope
3. Track import aliases (`importa foo ut f`)

#### Codegen Layer

For TypeScript/Zig/etc codegen:

- Local imports need path rewriting (`.fab` -> `.ts`, etc.)
- Or multi-file bundling that inlines dependencies

### Dependencies

Rivus module resolution needs:

1. **File system access** - read imported files
2. **Path manipulation** - resolve relative paths
3. **Tokenizer** - tokenize imported source
4. **Parser** - parse imported source to AST
5. **Recursion** - handle nested imports

This may require calling back into faber (via compiled TypeScript) if rivus doesn't yet have self-hosted file I/O. Alternative: generate TypeScript that faber's `modules.ts` can handle.

### Cycle Handling

Faber allows cycles by returning empty exports when a cycle is detected (JS/TS hoisting handles this at runtime). Rivus should match this behavior:

```fab
si ctx.inProgressu.habet(viaAbsoluta) {
    # Cycle detected - return empty exports
    redde finge ModulusResolutum {
        exporta: innatum tabula<textus, ModulusExportum>(),
        via: viaAbsoluta
    }
}
```

## Test Cases

The existing exempla provides the test case:

```
fons/exempla/statements/importa-local/
├── main.fab    # imports from utils.fab
└── utils.fab   # exports greet, ANSWER, Point
```

Additional test cases to add:

| Test                          | Description                  |
| ----------------------------- | ---------------------------- |
| `importa-local/cycle-a.fab`   | A imports B, B imports A     |
| `importa-local/diamond.fab`   | A imports B+C, both import D |
| `importa-local/nested.fab`    | A imports B, B imports C     |
| `importa-local/alias.fab`     | `importa foo ut f`           |
| `importa-local/not-found.fab` | Import nonexistent file      |

## Open Questions

### Q1: Where should module resolution live?

**Option A:** Parser layer (`fons/rivus/parser/modulus.fab`)

- Pro: Mirrors faber's split (parser produces AST, modules.ts in semantic)
- Con: Parser shouldn't do file I/O

**Option B:** New semantic layer (`fons/rivus/semantic/modulus.fab`)

- Pro: Clean separation
- Con: Rivus doesn't have semantic layer yet

**Option C:** Codegen layer

- Pro: Can reuse faber's modules.ts via TypeScript interop
- Con: Semantic errors appear late

Recommendation: **Option B** - creates semantic infrastructure rivus will need anyway.

### Q2: How to handle file I/O in rivus?

Rivus compiles to TypeScript. Options:

**Option A:** Use faber's Bun runtime APIs via `norma`

```fab
ex norma importa legeScriptum, existitScriptum
```

**Option B:** Add extern declarations for Node/Bun APIs

```fab
externa functio readFileSync(textus via) -> textus
```

**Option C:** Generate code that calls faber's modules.ts

- Rivus outputs TypeScript
- Faber's semantic layer handles module resolution
- Rivus just needs to parse/emit

Recommendation: **Option A** if `norma` has file APIs, otherwise **Option C** as interim.

### Q3: Type information depth?

Faber extracts placeholder types (`UNKNOWN`) for exports, deferring full resolution to semantic analysis. Rivus could:

**Option A:** Match faber - extract names only, resolve types later
**Option B:** Full type extraction during module resolution

Recommendation: **Option A** - keeps module resolution simple.

## Migration Plan

| Step | Description                                                         | Status  |
| ---- | ------------------------------------------------------------------- | ------- |
| 0    | Document design                                                     | Done    |
| 1    | Add `ModulusExportum`, `ModulusResolutum`, `ModulusContextus` types | Planned |
| 2    | Implement `estLocaleImportum`, `resolveViaModuli`                   | Planned |
| 3    | Implement `extraheExporta`                                          | Planned |
| 4    | Implement `resolveModulum` with cache and cycle detection           | Planned |
| 5    | Integrate with semantic/codegen layer                               | Planned |
| 6    | Add test cases for cycles, diamonds, aliases                        | Planned |
| 7    | Verify `statements/importa-local` passes                            | Planned |

## Key Files

| File                                              | Purpose                     |
| ------------------------------------------------- | --------------------------- |
| `fons/faber/semantic/modules.ts`                  | Reference implementation    |
| `fons/rivus/parser/sententia/declara.fab:800-870` | `parseImportaSententia`     |
| `fons/rivus/ast/sententia.fab`                    | `ImportaSententia` AST node |
| `fons/exempla/statements/importa-local/`          | Test case                   |

---

Opus nondum perfectum est, sed via clara est.

## GPT-5.2 Notes

### Reality check: Rivus already has the right “phase hook”

This proposal is directionally correct, but a few parts are stale relative to today’s Rivus tree:

- Rivus _does_ have a semantic layer and a predeclaration pass already: `fons/rivus/semantic/index.fab` predeclares names (Phase 1) then analyzes bodies (Phase 2). Imports are explicitly treated as “handled in predeclaration” but are not yet implemented: `fons/rivus/semantic/sententia/index.fab`.
- Therefore, the cleanest integration point is **to extend `predeclare()` to process `ImportaSententia`** (and potentially also reject non-top-level imports if you want TS-parity).

Concretely: today, any identifier only introduced via `ex "./x" importa foo` will still trip `UndefinedVariable` during expression analysis (e.g. `fons/rivus/semantic/expressia/primaria.fab`). The symptom described in the doc matches this.

### A bigger blocker than the algorithm: where does `viaBasica` come from?

Your plan assumes the semantic layer knows “the importing file’s path”. But the current bootstrap CLI reads source from stdin and calls `analyze(programma)` with no path context: `fons/rivus/cli.fab`.

That means even a perfect `resolveViaModuli()` cannot be correct unless:

- The compiler entry point is file-based (the `bun run rivus compile <file.fab>` path), or
- You add an optional `viaIngressus`/`basePath` parameter to semantic analysis (or stash it in `Analyzator`).

So: **treat “plumb entry file path into semantic” as Step 0** for local imports. Otherwise module resolution only works in environments where the “current directory” coincidentally matches the importer’s directory.

### Where module resolution should live (my vote)

I agree with Option B (semantic layer), but with a stronger rationale:

- Module resolution is needed for **semantic symbol availability** (prevent undefined symbol errors) and for **type availability** (eventually), so it belongs in semantic.
- Rivus already has the correct two-pass structure; modules fit naturally as a Phase 1 concern.

Recommended shape:

- Add `fons/rivus/semantic/modulus.fab` implementing a near-port of `fons/faber/semantic/modules.ts`.
- Extend `fons/rivus/semantic/index.fab:predeclare()` with an `ImportaSententia` branch that:
    - Detects norma vs local vs external
    - Loads local exports (or at minimum, defines imported names as `IGNOTUM`)
    - Emits `NotExportedFromModule` / `ModuleNotFound` errors as appropriate

### Cycles: decide whether you actually want an error

This doc says “match faber behavior” by returning empty exports on cycles. That’s roughly what Faber’s resolver does today: `fons/faber/semantic/modules.ts` returns `ok: true` with an empty export map when `inProgress` hits (it does _not_ surface a cycle error).

Two implications:

- If you truly want parity, **S013 `CircularImport` should probably not fire for module cycles** (or only for “hard” cycles you choose to forbid).
- If you _do_ want cycles to be an error in Rivus (stricter than Faber), that’s defensible—but then the document shouldn’t present “match Faber” as the goal.

Caveat lector: Faber’s types mention `'cycle'` in `ModuleResult`, but the implementation currently treats cycles as “ok” rather than “error”. Aligning expectations here will save you debugging time.

### Export extraction: names-only is fine, but watch namespace imports

I agree with your Recommendation Q3 (names-only / placeholder types) as the bootstrap-friendly move.

However, there are two practical wrinkles:

1. **Wildcard namespace import** (`ex "./utils" importa * ut utils`)

- The doc lists this as a test case.
- In Faber, codegen supports this, but semantic import binding for the alias is easy to miss. In your Rivus plan, make sure you define the alias symbol (probably as `IGNOTUM` or `objectum`) in addition to (or instead of) importing all members.

2. **Kind mapping**

Your sketch stores `genus` as strings like "functio" | "variabilis" etc. Rivus’s symbol table wants `SymbolumSpecies` plus a `SemanticTypus`. You can still keep a lightweight export record, but you’ll eventually want a mapping:

- `functio` → `SymbolumSpecies.Functio` + `functioTypus([...IGNOTUM], IGNOTUM/VACUUM, async, falsum)`
- `fixum/varia` → `SymbolumSpecies.Variabilis` + `IGNOTUM`
- `genus/pactum/ordo/typus/discretio` → a `Usitatum`/`Ordo`/`Genus` placeholder as needed

This is essentially what Faber’s `extractExports()` does, just in Rivus’s type system.

### Specifier grammar mismatch to flag now

Your document implicitly assumes import specifiers are `name` or `name ut alias` or `*`. That matches `GRAMMAR.md`.

But Rivus’s parser currently allows `ceteri` in `parseImportaSententia()` (it shares the destructuring specifier shape): `fons/rivus/parser/sententia/declara.fab`.

From `GRAMMAR.md`, `ceteri` is intended to be destructuring-only (“rest is only valid in destructuring contexts”). If you don’t fix the parser immediately, module resolution should at least treat `residuum` on imports as a semantic error (otherwise you’ll generate nonsense TS).

### Don’t forget `norma` parity (even if this doc is “local imports”)

The baseline behavior in README/GRAMMAR is that `norma` imports are compiler intrinsics, not runtime imports.

- Faber TS codegen explicitly skips emitting `import ... from "norma"` and `"norma/*"`: `fons/faber/codegen/ts/statements/importa.ts`.
- Rivus TS codegen currently emits imports verbatim for all sources: `fons/rivus/codegen/ts/sententia/importa.fab`.

Even if you stage the work, it’s worth calling out here because once Rivus can resolve local imports semantically, users will immediately start writing `ex norma importa ...` and expect it to behave like Faber.

### Test strategy: start with the bootstrap’s own source tree

Besides `fons/exempla/statements/importa-local/`, the most valuable “real” test is: **can Rivus semantically analyze its own multi-file compiler source** without spurious `UndefinedVariable` errors?

That forces:

- Relative path resolution (`../ast/...`, `./typi`, etc.)
- Diamond-shaped dependency graphs (common in analyzer modules)
- Caching correctness (performance + avoiding repeated parse)

Once that works, the exempla cases become confidence checks rather than the only proof.
