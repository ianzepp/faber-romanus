# Codegen Target Checklist

Status key: `[x]` implemented, `[~]` partial, `[ ]` not implemented

## Type System

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `textus` (string) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `numerus` (number) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `bivalens` (boolean) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `nihil` (null) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `vacuum` (void) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `lista<T>` (array) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `tabula<K,V>` (map) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `copia<T>` (set) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `promissum<T>` (promise) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `erratum` (error) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `cursor<T>` (iterator) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Nullable types (`T?`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Union types (`T | U`) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Generic type params | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Type aliases (`typus`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Variable Declarations

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `varia` (mutable) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `fixum` (immutable) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Type annotations | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Object destructuring | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Initializer expressions | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Function Declarations

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| Basic functions (`functio`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Parameters | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Parameter type annotations | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Return type annotation | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `futura` (async) | [x] | [~] | [ ] | [ ] | [ ] | [ ] |
| `cursor` (generator) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Async generator | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Arrow functions | [x] | [~] | [ ] | [ ] | [ ] | [ ] |

## Control Flow Statements

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `si` (if) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `aliter` (else) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `aliter si` (else if) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `dum` (while) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `ex...pro` (for-of) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `in...pro` (for-in) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `ex...fit` (for-of verb form) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `ex...fiet` (async for) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Range expressions (`0..10`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Range with step (`per`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `cum` (with/context) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `elige` (switch) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Switch cases (`si`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Switch default (`aliter`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `custodi` (guard) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Catch on control flow | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Return/Exit Statements

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `redde` (return) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `redde` with value | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `redde` void | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Exception Handling

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `tempta` (try) | [x] | [~] | [ ] | [ ] | [ ] | [ ] |
| `cape` (catch) | [x] | [~] | [ ] | [ ] | [ ] | [ ] |
| `demum` (finally) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `iace` (throw) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `adfirma` (assert) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Assert with message | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Output/Debug

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `scribe` statement | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Multiple args | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Expressions

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| Identifiers | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `ego` (this/self) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Boolean literals (`verum`/`falsum`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `nihil` literal | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| String literals | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Number literals | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Template literals | [x] | [~] | [ ] | [ ] | [ ] | [ ] |
| Array literals | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Object literals | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Binary operators | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Comparison operators | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Logical operators | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Unary operators | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `nulla` (is empty) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `nonnulla` (has content) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `negativum` (is negative) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `positivum` (is positive) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Member access (`.`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Computed access (`[]`) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Function calls | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Method calls | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Assignment | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| Conditional (ternary) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `cede` (await/yield) | [x] | [~] | [ ] | [ ] | [ ] | [ ] |
| `novum` (new) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `novum...cum` (new with props) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |

## OOP Features (genus/pactum)

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `genus` declaration | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Field declarations | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Field defaults | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Computed fields (getters) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Static fields (`generis`) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Public/private visibility | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `creo` constructor | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Auto-merge constructor | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Methods | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Async methods | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Generator methods | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `implet` (implements) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Generic classes | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `pactum` declaration | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Interface methods | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Import/Export

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `ex...importa` (named imports) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `ex...importa *` (wildcard) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |

## Standard Library Intrinsics

| Feature | TypeScript | Zig | Python | WASM | Ruby | C++ |
|---------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `_scribe` (print) | [x] | [x] | [ ] | [ ] | [ ] | [ ] |
| `_vide` (debug) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_mone` (warn) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_lege` (read input) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_fortuitus` (random) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_pavimentum` (floor) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_tectum` (ceiling) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_radix` (sqrt) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `_potentia` (pow) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Lista (Array) Methods

| Latin | TypeScript | Zig | Python | WASM | Ruby | C++ |
|-------|:----------:|:---:|:------:|:----:|:----:|:---:|
| `adde` (push) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `addita` (push copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `praepone` (unshift) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `praeposita` (unshift copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `remove` (pop) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `remota` (pop copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `decapita` (shift) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `decapitata` (shift copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `purga` (clear) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `primus` (first) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ultimus` (last) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `accipe` (at index) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `longitudo` (length) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `vacua` (is empty) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `continet` (includes) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `indiceDe` (indexOf) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `inveni` (find) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `inveniIndicem` (findIndex) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `filtrata` (filter) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mappata` (map) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `reducta` (reduce) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `explanata` (flatMap) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `plana` (flat) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `inversa` (reverse copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ordinata` (sort copy) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `sectio` (slice) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `prima` (take first n) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `ultima` (take last n) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `omitte` (skip first n) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `omnes` (every) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `aliquis` (some) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `coniunge` (join) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `perambula` (forEach) | [x] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Target-Specific Considerations

### Python Target Notes

1. **No block braces** - Python uses indentation; codegen must track indent level
2. **No explicit types at runtime** - Type hints are optional annotations only
3. **No `new` keyword** - Classes are called directly: `MyClass()`
4. **Different async model** - Uses `asyncio`, needs event loop
5. **Different iterator model** - `__iter__`/`__next__` protocol
6. **Property decorators** - `@property` for getters
7. **Protocol classes** - `typing.Protocol` for interfaces (3.8+)
8. **Pattern matching** - `match`/`case` only in 3.10+
9. **Union types** - `X | Y` syntax only in 3.10+, else `Union[X, Y]`
10. **Type aliases** - `type X = Y` only in 3.12+, else `X = Y` or `TypeAlias`

**Minimum version**: Python 3.10+ (for `match`/`case` and `|` union syntax)

### WASM Target Notes

1. **No native strings** - Strings require memory management, often via linear memory
2. **No GC** - Manual memory management or use reference types proposal
3. **Limited types** - Only i32, i64, f32, f64 natively; structs via memory layout
4. **No exceptions** - Error handling via return values or trap
5. **No closures** - Function references exist but no captures
6. **Module imports** - Host functions for I/O (`console.log`, etc.)
7. **Table-based dispatch** - For dynamic calls and interfaces
8. **Component Model** - Future: richer types via WASM Component Model

**Approach**: Consider targeting WASM via Zig backend or using WAT text format directly

### Ruby Target Notes

1. **Dynamic typing** - Types are runtime-only, no static annotations
2. **Everything is an object** - Even primitives like integers
3. **Blocks and procs** - `do...end` blocks, lambdas with `->`
4. **No braces for blocks** - Uses `do`/`end` or `{`/`}` for single-line
5. **Symbols** - `:symbol` syntax for interned strings
6. **Duck typing** - No interfaces, just method presence
7. **Mixins** - `include`/`extend` modules instead of interfaces
8. **Metaprogramming** - Heavy use of `method_missing`, `define_method`
9. **Iterator pattern** - `.each`, `.map`, `.select` with blocks
10. **Exception model** - `begin`/`rescue`/`ensure`/`raise`

**Minimum version**: Ruby 3.0+ (for pattern matching, ractor)

### C++ Target Notes

1. **Header/source split** - May need `.hpp`/`.cpp` file pairs
2. **Manual memory** - RAII, smart pointers (`unique_ptr`, `shared_ptr`)
3. **Templates** - For generics, but complex instantiation rules
4. **No reflection** - Type info limited without RTTI
5. **Exceptions** - `try`/`catch`/`throw`, but often avoided in perf-critical code
6. **STL containers** - `std::vector`, `std::map`, `std::set`, `std::string`
7. **Lambdas** - `[captures](params) { body }` syntax
8. **Async** - `std::async`, `std::future`, or coroutines (C++20)
9. **Modules** - C++20 modules vs traditional `#include`
10. **constexpr** - Compile-time evaluation similar to Zig's comptime

**Minimum version**: C++17 (structured bindings, `if constexpr`) or C++20 (coroutines, concepts)

## Implementation Priority Suggestion

| Target | Priority | Rationale |
|--------|----------|-----------|
| TypeScript | Done | Primary target, web-first |
| Zig | In Progress | Systems programming, educational |
| Python | High | Popular, good for teaching Latin syntax |
| Ruby | Medium | Similar dynamic semantics to Python |
| WASM | Medium | Browser runtime, but complex |
| C++ | Low | Complex, better served by Zig path |
