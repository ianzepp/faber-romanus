# Zig Target Notes

Zig is a systems programming target that presents interesting challenges due to its explicit, low-level nature. It serves as an educational bridge between high-level Latin syntax and systems programming concepts.

## What Makes Zig Easier

### 1. `varia`/`fixum` → `var`/`const`

Direct 1:1 mapping. Faber's explicit mutability declaration is exactly what Zig wants.

### 2. `ego` (this) as Explicit

Faber treats `ego` as a real expression, not magic syntax sugar. Zig requires explicit `self` parameters in methods - so `ego.nomen` → `self.nomen` is a clean transformation.

### 3. `novum X cum { overrides }`

Maps beautifully to Zig's comptime capabilities:

```zig
pub fn init(overrides: anytype) Self {
    var self = Self{
        .field = if (@hasField(@TypeOf(overrides), "field")) overrides.field else default,
    };
    return self;
}
```

The `anytype` + `@hasField` pattern is idiomatic Zig and gives auto-merge behavior without runtime overhead.

### 4. No Inheritance

Faber's `genus` doesn't support class inheritance - only `implet` (interface implementation). Zig also has no inheritance. Good alignment.

### 5. Explicit Types

Faber encourages type annotations (`numerus x = 5`). Zig requires them for `var`. The language nudges users toward what Zig needs.

## What Makes Zig Harder

### 1. Exception Model (`tempta`/`cape`/`iace`)

Faber has try/catch/throw semantics from the JS world. Zig uses error unions (`!T`) and `try` for propagation. There's no `catch` block equivalent - you either handle errors inline with `catch |err|` or propagate with `try`. The `demum` (finally) block has no Zig equivalent at all.

**Current approach:** `iace` → `@panic`, `tempta` → comment, `futura` → `!ReturnType`

### 2. `pactum` (Interfaces)

Faber has nominal interfaces. Zig uses structural/duck typing. We can't actually enforce that a struct "implements" a pactum - we just document the contract and hope.

**Current approach:** Emit documentation comment describing the required methods.

### 3. Generators (`cursor` Functions)

Faber supports generator functions with `cede` yielding values. Zig has no generators - you'd need to manually build an iterator struct with state. This is a significant impedance mismatch.

**Current approach:** Not implemented.

### 4. Async Model

Faber's `futura`/`cede` assumes JS-style Promise-based async. Zig's async is frame-based with explicit suspend/resume points and allocator concerns.

**Current approach:** Fake it with error unions (`!T` return type, `try` for cede).

### 5. Generics

Faber has `lista<T>` style generics. Zig uses comptime type parameters: `fn ArrayList(comptime T: type)`. Runtime generic instantiation doesn't exist - everything is monomorphized at compile time.

**Current approach:** Not implemented for genus. Collection types not supported.

### 6. String Concatenation

Faber allows `"a" + "b"`. In Zig, you can only do this at comptime with `++`. Runtime string building needs an allocator and `std.mem.concat` or similar.

**Current approach:** Use `++` and hope it's comptime. Runtime concatenation not properly handled.

### 7. Nullable Types

Faber's nullable types (`textus?`) map to Zig's `?[]const u8`. The mapping works, but Zig's optional handling requires explicit unwrapping (`.?`, `orelse`, `if (x) |val|`) that Faber doesn't surface.

## Current Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| Variables | Done | `var`/`const` |
| Functions | Done | `fn` with params and return type |
| Control flow | Done | `if`, `while`, `for`, `switch` |
| `genus` | Done | `struct` with `init()` |
| `pactum` | Partial | Documentation comment only |
| `ego` | Done | → `self` |
| `novum cum` | Done | `@hasField` pattern |
| Async | Partial | Error unions, not real async |
| Generators | No | Would need iterator struct |
| Generics | No | Would need comptime params |
| Collections | No | `lista` methods not mapped |

## Type Mappings

| Faber | Zig | Notes |
|-------|-----|-------|
| `textus` | `[]const u8` | String slice |
| `numerus` | `i64` | Could be `f64` for floats |
| `bivalens` | `bool` | Boolean |
| `nihil` | `void` | Unit type |
| `vacuum` | `void` | Void return |
| `textus?` | `?[]const u8` | Optional |

## Design Tensions

The core tension: **Faber leans toward dynamic/high-level semantics** (from its JS/TS heritage) while **Zig is explicitly low-level** with manual memory, no GC, and compile-time-everything.

Features that would need rethinking for Zig to be a first-class target:
- Memory ownership/lifetime annotations
- Explicit allocator passing
- Comptime vs runtime distinction in the source language

## Future Considerations

1. **Allocator threading** - Functions that allocate need allocator params
2. **Iterator pattern** - Manual struct for generators
3. **Comptime generics** - `fn(comptime T: type)` for generic types
4. **Error sets** - Named error types instead of generic `@panic`
5. **Build integration** - Generate `build.zig` for projects
