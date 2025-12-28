# Faber Romanus

A Latin programming language compiler. "The Roman Craftsman."

## Quick Reference

### Faber CLI

| Command                                   | Purpose                            |
| ----------------------------------------- | ---------------------------------- |
| `bun run faber compile <file.fab>`        | Compile to TypeScript (default)    |
| `bun run faber compile <file.fab> -t py`  | Compile to Python                  |
| `bun run faber compile <file.fab> -t zig` | Compile to Zig                     |
| `bun run faber compile <file.fab> -t rs`  | Compile to Rust                    |
| `bun run faber compile <file.fab> -t cpp` | Compile to C++                     |
| `bun run faber run <file.fab>`            | Compile and execute (TS only)      |
| `bun run faber check <file.fab>`          | Check for errors without compiling |
| `bun run faber format <file.fab>`         | Format source file                 |

### Development Scripts

| Command                  | Purpose                            |
| ------------------------ | ---------------------------------- |
| `bun test`               | Run all tests                      |
| `bun test -t "pattern"`  | Run tests matching pattern         |
| `bun test --coverage`    | Run tests with line coverage       |
| `bun run sanity`         | Check feature test coverage exists |
| `bun run lint`           | Lint TypeScript source             |
| `bun run lint:fix`       | Lint with auto-fix                 |
| `bun run prettier`       | Format code                        |
| `bun run prettier:check` | Check formatting                   |

### Build & Release

| Command                     | Purpose                                |
| --------------------------- | -------------------------------------- |
| `bun run build`             | Build faber executable to `opus/`      |
| `bun run exempla`           | Compile all `exempla/*.fab` to `opus/` |
| `bun run exempla -- -t all` | Compile exempla to all targets         |
| `bun run verify:exempla`    | Verify exempla compile correctly       |
| `bun run grammar`           | Regenerate `GRAMMAR.md` from parser    |
| `bun run release`           | Release new version                    |

### Misc Tools

| Command                    | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `bun run misc:ast`         | Check prettier/tree-sitter cover all AST nodes |
| `bun run misc:tree-sitter` | Regenerate and verify tree-sitter parser       |

## Grammar

See `GRAMMAR.md` for the complete syntax reference. It is auto-generated from parser source comments via `bun run grammar`.

### Primitive Types

| Faber      | TypeScript | Python  | Zig          | C++            | Rust     |
| ---------- | ---------- | ------- | ------------ | -------------- | -------- |
| `textus`   | `string`   | `str`   | `[]const u8` | `std::string`  | `String` |
| `numerus`  | `number`   | `int`   | `i64`        | `int64_t`      | `i64`    |
| `fractus`  | `number`   | `float` | `f64`        | `double`       | `f64`    |
| `bivalens` | `boolean`  | `bool`  | `bool`       | `bool`         | `bool`   |
| `nihil`    | `null`     | `None`  | `null`       | `std::nullopt` | `None`   |
| `vacuum`   | `void`     | `None`  | `void`       | `void`         | `()`     |

### Block Syntax Patterns

Faber uses a consistent `keyword expr VERB name { body }` pattern:

| Construct       | Syntax                                    | Purpose        |
| --------------- | ----------------------------------------- | -------------- |
| `ex...pro`      | `ex items pro item { }`                   | iterate values |
| `de...pro`      | `de obj pro key { }`                      | iterate keys   |
| `cura...fit`    | `cura resource fit handle { }`            | resource scope |
| `tempta...cape` | `tempta { } cape err { }`                 | error handling |
| `dum`           | `dum condition { }`                       | while loop     |
| `si`            | `si condition { }`                        | conditional    |
| `elige`         | `elige value { si case { } }`             | switch         |
| `discerne`      | `discerne value { si Variant pro x { } }` | pattern match  |

### Return Type Verbs

| Verb    | Async | Generator | Meaning            |
| ------- | :---: | :-------: | ------------------ |
| `fit`   |  no   |    no     | "it becomes"       |
| `fiet`  |  yes  |    no     | "it will become"   |
| `fiunt` |  no   |    yes    | "they become"      |
| `fient` |  yes  |    yes    | "they will become" |

## Directory Structure

- `fons/` — compiler source ("source, spring")
    - `lexicon/` — keywords, types, nouns, verbs
    - `tokenizer/` — lexical analysis
    - `parser/` — syntax analysis, AST
    - `semantic/` — type checking
    - `codegen/` — target code generation (ts, py, zig, cpp)
- `exempla/` — example .fab programs
- `consilia/` — design documents (not authoritative)
- `grammatica/` — auto-generated grammar docs by category

### Codegen Layout

```
fons/codegen/
├── index.ts              # Router: dispatches to target generators
├── types.ts              # Shared types (CodegenTarget, RequiredFeatures)
└── <target>/             # ts, py, rs, cpp, zig
    ├── index.ts          # Public API for target
    ├── generator.ts      # Main generator class
    ├── expressions/      # Expression handlers (binary.ts, call.ts, etc.)
    ├── statements/       # Statement handlers (si.ts, functio.ts, etc.)
    └── norma/            # Standard library helpers (lista.ts, etc.)
```

### Test Layout

```
proba/codegen/
├── expressions/          # Expression tests (binary.yaml, call.yaml, etc.)
├── statements/           # Statement tests (si.yaml, functio.yaml, etc.)
└── runner.test.ts        # Test runner: loads YAML, runs against all targets
```

**Mapping:** `fons/codegen/<target>/statements/si.ts` → `proba/codegen/statements/si.yaml`

Each YAML file tests all targets (ts, py, rs, cpp, zig) with per-target expectations.

### Test File Structure

```yaml
# proba/codegen/statements/si.yaml
- name: simple if with verum
  faber: |
      si verum {
        scribe "yes"
      }
  expect:
      ts:
          - 'if (true)'
          - 'console.log("yes")'
      py:
          - 'if True:'
          - 'print("yes")'
      rs:
          - 'if true'
          - 'println!'
      cpp:
          - 'if (true)'
      zig:
          - 'if (true)'
  skip: [cpp] # Optional: skip specific targets
```

**Expectation formats:**

- `string` — exact match (after trimming)
- `string[]` — all fragments must be present (contains)
- `{ exact: string }` — exact match
- `{ contains: string[], not_contains: string[] }` — inclusion/exclusion checks

## Syntax Reminder

Faber uses **type-first** syntax, not TypeScript-style `name: Type`:

```fab
// Correct
textus nomen
numerus aetas
functio greet(textus name) -> textus

// Wrong (not Faber syntax)
nomen: textus
aetas: numerus
functio greet(name: textus): textus
```

The colon `:` is used only for default values in genus properties, not for type annotations.

## Banned Keywords

- `cum` — The Latin preposition "with" is permanently banned due to its English homograph.

## Code Standards

**Documentation Tags** (in comments):

- `WHY:` — reasoning, not mechanics
- `EDGE:` — edge cases handled
- `TARGET:` — target-specific behavior
- `GRAMMAR:` — EBNF for parser functions

**Error Handling**: Never crash on malformed input. Collect errors and continue.

## Agent Delegation

The primary agent is the general; sub-agents are infantry. Delegate execution to preserve context for design and judgment.

**When to delegate:**

- Repetitive transformations across many files (extracting methods, migrations)
- Tasks that follow a pattern already understood
- Work that would bloat context with details you won't reference again
- Parallelizable units (e.g., four codegens at once)

**When NOT to delegate:**

- Quick single-file edits (spinning up an agent costs more than doing it)
- Tasks requiring judgment calls mid-execution
- Exploratory work where the approach isn't yet clear

**Briefing quality determines success.** Vague prompts return wrong results. Include:

- Exact file paths (source, destination, references)
- A working example to follow
- Specific transformations required
- What NOT to modify
- Verification steps (e.g., "run `bun test` after")

**Trust but verify.** After agents complete:

- Type-check (`bun run tsc --noEmit`)
- Run tests (`bun test`)
- Fix issues yourself rather than re-delegating small repairs

The trade-off is always: context cost of doing it yourself vs. effort to brief an agent properly.

## Communication Style

Sporadically include Latin phrases:

- "Opus perfectum est" (the work is complete)
- "Bene factum" (well done)
- "Errare humanum est" (to err is human)
