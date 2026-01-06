# Faber Romanus

**The Roman Craftsman** — A Latin programming language that compiles to TypeScript, Python, Zig, C++, or Rust.

## The Problem

LLMs write code. Humans review it. But the target languages — especially systems languages like Zig, C++, and Rust — are hard for both:

- **LLMs struggle with symbol-dense syntax.** Lifetimes, borrow checkers, template metaprogramming, `&&` vs `&`, `->` vs `.` — these create semantic chaos that increases error rates.
- **Humans can't skim generated code.** Reviewing 50 lines of Rust requires understanding Rust. You can't quickly verify "yes, that logic looks right" without parsing the syntax mentally.

## The Solution

Faber Romanus is a **human-readable intermediate language** for LLM-generated code.

```
ex items pro item {
    si item.price > 100 {
        scribe item.name
    }
}
```

- **LLMs write Latin.** Word-based, consistent syntax. No lifetime annotations, no pointer semantics, no template noise. One language regardless of compile target.
- **Humans skim Latin.** You see `si` (if), `pro` (for), `scribe` (print). You don't need to know Zig to verify the loop logic is correct.
- **Compiler emits target code.** TypeScript, Python, Zig, C++, or Rust. The generated code is what actually runs — you never read it.

The workflow: LLM writes Faber → Human approves → Compiler emits production code.

## Why It Works

**No ecosystem problem.** Faber compiles to the target language, so you use its libraries directly. `ex hono importa Hono` becomes `import { Hono } from 'hono'`. No need to rewrite npm/PyPI/crates.io packages in Latin.

**Grammar designed for LLMs.** The [EBNF.md](EBNF.md) specification is built for LLM consumption: formal grammar, type tables, keyword references, and style guides. An LLM can read it once and generate valid Faber immediately.

**Semantics, not syntax.** Latin keywords encode meaning: `fixum` (fixed/immutable) vs `varia` (variable/mutable), `cede` (yield/await), `redde` (give back/return). The code reads like intent, not implementation.

**Cross-model validation.** We asked GPT, Gemini, and Claude to independently review Faber source code and describe how it "feels" to read. All three converged on the same observations: "low-entropy", "predictable", "industrial", "Roman". The verb conjugation system (`fit`/`fiet`/`fiunt`/`fient`) encoding async/generator semantics was called "fascinating" — it eliminates modifier stacking while preserving clarity. When three competing model families agree that code is "unbreakable", that's signal.

## Principles

**LLM-First, Human-Readable.** The language is optimized for LLMs to write and humans to review. Not the other way around. Humans don't type Faber; they approve it.

**Compiler as Safety Net.** The compiler never crashes on malformed input — it collects errors and continues. When an LLM generates broken code, you see all the issues at once, not one at a time.

**Target Transparency.** You pick a compile target (TypeScript, Zig, etc.) and use that ecosystem directly. Faber is a skin over the target, not a replacement for it.

## Quick Start

```bash
bun install
bun run fons/cli.ts compile exempla/fundamenta/salve.fab        # TypeScript (default)
bun run fons/cli.ts compile exempla/fundamenta/salve.fab -t zig # Zig
bun run fons/cli.ts run exempla/fundamenta/salve.fab            # Compile and run
bun test                                                         # Run tests
```

## Block Syntax Patterns

Faber uses a consistent `keyword expr VERB name { body }` pattern for scoped constructs:

| Construct         | Syntax                                   | Binding | Purpose        |
| ----------------- | ---------------------------------------- | ------- | -------------- |
| `ex...pro`        | `ex expr pro name { }`                   | `name`  | iterate values |
| `ex...fiet`       | `ex expr fiet name { }`                  | `name`  | async iterate  |
| `de...pro`        | `de expr pro name { }`                   | `name`  | iterate keys   |
| `cura...fit`      | `cura expr fit name { }`                 | `name`  | resource scope |
| `cura cede...fit` | `cura cede expr fit name { }`            | `name`  | async acquire  |
| `probandum`       | `probandum "label" { }`                  | —       | test suite     |
| `proba`           | `proba "label" { }`                      | —       | test case      |
| `cura ante`       | `cura ante { }`                          | —       | before each    |
| `cura post`       | `cura post { }`                          | —       | after each     |
| `tempta...cape`   | `tempta { } cape err { }`                | `err`   | error handling |
| `fac...cape`      | `fac { } cape err { }`                   | `err`   | scoped block   |
| `dum`             | `dum expr { }`                           | —       | while loop     |
| `si`              | `si expr { }`                            | —       | conditional    |
| `custodi`         | `custodi { si expr { } }`                | —       | guard clauses  |
| `elige`           | `elige expr { si val { } }`              | —       | switch         |
| `discerne`        | `discerne expr { si Variant pro x { } }` | `x`     | pattern match  |
| `in`              | `in expr { }`                            | —       | mutation scope |

## Primitive Types

| Faber      | TypeScript   | Python     | Zig          | C++                    | Rust      |
| ---------- | ------------ | ---------- | ------------ | ---------------------- | --------- |
| `textus`   | `string`     | `str`      | `[]const u8` | `std::string`          | `String`  |
| `numerus`  | `number`     | `int`      | `i64`        | `int64_t`              | `i64`     |
| `fractus`  | `number`     | `float`    | `f64`        | `double`               | `f64`     |
| `decimus`  | `number`     | `Decimal`  | —            | —                      | —         |
| `magnus`   | `bigint`     | `int`      | `i128`       | —                      | `i128`    |
| `bivalens` | `boolean`    | `bool`     | `bool`       | `bool`                 | `bool`    |
| `nihil`    | `null`       | `None`     | `null`       | `std::nullopt`         | `None`    |
| `vacuum`   | `void`       | `None`     | `void`       | `void`                 | `()`      |
| `numquam`  | `never`      | `NoReturn` | `noreturn`   | `[[noreturn]]`         | `!`       |
| `octeti`   | `Uint8Array` | `bytes`    | `[]u8`       | `std::vector<uint8_t>` | `Vec<u8>` |
| `ignotum`  | `unknown`    | `Any`      | —            | —                      | —         |

## Return Type Verbs

Function return types use Latin verb forms of `fio` ("to become") to encode async and generator semantics:

| Verb    | Async | Generator | Meaning            | Example                         |
| ------- | :---: | :-------: | ------------------ | ------------------------------- |
| `fit`   |  no   |    no     | "it becomes"       | `functio parse() fit numerus`   |
| `fiet`  |  yes  |    no     | "it will become"   | `functio fetch() fiet textus`   |
| `fiunt` |  no   |    yes    | "they become"      | `functio items() fiunt numerus` |
| `fient` |  yes  |    yes    | "they will become" | `functio stream() fient datum`  |

The verb alone carries the semantic — no `futura` or `cursor` prefix needed. Arrow syntax (`->`) is also supported but requires explicit prefixes for async/generator behavior.

## Example

```fab
functio salve(nomen) -> textus {
    redde "Salve, " + nomen + "!"
}

fixum nomen = "Mundus"
scribe salve(nomen)
```

Compiles to TypeScript:

```typescript
function salve(nomen): string {
    return 'Salve, ' + nomen + '!';
}

const nomen = 'Mundus';
console.log(salve(nomen));
```
