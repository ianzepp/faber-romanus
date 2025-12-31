# Bootstrap: Self-Hosted Faber Compiler (TypeScript Target)

Rewrite the Faber compiler in Faber, targeting TypeScript/Bun.

## Rationale

1. **Path of least resistance** — TS codegen is the most mature (632 test expectations)
2. **Same runtime** — Bun runs both current compiler and output
3. **No memory management** — GC handles allocation; no `cura`/`curata` complexity
4. **Faster iteration** — Fix issues in Faber, recompile, test immediately

## Current State

### Compiles Successfully

| Module               | Location                 | Files | Status                        |
| -------------------- | ------------------------ | ----- | ----------------------------- |
| AST types            | `fons-fab/ast/`          | 21    | Complete, uses imports        |
| Lexer                | `fons-fab/lexor/`        | 2     | Complete, uses imports        |
| Keywords             | `fons-fab/lexicon/`      | 1     | Complete                      |
| Parser errors        | `parser/errores.fab`     | 1     | Complete                      |
| Parser core          | `parser/nucleus.fab`     | 1     | Complete                      |
| Resolvitor interface | `parser/resolvitor.fab`  | 1     | Complete (pactum defined)     |
| Type parser          | `parser/typus.fab`       | 1     | **Converted to Resolvitor**   |
| Parser entry         | `parser/index.fab`       | 1     | Stubbed, needs ResolvitorImpl |
| Statement dispatch   | `sententia/index.fab`    | 1     | Stubbed, needs full impl      |
| Action statements    | `sententia/actio.fab`    | 1     | **Converted to Resolvitor**   |
| Error statements     | `sententia/error.fab`    | 1     | **Converted to Resolvitor**   |
| Block/program        | `sententia/massa.fab`    | 1     | **Converted to Resolvitor**   |
| Variable decls       | `sententia/varia.fab`    | 1     | **Converted to Resolvitor**   |
| Expression entry     | `expressia/index.fab`    | 1     | **Converted to Resolvitor**   |
| Binary operators     | `expressia/binaria.fab`  | 1     | Stubbed (type issue)          |
| Unary/postfix        | `expressia/unaria.fab`   | 1     | Stubbed (type issue)          |
| Primary              | `expressia/primaria.fab` | 1     | Stubbed (type issue)          |

**All 12 parser files now compile successfully.**

### Resolvitor Pattern

The mutual recursion problem between expression and statement parsers was solved using a `pactum Resolvitor` interface:

```faber
pactum Resolvitor {
    functio parser() -> Parser
    functio expressia() -> Expressia
    functio sententia() -> Sententia
    functio massa() -> MassaSententia
    functio adnotatio() -> TypusAnnotatio
}
```

Parsing functions receive `Resolvitor r` and call `r.expressia()`, `r.sententia()` etc. for cross-module parsing. The concrete `ResolvitorImpl` (not yet implemented) will wire up the actual functions.

### Remaining Parser Work

**Fully implemented with Resolvitor:**

- `typus.fab` - Type annotations with generics, nullable, array shorthand
- `sententia/actio.fab` - redde, rumpe, perge, iace, scribe
- `sententia/error.fab` - tempta/cape/demum, fac, adfirma
- `sententia/massa.fab` - Block parsing, program parsing
- `sententia/varia.fab` - Variable declarations, destructuring

**Stubbed (compile but need implementation):**

- Expression parsers (blocked by type system issue)
- Statement dispatcher (blocked by type system issue)

**Statement parsers with TODO stubs:**

- Import declarations (`ex ... importa`)
- Function declarations (`functio`)
- Type declarations (`typus`, `ordo`, `genus`, `pactum`, `discretio`)
- Control flow (`si`, `dum`, `ex...pro`, `de...pro`, `in`)
- Pattern matching (`elige`, `discerne`, `custodi`)
- Tests (`probandum`, `proba`, `praepara`)
- Entry points (`incipit`, `incipiet`, `cura`, `ad`)

### Remaining Modules

| Module            | Source                 | Est. Lines  | Notes                 |
| ----------------- | ---------------------- | ----------- | --------------------- |
| Parser (complete) | `fons/parser/index.ts` | ~3,500 more | Remaining statements  |
| Semantic          | `fons/semantic/`       | ~2,600      | Type checking, scopes |
| Codegen (TS)      | `fons/codegen/ts/`     | ~2,000      | TS target only        |
| CLI               | `fons/cli.ts`          | ~600        | Entry point           |

## Current Blockers

### 1. AST Types Are Not Discretio Variants (HIGH PRIORITY)

Expression and statement parsers want to return `Expressia` / `Sententia` sum types, but many AST nodes are currently modeled as separate `genus` types.

**Problem:** Faber's type system does not allow assigning a genus instance to a discretio type:

```faber
// This fails:
functio parseAssignatio(Resolvitor r) -> Expressia {
    // ...
    redde { locus: l, signum: s, sinister: a, dexter: b } qua AssignatioExpressia
    // Error: AssignatioExpressia is not assignable to Expressia
}
```

**Update:** This was originally blocked because there was no way to instantiate a discretio variant. The TS compiler now has `finge`, which can construct discriminated-union objects for the TS target. With explicit `qua Expressia` / `qua Sententia`, this unblocks a discretio-based AST without needing subtyping.

**Solutions:**

1. **Define AST types as discretio variants** (preferred):

    ```faber
    discretio Expressia {
        Binaria { Locus locus, textus signum, Expressia sinister, Expressia dexter }
        Unaria { Locus locus, textus signum, Expressia argumentum }
        Littera { Locus locus, LitteraGenus species, textus crudus }
        // ... all expression types
    }
    ```

    Then construct nodes via:

    ```faber
    redde finge Binaria { locus: l, signum: s, sinister: a, dexter: b } qua Expressia
    ```

2. **Use objectum return type** (loses type safety)

3. **Add subtyping/implements** for genus types (higher semantic complexity)

### 2. No Function Hoisting

Faber’s semantic analyzer currently requires functions to be defined before use within a file. The expression parser chain (`parseAssignatio → parseCondicio → ... → parsePrimaria`) tends to want natural top-down ordering, so this forces precedence chains into bottom-up file ordering.

**Current workaround:** Functions are ordered from highest precedence (bottom) to lowest (top) in `binaria.fab`.

**Minimal fix (recommended):** Implement a small two-pass semantic phase that predeclares all top-level function signatures before analyzing bodies. This removes the ordering constraint without needing full two-pass type linking.

### 3. No Do-While Loop

The `fac { } dum condition` syntax doesn't exist. Must use regular `dum` loops.

### 4. Keyword Conflicts

`typus` and `genus` are keywords and cannot be used as variable/field names. Use alternatives like `adnotatio` (for type annotation) and `modus` (for declaration kind).

## Bootstrap Strategy

### Phase 1: Parser (`fons-fab/parser/`) — 60% COMPLETE

1. ✅ Create `genus Parser` with token stream state
2. ✅ Create `pactum Resolvitor` for mutual recursion
3. ✅ Port parsing functions to use Resolvitor
4. ⏳ Resolve AST type system issue (use `discretio` + `finge`)
5. ⏳ Implement `ResolvitorImpl`
6. ⏳ Complete remaining statement parsers

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

### Resolvitor Pattern (NEW)

Mutual recursion solved via interface:

```faber
ex "./resolvitor" importa Resolvitor, Expressia

functio parseCondicio(Resolvitor r) -> Expressia {
    fixum p = r.parser()
    fixum test = parseAut(r)

    si p.congruetVerbum("sic") {
        fixum consequens = r.expressia()  // Cross-module call via Resolvitor
        // ...
    }
}
```

### Closure → Genus Refactoring

TypeScript closures become `genus` with methods:

```typescript
// TypeScript
function parse(tokens: Token[]) {
    let current = 0;
    function advance() {
        return tokens[current++];
    }
}
```

```faber
// Faber
genus Parser {
    lista<Symbolum> symbola
    numerus index

    functio procede() -> Symbolum {
        fixum s = ego.symbola[ego.index]
        ego.index = ego.index + 1
        redde s
    }
}
```

### Latin Naming

| English      | Latin       | Usage                  |
| ------------ | ----------- | ---------------------- |
| `parse`      | `resolvere` | Parse/resolve          |
| `current`    | `index`     | Current position       |
| `tokens`     | `symbola`   | Token list             |
| `peek`       | `specta`    | Look without consuming |
| `advance`    | `procede`   | Move forward           |
| `check`      | `proba`     | Check/test             |
| `match`      | `congruet`  | Match and consume      |
| `expect`     | `expecta`   | Require or error       |
| `report`     | `renuncia`  | Report error           |
| `left`       | `sinister`  | Left operand           |
| `right`      | `dexter`    | Right operand          |
| `operator`   | `signum`    | Operator sign          |
| `body`       | `corpus`    | Block body             |
| `expression` | `expressia` | Expression             |
| `statement`  | `sententia` | Statement              |

### File Organization

```
parser/
├── index.fab              # Public API, ResolvitorImpl
├── nucleus.fab            # Core Parser genus
├── errores.fab            # Error codes
├── resolvitor.fab         # Resolvitor pactum
├── typus.fab              # Type annotation parser
├── sententia/             # Statement parsers
│   ├── index.fab          # Dispatcher (stubbed)
│   ├── actio.fab          # Actions (complete)
│   ├── error.fab          # Error handling (complete)
│   ├── massa.fab          # Blocks (complete)
│   └── varia.fab          # Variables (complete)
└── expressia/             # Expression parsers
    ├── index.fab          # Entry point
    ├── binaria.fab        # Binary ops (stubbed)
    ├── unaria.fab         # Unary/postfix (stubbed)
    └── primaria.fab       # Primaries (stubbed)
```

## Lessons Learned

### Session 1: Parser Foundation

1. **Use generous comments** — English comments inside functions explain control flow since all identifiers are Latin.
2. **Subdirectories help** — Breaking the parser into `sententia/` and `expressia/` makes files easier to find.
3. **Error catalog is essential** — Porting error codes early provides consistent infrastructure.
4. **TODO stubs are fine** — Allows incremental progress.

### Session 2: Module Imports

1. **Local imports now work** — `ex "./path" importa Type, func` resolves relative `.fab` files.
2. **Remove Zig-specific patterns** — Stripped `curata alloc` from lexor.

### Session 3: Resolvitor Pattern

1. **Pactum solves circular deps** — The `pactum Resolvitor` pattern cleanly separates interface from implementation.
2. **Function ordering matters** — No hoisting means bottom-up function order in precedence chains (until two-pass predeclaration exists).
3. **Keyword conflicts** — Avoid `typus`, `genus` as identifiers; use `adnotatio`, `modus`.
4. **Type system is strict** — Genus types are not assignable to discretio types.
5. **`finge` enables discretio AST** — With `finge ... qua Expressia|Sententia`, the bootstrap can return real discretio variants instead of genus nodes.

## Build Commands

```bash
# Check all parser files compile
for f in fons-fab/parser/**/*.fab; do bun run faber check "$f"; done

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

| Phase       | Scope          | Est. Days      | Status        |
| ----------- | -------------- | -------------- | ------------- |
| Parser      | ~5,000 lines   | 5-7            | ~60% complete |
| Semantic    | ~2,600 lines   | 3-4            | Not started   |
| Codegen     | ~2,000 lines   | 3-4            | Not started   |
| CLI         | ~600 lines     | 1              | Not started   |
| Integration | Debug, iterate | 2-3            | Not started   |
| **Total**   |                | **14-19 days** |               |

## Next Steps

1. **Resolve AST type architecture** — Decide whether to restructure AST as discretio variants
2. **Implement ResolvitorImpl** — Wire up parsing functions in `parser/index.fab`
3. **Implement expression parsers** — Complete `binaria.fab`, `unaria.fab`, `primaria.fab`
4. **Complete statement dispatcher** — Full implementation in `sententia/index.fab`
