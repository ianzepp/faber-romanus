# Zig Target Notes

Zig is a systems programming target that presents interesting challenges due to its explicit, low-level nature. It serves as an educational bridge between high-level Latin syntax and systems programming concepts.

Zig and Rust share similar memory management concerns. Faber uses a **unified approach** for both targets: Latin prepositions (`de`, `in`) for borrowing semantics, and arena allocation for memory management. See rust.md for the full ownership design; this document covers Zig-specific details.

## Implementation Status Summary

| Category | Status | Notes |
|----------|--------|-------|
| Variables | Done | `var`/`const` with type inference |
| Functions | Done | Parameters, return types, async stubs |
| Control flow | Done | `if`, `while`, `for`, `switch` |
| `genus`/struct | Done | Fields, methods, `init()` with `@hasField` |
| `pactum`/interface | Stub | Emits doc comment only |
| `ego` → `self` | Done | Explicit self parameter |
| `novum .. de` | Partial | `@hasField` pattern, arity issues |
| Lambdas | Done | Anonymous struct `.call` pattern |
| Error handling | Partial | `mori` → `@panic`, `iace` → `@panic` (should be error union) |
| Allocators | Not started | Design complete, not implemented |
| `de`/`in` prepositions | Not started | Design complete, not implemented |
| Collections | Not started | Types mapped, no runtime methods |
| Comptime | Not started | No explicit comptime blocks |
| Slices | Partial | Type mapping works, runtime building needs allocators |
| Tuples | Not started | `series<A,B>` designed but not implemented |
| Tagged unions | Not designed | Critical gap for self-hosting |

**Exempla Status: 25/45 passing (56%)**

## What Makes Zig Easier

### 1. `varia`/`fixum` → `var`/`const`

Direct 1:1 mapping. Faber's explicit mutability declaration is exactly what Zig wants.

### 2. `ego` (this) as Explicit

Faber treats `ego` as a real expression, not magic syntax sugar. Zig requires explicit `self` parameters in methods - so `ego.nomen` → `self.nomen` is a clean transformation.

### 3. `novum X { overrides }`

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

### 1. `pactum` (Interfaces)

Faber has nominal interfaces (`pactum`). Zig uses structural/duck typing with no interface declarations.

**Key insight:** Interface enforcement happens in Faber's semantic analyzer, not Zig. By the time Zig receives the code, it's already validated.

**Generated Zig:** Just the struct with methods. The `pactum` becomes a documentation comment.

### 2. Generators (`cursor` Functions)

Faber supports generator functions with `cede` yielding values. Zig has no generators - you'd need to manually build an iterator struct with state.

**Status:** Not implemented. Would require significant design work.

### 3. Async Model

Faber's `futura`/`cede` assumes JS-style Promise-based async. Zig's async is frame-based with explicit suspend/resume points.

**Current approach:** Fake it with error unions (`!T` return type). Not real async.

### 4. Generics

Faber has `lista<T>` style generics. Zig uses comptime type parameters: `fn ArrayList(comptime T: type)`. Runtime generic instantiation doesn't exist.

**Current approach:** Type annotations map (`lista<T>` → `[]T`), but no runtime generic support.

### 5. String Concatenation

Faber allows `"a" + "b"`. In Zig, you can only do this at comptime with `++`. Runtime string building needs an allocator.

**Current status:** Only works at comptime. Runtime concatenation would need arena allocator (not implemented).

### 6. Nullable Types

Faber's nullable types (`textus?`) map to Zig's `?[]const u8`. The mapping works, but Zig's optional handling requires explicit unwrapping (`.?`, `orelse`, `if (x) |val|`).

## Type Mappings

| Faber | Zig | Nullable | Notes |
|-------|-----|----------|-------|
| `textus` | `[]const u8` | `?[]const u8` | String slice |
| `numerus` | `i64` | `?i64` | Integer |
| `fractus` | `f64` | `?f64` | Float |
| `decimus` | `f128` | `?f128` | Wide float |
| `magnus` | `i128` | `?i128` | Big integer |
| `bivalens` | `bool` | `?bool` | Boolean |
| `nihil` | `void` | — | Unit type |
| `vacuum` | `void` | — | Void return |
| `octeti` | `[]u8` | `?[]u8` | Byte slice |
| `objectum` | — | — | **No equivalent** - generates compile error |
| `ignotum` | — | — | **No equivalent** - generates compile error |
| `numquam` | `noreturn` | — | Never returns |

### Generic Types

| Faber | Zig | Notes |
|-------|-----|-------|
| `lista<T>` | `[]T` | Slice (no allocator) |
| `tabula<K,V>` | `std.StringHashMap(V)` | Type only, unusable without allocator |
| `copia<T>` | `std.AutoHashMap(T, void)` | Type only, unusable without allocator |
| `promissum<T>` | `!T` | Error union |
| `series<A,B>` | — | **Not implemented** |

## Ownership Design: Latin Prepositions

> **Status:** Design complete. **NOT IMPLEMENTED.**

Faber uses Latin prepositions to annotate borrowing semantics. This design is shared with the Rust target.

| Preposition | Meaning | Zig Output |
|-------------|---------|------------|
| (none) | Owned, may allocate | Allocator-managed value |
| `de` | Borrowed, read-only | `[]const u8`, `*const T` |
| `in` | Mutable borrow | `*T`, `*[]u8` |

### Examples (Design Only)

```fab
// No preposition = owned, allocator-managed
functio greet(textus name) -> textus {
    redde "Hello, " + name + "!"
}

// "de" = borrowed slice, read-only
functio length(de textus source) -> numerus {
    redde source.longitudo
}

// "in" = mutable pointer, will be modified
functio append(in lista<textus> items, textus value) {
    items.adde(value)
}
```

**Would generate:**

```zig
fn greet(alloc: Allocator, name: []const u8) []const u8 {
    return std.fmt.allocPrint(alloc, "Hello, {s}!", .{name}) catch @panic("OOM");
}

fn length(source: []const u8) i64 {
    return @intCast(source.len);
}

fn append(alloc: Allocator, items: *std.ArrayList([]const u8), value: []const u8) void {
    items.append(alloc, value) catch @panic("OOM");
}
```

## Memory Management: Arena Allocator

> **Status:** Design complete. **NOT IMPLEMENTED.**

Faber uses arena allocation as the default memory strategy for systems targets.

### Why Arena?

1. **Simple mental model** - Allocate freely, everything freed at scope exit
2. **No explicit frees** - Generated code doesn't need `defer alloc.free(...)`
3. **Zero memory leaks** - Arena deinit handles everything
4. **Standard library** - Uses `std.heap.ArenaAllocator`, no external deps

### Generated Code Pattern (Future)

```zig
const std = @import("std");

pub fn main() void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    defer arena.deinit();
    const alloc = arena.allocator();

    // User code - allocations use arena
    const greeting = greet(alloc, "World");
    std.debug.print("{s}\n", .{greeting});
}
```

## Error Handling Design

> **Status:** Partially implemented. `mori` works, `iace` does NOT generate proper error unions.

| Keyword | Meaning | Current Output | Should Be |
|---------|---------|----------------|-----------|
| `iace` | Recoverable error | `@panic("msg")` | `return error.X` |
| `mori` | Fatal/panic | `@panic("msg")` | `@panic("msg")` ✓ |
| `fac`/`cape` | Error boundary | Comment stub | `catch \|err\|` |

### Current Implementation (Broken)

```fab
functio fetch(textus url) -> textus {
    si timeout { iace "timeout" }
    redde data
}
```

**Currently generates:**
```zig
fn fetch(url: []const u8) []const u8 {
    if (timeout) { @panic("timeout"); }  // WRONG - should be return error
    return data;
}
```

**Should generate:**
```zig
fn fetch(url: []const u8) ![]const u8 {
    if (timeout) { return error.Timeout; }
    return data;
}
```

### What's Missing

1. Functions containing `iace` should have `!T` return type
2. `iace "message"` should become `return error.Message`
3. Call sites should use `try` or `catch`
4. `fac`/`cape` blocks need proper error handling codegen

## Lambda Syntax

Faber uses `pro` for lambdas. Zig doesn't have closures - lambdas compile to anonymous struct functions.

```fab
pro x redde x * 2
```

**Generates:**

```zig
struct { fn call(x: i64) i64 { return x * 2; } }.call
```

**Capturing lambda (context struct):**

```fab
fixum multiplier = 2
pro x redde x * multiplier
```

**Generates:**

```zig
const Context = struct { multiplier: i64 };
const ctx = Context{ .multiplier = 2 };
fn lambda(ctx: *const Context, x: i64) i64 {
    return x * ctx.multiplier;
}
```

## Zig-Specific Features NOT in Faber

### Comptime

Zig's compile-time execution. Faber has no equivalent syntax.

```zig
// Zig - comptime block
const lookup = comptime blk: {
    var table: [256]u8 = undefined;
    for (0..256) |i| {
        table[i] = @as(u8, i) ^ 0xFF;
    }
    break :blk table;
};
```

Faber does implicit compile-time work (like `proba ex` table unrolling) but doesn't expose a general `comptime` keyword.

### Slices vs Arrays

Zig distinguishes fixed arrays `[N]T` from slices `[]T`. Faber's `lista<T>` maps to slice, but:
- Array literals `.{1,2,3}` don't coerce to slices
- Runtime slice building needs allocators

### Tagged Unions

Zig has tagged unions for type-safe discrimination:

```zig
const Event = union(enum) {
    click: struct { x: i32, y: i32 },
    keypress: u8,
    quit,
};
```

**Faber status:** Untagged unions (`A | B`) work. Tagged unions with payloads are NOT designed and NOT implemented. This is a critical gap for compiler self-hosting.

## Exempla Test Results

**Current: 25/45 passing (56%)**

### Passing (25)

| Category | Files |
|----------|-------|
| Fundamenta | fixum, litterae, salve, scribe, varia (5/5) |
| Functiones | async, basic, praepositiones, typed, verba (5/5) |
| Regimen | adfirma, custodi, elige, iace-mori, si-ergo (5/9) |
| Structurae | ego, genus/basic, genus/creo, genus/defaults, genus/methods (5/7) |
| Typi | bigint, collectiones, nullable (3/4) |
| Operatores | ternarius, vel (2/7) |

### Failure Categories

#### 1. Lambda Type Inference (9 files)

Lambdas without explicit return types generate `@compileError`. Zig requires explicit return types.

**Example:** `regimen/clausura.fab`

**Fix needed:** Infer lambda return types from context or require annotations.

#### 2. Unused Function Parameters (6 files)

Zig strictly enforces parameter usage. Functions with `anytype` parameters that aren't used fail.

**Files:** fundamenta/primitivi, operatores/logici, operatores/nulla, regimen/si-aliter, structurae/pactum, errores/tempta-cape

**Fix needed:** Prefix unused params with `_` or update exempla.

#### 3. `objectum` Return Type (3 files)

Functions returning `objectum` generate compile error since Zig has no equivalent.

**Files:** structurae/in, structurae/objecta, structurae/destructuring

**Fix needed:** Use concrete struct types.

#### 4. For-In Object Iteration (1 file)

`de obj pro key` generates invalid Zig - `for` only works on arrays/slices.

**File:** regimen/de-pro

**Fix needed:** Different codegen pattern for object key iteration.

#### 5. Loop Variable Redeclaration (1 file)

Multiple loops reusing same variable name.

**File:** operatores/intervalla

**Fix needed:** Generate unique loop variable names.

#### 6. Spread Operator (1 file)

Known limitation - generates `@compileError`.

**File:** operatores/sparge

## Future Work

### High Priority (Blocking Self-Hosting)

1. **Error unions** - `iace` must generate `return error.X`, not `@panic`
2. **Tagged unions** - Design and implement discriminated unions
3. **Arena allocator** - Enable runtime string/collection operations

### Medium Priority

4. **`de`/`in` prepositions** - Implement borrowing semantics
5. **Collection methods** - `lista.adde()`, `tabula.pone()`, etc.
6. **Lambda type inference** - Reduce `@compileError` on lambdas

### Lower Priority

7. **Comptime blocks** - Expose Zig's comptime to Faber syntax
8. **Slice literals** - Proper `[]T` from array literals
9. **Build integration** - Generate `build.zig` for projects

## Design Tensions

The core tension: **Faber leans toward dynamic/high-level semantics** while **Zig is explicitly low-level**.

The ownership prepositions and arena allocator bridge this gap, but neither is implemented yet. Current Zig codegen produces valid Zig for simple cases but fails on anything requiring runtime memory management.
