# Bootstrap: Zig as Target for Self-Hosted Faber Compiler

This document defines the minimum Zig codegen requirements to compile a Faber-rewritten version of the Faber compiler itself.

## Rationale: Why Zig over Rust

1. **No ownership inference required** - Faber has no borrow checker semantics. Emitting valid Rust requires either conservative cloning (slow) or complex ownership inference (hard). Zig's manual memory model maps directly.

2. **Existing infrastructure** - `subsidia/zig/` contains working Zig stdlib bindings. The Zig codegen is already 62% passing.

3. **Faster compile times** - Self-hosted compiler edit-compile-test cycles benefit from Zig's speed.

4. **Simpler FFI** - If we need C library interop (e.g., tree-sitter), Zig's seamless C ABI is trivial.

## Compiler Architecture Overview

The current compiler (`fons/`) has these modules:

| Module       | Purpose                      | Key Data Structures         |
| ------------ | ---------------------------- | --------------------------- |
| `lexicon/`   | Keyword/type definitions     | String constants, enums     |
| `tokenizer/` | Source text -> tokens        | Token structs, position     |
| `parser/`    | Tokens -> AST                | ~50 AST node types          |
| `semantic/`  | Type checking, scope binding | Symbol tables, scope stacks |
| `codegen/`   | AST -> target source         | String building, recursion  |
| `prettier/`  | AST -> formatted Faber       | Same as codegen             |
| `cli.ts`     | Orchestration                | File I/O, arg parsing       |

## Feature Requirements by Priority

### P0: Absolutely Required

These features are non-negotiable for a working compiler.

| Feature                    | Current Zig Status | Notes                                 |
| -------------------------- | :----------------: | ------------------------------------- |
| `textus` (string)          |        [x]         | Heavy use for source code, output     |
| `numerus` (integer)        |        [x]         | Line/column numbers, indices          |
| `bivalens` (boolean)       |        [x]         | Flags, conditionals                   |
| `nihil` / nullable `T?`    |        [x]         | Optional AST children                 |
| `genus` (struct)           |        [x]         | AST nodes, tokens, errors             |
| `ordo` (enum)              |        [x]         | Token types, AST node types           |
| `discretio` (tagged union) |        [x]         | AST node variants                     |
| `functio` (functions)      |        [x]         | Every compiler pass                   |
| Methods on `genus`         |        [x]         | Parser methods, generator methods     |
| `si`/`aliter` (if/else)    |        [x]         | Conditional logic everywhere          |
| `dum` (while)              |        [x]         | Token scanning loops                  |
| `ex...pro` (for-of)        |        [x]         | Iterating AST children, token streams |
| `elige` (switch)           |        [x]         | Node type dispatch (critical)         |
| `discerne` (match)         |        [x]         | Pattern matching on tagged unions     |
| `redde` (return)           |        [x]         | Function returns                      |
| `rumpe`/`perge`            |        [x]         | Loop control                          |
| `lista<T>` (arrays)        |        [~]         | Token arrays, AST child lists         |
| `tabula<K,V>` (maps)       |        [~]         | Symbol tables, keyword lookups        |
| String concatenation       |        [~]         | Output building (needs allocator)     |
| `scriptum()` formatting    |        [x]         | Error messages, code output           |
| File I/O                   |        [ ]         | Read source, write output             |
| Basic error handling       |        [~]         | `iace`/`mori` work, `tempta` doesn't  |

### P1: Highly Desirable

Would make the bootstrap significantly cleaner.

| Feature                   | Current Zig Status | Notes                               |
| ------------------------- | :----------------: | ----------------------------------- |
| Object destructuring      |        [x]         | Cleaner AST unpacking               |
| Array destructuring       |        [x]         | Multi-value returns                 |
| `copia<T>` (sets)         |        [~]         | Keyword sets, visited node tracking |
| `cura...fit` (resources)  |        [x]         | Allocator scoping                   |
| `custodi` (guard clauses) |        [x]         | Early returns in parser             |
| `fac...cape` (scoped try) |        [x]         | Local error handling                |
| `adfirma` (assert)        |        [x]         | Invariant checks                    |
| Default parameter values  |        [ ]         | Parser options (can work around)    |
| `prae` (comptime params)  |        [x]         | Generic type functions              |
| `typus` (type aliases)    |        [x]         | Cleaner type names                  |

### P2: Nice to Have

Can be worked around but would improve code quality.

| Feature                 | Current Zig Status | Notes                           |
| ----------------------- | :----------------: | ------------------------------- |
| Lambdas / closures      |        [~]         | Callbacks - use named functions |
| `sub` (inheritance)     |        [ ]         | Not needed - use composition    |
| `implet` (implements)   |        [x]         | Interface contracts             |
| Regex (`sed`)           |        [ ]         | Tokenizer - use manual parsing  |
| `nexum` (reactive)      |        [ ]         | Not needed for compiler         |
| Async (`futura`/`fiet`) |        [ ]         | Compiler is synchronous         |
| Generators (`fiunt`)    |        [-]         | Zig has no generators           |

### Not Required

Features explicitly not needed for bootstrap.

| Feature               | Reason                      |
| --------------------- | --------------------------- |
| `decimus` (decimal)   | No decimal math in compiler |
| `magnus` (bigint)     | Token positions fit in i64  |
| `promissum` (promise) | Compiler is synchronous     |
| `cursor` (iterator)   | Use `ex...pro` loops        |
| HTTP/Network          | Compiler is offline         |
| Crypto                | No cryptographic operations |
| Compression           | No compressed I/O           |
| Database              | No persistence              |

## Critical Gaps to Address

### 1. String Operations (SOLVED)

**Problem:** String concatenation at runtime requires allocator threading in Zig.

**Current state:** Zig codegen **throws an error** on `textus a + textus b`, directing users to `scriptum()`. This is correct behavior.

**Required for:** Building output code strings, error messages.

**Solution:** Already implemented correctly. Use `scriptum()` exclusively for all string building:

```faber
// Instead of: fixum msg = "Error at " + line + ":" + col
fixum msg = scriptum("Error at {}:{}", line, col)
```

The bootstrap compiler must be written using `scriptum()` for all string construction. This is the Zig-idiomatic approach and already enforced by codegen.

### 2. Collection Methods (MOSTLY SOLVED)

**Problem:** Functional methods exist but had integration issues.

**Current state:**

- `subsidia/zig/lista.zig` runtime **exists** with `filtrata`, `mappata`, `reducta`, etc.
- Codegen emits calls like `nums.filtrata(alloc, predicate)`
- **FIXED:** Array literals with `lista<T>` type now emit `Lista(T).fromItems(alloc, &.{...})`
- **Remaining:** Lambda arguments need explicit return type annotations (`-> T`)

**Example of current output:**

```faber
varia lista<numerus> nums = [1, 2, 3, 4, 5]
fixum filtered = nums.filtrata(pro x -> bivalens: x > 2)
```

```zig
var nums = Lista(i64).fromItems(alloc, &.{ 1, 2, 3, 4, 5 });
const filtered = nums.filtrata(alloc, struct { fn call(x: anytype) bool { return (x > 2); } }.call);
```

**Remaining blocker:**

- Lambda return type annotation required — `pro x -> bivalens: x > 2` works, `pro x: x > 2` doesn't

**Workaround for bootstrap:** Either add return type annotations to lambdas, or write imperatively with `ex...pro` loops:

```faber
// With annotation (works):
fixum filtered = items.filtrata(pro x -> bivalens: x > 0)

// Or imperatively (also works):
varia numerus[] filtered = [] qua numerus[]
ex items pro x {
    si x > 0 { filtered.adde(x) }
}
```

**Note:** Empty array literals still require `qua` cast to bypass semantic analyzer: `[] qua numerus[]`

**Required for:** AST traversal, token filtering, code generation.

**Actual blockers:**

1. Lambda return type inference — Faber lambdas need `-> T` annotation for Zig
2. Array literal → Lista conversion — Need `Lista(i64).fromItems(alloc, &.{1, 2, 3})`

**Workaround for bootstrap:** Write imperatively with `ex...pro` loops. This avoids both lambda and Lista construction issues:

```faber
// Instead of: fixum filtered = items.filtrata(pro x redde x > 0)
varia numerus[] filtered = []
ex items pro x {
    si x > 0 { filtered.adde(x) }
}
```

### 3. Hash Maps (MEDIUM)

**Problem:** `tabula<textus, T>` works but complex operations don't.

**Current state:** `pone`, `accipe`, `habet`, `dele` work. No `claves()`, `valores()`, iteration.

**Required for:** Symbol tables, keyword lookups, scope management.

**Solution:**

- Use `de tabula pro key { }` iteration (already works in Zig)
- Implement `claves()` / `valores()` returning slices

### 4. File I/O (HIGH)

**Problem:** No `solum` (file) stdlib implemented for any target.

**Current state:** Completely missing.

**Required for:** Read source files, write output.

**Solution:** Implement minimal Zig file operations:

```faber
// Required operations
fixum source = solum.lege("input.fab")      // -> []const u8
solum.scribe("output.zig", code)            // -> void
```

Maps to:

```zig
const source = try std.fs.cwd().readFileAlloc(alloc, "input.fab", max_size);
try std.fs.cwd().writeFile("output.zig", code);
```

### 5. Error Collection (MEDIUM)

**Problem:** `tempta...cape` not implemented for Zig (emits `[-]`).

**Current state:** `iace` and `mori` work. No structured error recovery.

**Required for:** Parser error recovery, collecting multiple errors.

**Solution for bootstrap:** Use Zig's native error handling:

- Functions return `!T` (error union)
- Collect errors in a `lista<Error>` passed as parameter
- Use `catch` at call sites to accumulate

This matches Zig idiom better than exception-style `tempta/cape`.

### 6. Unused Parameters (LOW)

**Problem:** Zig errors on unused function parameters.

**Current state:** ~8 test failures due to this.

**Required for:** Clean compilation.

**Solution:** Codegen should either:

- Prefix unused params with `_`
- Add `_ = param;` statements
- Requires tracking which params are used in body

## Bootstrap Subset Definition

The "bootstrap subset" of Faber is:

```
Types:       textus, numerus, bivalens, nihil, T?, vacuum
             genus, ordo, discretio
             lista<T>, tabula<textus, T>

Statements:  varia, fixum
             functio (sync only, no async/generators)
             si/aliter, dum, ex...pro, de...pro
             elige, discerne
             redde, rumpe, perge
             iace, mori, adfirma
             cura...fit (allocator scoping)
             scribe

Expressions: Literals, identifiers, ego
             Binary ops (+, -, *, /, %, ==, !=, <, >, <=, >=, &&, ||)
             Member access (., ?., !.)
             Function calls
             Array/object literals
             scriptum() format strings
             novum...de construction
             qua (type cast)
             Ternary (sic/secus)
```

Explicitly excluded from bootstrap:

- Async (`futura`, `fiet`, `cede`)
- Generators (`fiunt`, `fient`)
- Closures capturing variables
- Inheritance (`sub`)
- Regex literals
- `nexum` reactive fields
- Default parameter values (use overloads or optional params)

## Implementation Roadmap

### Phase 1: Foundation (Current)

- [x] Basic types and control flow
- [x] `genus`/`ordo`/`discretio`
- [x] `elige`/`discerne` pattern matching
- [x] Allocator management (`cura`, `curator`)

### Phase 2: Collections (Next)

- [ ] Reliable `lista<T>` with imperative methods
- [ ] `tabula<textus, T>` with iteration
- [ ] Fix unused parameter warnings

### Phase 3: I/O

- [ ] `solum.lege()` - read file to string
- [ ] `solum.scribe()` - write string to file
- [ ] Command-line argument access

### Phase 4: Error Handling

- [ ] Error collection pattern (lista-based)
- [ ] Clean `!T` return type inference
- [ ] `fac...cape` scoped error handling

### Phase 5: Bootstrap

- [ ] Rewrite `fons/` in Faber using bootstrap subset
- [ ] Compile Faber compiler to Zig
- [ ] Self-host: compiled Zig compiler compiles itself

## Metrics for Readiness

**Current state:** 485 Zig tests pass (0 failures). The 62% figure represents test coverage (396 Zig expectations vs 644 TypeScript expectations), not pass rate. Tests without Zig expectations are skipped, not failed.

Bootstrap is ready when:

1. **P0 features have Zig test coverage** - Add `zig:` expectations to remaining tests
2. **File I/O works** - Can read `.fab` and write `.zig`
3. **Error collection works** - Can report multiple parse errors
4. **Self-compile succeeds** - `faber compile fons/*.fab -t zig` produces valid Zig
5. **Output compiles** - `zig build` succeeds on generated code
6. **Round-trip works** - Zig-compiled Faber produces identical output to TS version

## Alternative: Minimal Runtime

If full codegen proves too difficult, consider a minimal Zig runtime:

```zig
// runtime/faber.zig - copied alongside generated code
pub const Lista = @import("lista.zig").Lista;
pub const Tabula = @import("tabula.zig").Tabula;
pub const solum = @import("solum.zig");
```

This moves complexity from inline codegen to a testable Zig library. See `consilia/futura/zig-norma.md` for this approach.

## Decision Log

| Date    | Decision                     | Rationale                     |
| ------- | ---------------------------- | ----------------------------- |
| 2025-12 | Target Zig over Rust         | No ownership inference needed |
| 2025-12 | Use `scriptum()` for strings | Avoids runtime concat issues  |
| 2025-12 | Imperative-first bootstrap   | Functional methods are sugar  |
| 2025-12 | Error lists over exceptions  | Matches Zig idiom             |
