# Proba: Test Syntax for Faber

Test framework syntax for self-hosted compiler testing in rivus/.

## Keywords

| Construct | Syntax | JS Equivalent |
|-----------|--------|---------------|
| Suite | `probandum "name" { }` | `describe()` |
| Test | `proba "name" { }` | `test()` |
| Skip | `proba omitte "reason" { }` | `test.skip()` |
| Todo | `proba futurum "reason" { }` | `test.todo()` |
| Before each | `ante { }` | `beforeEach()` |
| Before all | `ante omnia { }` | `beforeAll()` |
| After each | `post { }` | `afterEach()` |
| After all | `post omnia { }` | `afterAll()` |
| Assertion | `adfirma expr` | `expect(expr).toBe(true)` |

## Etymology

- **probandum** - gerundive of `probare` (to test/prove): "that which must be tested"
- **proba** - imperative of `probare`: "test!" / "prove!"
- **omitte** - imperative of `omittere`: "skip!" / "omit!"
- **futurum** - neuter noun: "the future" / "pending"
- **ante** - preposition: "before"
- **post** - preposition: "after"
- **omnia** - neuter plural: "all things"
- **singula** - neuter plural: "each one" (implied default)

## Syntax

### Test Suites

```fab
probandum "Tokenizer" {
    proba "parses integers" { ... }
    proba "parses floats" { ... }
}
```

Suites are optional. Prefer flat `proba` with descriptive names over deep nesting.

### Table-Driven Tests

```fab
proba "parse" ex [
    { ingressus: "42",  exitus: 42 },
    { ingressus: "-7",  exitus: -7 },
    { ingressus: "0",   exitus: 0 },
] pro { ingressus, exitus } {
    adfirma parse(ingressus) est exitus
}
```

`proba ... ex ... pro` iterates over test cases with destructuring. The test runner expands this into N individual tests. Prefer this over nested `probandum` for coverage.

### Assertions

Use `adfirma` with existing expression operators:

```fab
proba "equality" {
    adfirma result est "expected"
    adfirma result non est nihil
}

proba "unary checks" {
    adfirma value nonnulla          // not null
    adfirma count positivum         // > 0
    adfirma balance negativum       // < 0
    adfirma items nulla             // empty/null
}

proba "comparisons" {
    adfirma longitudo(arr) est 5
    adfirma age > 0
    adfirma age < 150
}
```

No special matcher API - assertions use the same operators as regular code.

### Failure Messages

`adfirma` auto-captures expression values on failure:

```fab
adfirma result est 42
// Failure: result (41) non est 42

adfirma result est 42, "parsed value"
// Failure: parsed value: 41 non est 42
```

Optional second argument provides a label. Both sides of comparisons are shown in output.

### Skip and Todo

```fab
proba omitte "blocked by issue #42" {
    // skipped - not executed
}

proba futurum "needs new parser feature" {
    // todo - marked pending
}
```

Modifier comes after `proba`, before the description string.

### Setup and Teardown

```fab
probandum "Database" {
    ante omnia { db = connect() }   // once before all tests
    ante { db.reset() }             // before each test
    post { db.rollback() }          // after each test
    post omnia { db.close() }       // once after all tests

    proba "inserts" { ... }
    proba "updates" { ... }
}
```

Default (no modifier) means "each". Explicit `omnia` for "all".

### Async Tests

Tests are async by default at the wrapper level. Use normal async syntax inside:

```fab
proba "fetches data" {
    fixum result = cede fetch("/api")
    adfirma result.status est 200
}

proba "with destructuring" {
    ex fetch("/api") figendum { status, data }
    adfirma status est 200
    adfirma data nonnulla
}
```

No `futura proba` needed - `cede` and `figendum` just work.

## Grammar

```ebnf
probaDecl := 'probandum' STRING '{' probaBody '}'
probaBody := (anteBlock | postBlock | probaDecl | probaStmt)*

probaStmt := 'proba' probaModifier? STRING probaSource? blockStmt
probaModifier := 'omitte' | 'futurum'
probaSource := 'ex' expression 'pro' (IDENTIFIER | objectPattern)

anteBlock := 'ante' 'omnia'? blockStmt
postBlock := 'post' 'omnia'? blockStmt
```

The `probaSource` clause enables table-driven tests by iterating over an expression with destructuring.

## Compilation Model

The compiler transforms Faber test syntax into flat, native test code. No runtime framework required.

### Algorithm

1. **Walk the tree** - traverse `probandum` and `proba` nodes
2. **Accumulate prefixes** - `probandum` names build a path (e.g., "Tokenizer: numerals:")
3. **Collect setup/teardown** - `ante`/`post` blocks from each scope
4. **Emit at `proba`** - generate one native test with:
   - Full prefixed name
   - Inlined `ante` blocks from all parent scopes
   - Inlined `post` blocks (or `defer` equivalent)
   - Test body
5. **Unroll tables** - `proba ex` becomes N separate tests at compile time

### Constraints

- Table expressions in `proba ex` must be compile-time literals
- Cannot use runtime variables for test case generation
- All unrolling happens during compilation, not execution

## Code Generation

### Full Example

```fab
probandum "Tokenizer" {
    ante { lexer = init() }

    probandum "numerals" {
        proba "integers" {
            adfirma tokenize("42")[0].typus est "NUMBER"
        }
        proba "floats" {
            adfirma tokenize("3.14")[0].typus est "NUMBER"
        }
    }

    proba "empty" ex [
        { input: "", expect: 0 },
        { input: "   ", expect: 0 },
    ] pro { input, expect } {
        adfirma longitudo(tokenize(input)) est expect
    }
}
```

### Zig Output

```zig
const std = @import("std");
const testing = std.testing;

test "Tokenizer: numerals: integers" {
    var lexer = init();
    try testing.expectEqualStrings("NUMBER", tokenize("42")[0].typus);
}

test "Tokenizer: numerals: floats" {
    var lexer = init();
    try testing.expectEqualStrings("NUMBER", tokenize("3.14")[0].typus);
}

test "Tokenizer: empty: ''" {
    var lexer = init();
    try testing.expectEqual(@as(usize, 0), tokenize("").len);
}

test "Tokenizer: empty: '   '" {
    var lexer = init();
    try testing.expectEqual(@as(usize, 0), tokenize("   ").len);
}
```

Flat structure. Setup inlined. Table unrolled. Native idioms.

### Rust Output

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokenizer_numerals_integers() {
        let lexer = init();
        assert_eq!(tokenize("42")[0].typus, "NUMBER");
    }

    #[test]
    fn tokenizer_numerals_floats() {
        let lexer = init();
        assert_eq!(tokenize("3.14")[0].typus, "NUMBER");
    }

    #[test]
    fn tokenizer_empty_blank() {
        let lexer = init();
        assert_eq!(tokenize("").len(), 0);
    }

    #[test]
    fn tokenizer_empty_spaces() {
        let lexer = init();
        assert_eq!(tokenize("   ").len(), 0);
    }
}
```

Names become snake_case function identifiers. Same flattening, same inlining.

### TypeScript Output

```typescript
import { test } from "bun:test";

test("Tokenizer: numerals: integers", () => {
    const lexer = init();
    if (!(tokenize("42")[0].typus === "NUMBER")) {
        throw new Error("Assertion failed: tokenize(\"42\")[0].typus est \"NUMBER\"");
    }
});

test("Tokenizer: numerals: floats", () => {
    const lexer = init();
    if (!(tokenize("3.14")[0].typus === "NUMBER")) {
        throw new Error("Assertion failed: tokenize(\"3.14\")[0].typus est \"NUMBER\"");
    }
});

test("Tokenizer: empty: ''", () => {
    const lexer = init();
    if (!(tokenize("").length === 0)) {
        throw new Error("Assertion failed: longitudo(tokenize(\"\")) est 0");
    }
});

test("Tokenizer: empty: '   '", () => {
    const lexer = init();
    if (!(tokenize("   ").length === 0)) {
        throw new Error("Assertion failed: longitudo(tokenize(\"   \")) est 0");
    }
});
```

Flat like all other targets. No describe/beforeEach - setup inlined, names prefixed.

### Python Output

```python
import pytest

@pytest.fixture
def lexer():
    return init()

def test_tokenizer_numerals_integers(lexer):
    assert tokenize("42")[0].typus == "NUMBER"

def test_tokenizer_numerals_floats(lexer):
    assert tokenize("3.14")[0].typus == "NUMBER"

@pytest.mark.parametrize("input,expect", [
    ("", 0),
    ("   ", 0),
])
def test_tokenizer_empty(lexer, input, expect):
    assert len(tokenize(input)) == expect
```

Python uses pytest fixtures for setup and `@parametrize` for table-driven (preserves the loop, pytest handles expansion).

### C++ Output

No external framework. Raw test functions with a generated harness:

```cpp
#include <iostream>
#include <string>
#include <functional>
#include <vector>

struct TestResult {
    std::string name;
    bool passed;
    std::string error;
};

std::vector<TestResult> results;

void run_test(const std::string& name, std::function<void()> fn) {
    try {
        fn();
        results.push_back({name, true, ""});
    } catch (const std::exception& e) {
        results.push_back({name, false, e.what()});
    }
}

// Generated tests

void test_tokenizer_numerals_integers() {
    auto lexer = init();
    auto result = tokenize("42")[0].typus;
    if (!(result == "NUMBER")) {
        throw std::runtime_error("Assertion failed: tokenize(\"42\")[0].typus est \"NUMBER\"\n  got: " + result);
    }
}

void test_tokenizer_numerals_floats() {
    auto lexer = init();
    auto result = tokenize("3.14")[0].typus;
    if (!(result == "NUMBER")) {
        throw std::runtime_error("Assertion failed: tokenize(\"3.14\")[0].typus est \"NUMBER\"\n  got: " + result);
    }
}

void test_tokenizer_empty_blank() {
    auto lexer = init();
    if (!(tokenize("").size() == 0)) {
        throw std::runtime_error("Assertion failed: longitudo(tokenize(\"\")) est 0");
    }
}

void test_tokenizer_empty_spaces() {
    auto lexer = init();
    if (!(tokenize("   ").size() == 0)) {
        throw std::runtime_error("Assertion failed: longitudo(tokenize(\"   \")) est 0");
    }
}

// Generated main

int main() {
    run_test("Tokenizer: numerals: integers", test_tokenizer_numerals_integers);
    run_test("Tokenizer: numerals: floats", test_tokenizer_numerals_floats);
    run_test("Tokenizer: empty: ''", test_tokenizer_empty_blank);
    run_test("Tokenizer: empty: '   '", test_tokenizer_empty_spaces);

    int passed = 0, failed = 0;
    for (const auto& r : results) {
        if (r.passed) {
            std::cout << "✓ " << r.name << "\n";
            passed++;
        } else {
            std::cout << "✗ " << r.name << "\n  " << r.error << "\n";
            failed++;
        }
    }

    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
```

No dependencies. Compiler emits the harness alongside the tests.

## Open Design Questions

### Stdlib vs Inline Harness

Two approaches for emitting test infrastructure:

**Inline**: Emit harness code directly into each test file.
- Pro: Zero dependencies, self-contained single file output
- Con: Duplicated boilerplate across test files

**Static stdlib**: Ship a `faber/proba` module per target.
- Pro: Clean test files, single source of truth, updatable without recompile
- Con: Additional distribution/installation step

Potential stdlib structure:
```
faber/
  proba.hpp      # C++ harness
  proba.zig      # Zig helpers (supplements std.testing)
  proba.rs       # Rust macros and harness
  proba.py       # Python helpers (minimal, pytest does most)
  proba.ts       # TypeScript runner and assertions
```

**Recommendation**: Start with inline emission for simplicity. Extract to stdlib when harness needs grow beyond basic run/catch/report (e.g., timing, filtering, parallel execution, watch mode).

Consider a compiler flag: `--emit-harness` for self-contained output vs default stdlib import.

### Test Discovery

How does the test runner find tests?

- **Explicit**: Compiler emits a manifest or main() that lists all tests
- **Convention**: Test files named `*.proba.fab` or in `probae/` directory
- **Attribute**: Mark test files with a pragma or declaration

Current design assumes explicit - the compiler generates the runner as part of output.

### Async Test Timeout

Tests are async by default. Should there be a default timeout?

```fab
proba "slow operation" tempora 5000 {  // 5 second timeout?
    cede slowOperation()
}
```

Or leave timeout to the harness/runner level rather than per-test syntax?

### Test Filtering

Runtime filtering by name pattern:

```bash
./tests --filter "Tokenizer:*"
./tests --filter "*:integers"
```

This is a harness feature, not language syntax. Note for stdlib implementation.

### Failure Continuation

Current model: first `adfirma` failure throws, test stops.

Alternative: collect all failures, report at end.

```fab
proba "multiple checks" {
    adfirma a est 1    // fails
    adfirma b est 2    // still runs?
    adfirma c est 3    // still runs?
}
// Reports: 2 of 3 assertions failed
```

This would require a different codegen strategy - wrap each assertion rather than throw immediately. Adds complexity. Probably not worth it for v1.

## Implementation Notes

New keywords to add to lexicon:
- `probandum` (keyword, test-suite)
- `proba` (keyword, test-case)
- `omitte` (modifier)
- `futurum` (modifier)
- `ante` (keyword, setup)
- `post` (keyword, teardown)
- `omnia` (modifier)

Parser additions:
- `parseProbandum()` - suite blocks
- `parseProba()` - test cases with optional modifiers
- `parseAnte()` / `parsePost()` - setup/teardown blocks

AST types:
- `ProbandumStatement`
- `ProbaStatement`
- `AnteBlock`
- `PostBlock`
