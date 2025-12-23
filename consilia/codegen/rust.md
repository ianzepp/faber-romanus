# Rust Target Notes

Rust presents unique challenges as a compilation target due to its ownership system. While many Faber constructs have natural Rust equivalents, the fundamental mismatch is that Faber assumes garbage-collected semantics while Rust requires explicit ownership reasoning.

## What Makes Rust Easier

### 1. `varia`/`fixum` → `let mut`/`let`

Direct mapping. Rust defaults to immutable (`let`), Faber's `fixum` maps cleanly. `varia` → `let mut`.

### 2. No Inheritance

Faber's `genus` doesn't support inheritance - only `implet`. Rust also has no inheritance, only traits. Perfect alignment.

### 3. `pactum` → `trait`

Unlike Zig, Rust actually has a direct equivalent for interfaces. `pactum` can become a real `trait` definition, and `implet` becomes `impl Trait for Struct`. This is much cleaner than Zig's duck typing.

### 4. Pattern Matching (`elige`)

Faber's `elige`/`si` switch maps well to Rust's `match`. Rust's match is more powerful (exhaustive, can destructure), but the basic mapping works.

### 5. Error Propagation

Faber's `cede` in async contexts → Rust's `?` operator. Both are "propagate or unwrap" semantics. The `?` operator is actually closer to what Faber wants than Zig's `try`.

### 6. `ego` → `self`

Same as Zig - Rust requires explicit `self` in methods. Clean transformation.

### 7. Iterators

Rust's iterator combinators (`.iter().map().filter().collect()`) are similar to Faber's lista methods (`mappata`, `filtrata`). The functional style aligns well.

### 8. `nihil` Handling

Faber's nullable types (`textus?`) map to Rust's `Option<String>`. Rust has first-class optional handling, unlike Zig where it's more manual.

## What Makes Rust Harder

### 1. Ownership (The Big One)

Faber has no concept of ownership, borrowing, or moves. Every variable is implicitly "owned" with GC-style semantics. In Rust:
- Who owns this value?
- Should this be `&T`, `&mut T`, or `T`?
- When does this get dropped?

Faber can't express this, so we'd have to either:
- **Clone everything** (safe but inefficient)
- **Use `Rc<RefCell<T>>` everywhere** (runtime borrow checking)
- **Make educated guesses** and hope

### 2. Lifetimes

Related to ownership - Faber has no lifetime annotations. If a Faber function returns a reference to something passed in, Rust needs `'a` annotations. We can't know this from Faber source.

```rust
// Faber: functio first(lista<textus> items) -> textus
// What Rust needs: fn first<'a>(items: &'a [String]) -> &'a str
// What we'd generate: fn first(items: Vec<String>) -> String  // clone everything
```

### 3. String Types

Rust has `String` (owned) vs `&str` (borrowed slice). Faber just has `textus`. We'd probably always generate `String` and `.clone()` liberally, which is wasteful.

### 4. Exception Model

Like Zig, Rust has no exceptions. `tempta`/`cape`/`iace` would need to become `Result<T, E>` with `match` or `?`. But Faber's catch blocks expect to receive the error and continue - Rust's model is more "handle or propagate."

`demum` (finally) has no equivalent. Rust uses RAII/Drop for cleanup.

### 5. Generators

Rust has unstable generator syntax, but stable Rust requires manual `Iterator` impl with state structs - same problem as Zig.

### 6. Async Model

Rust's async is also different from JS. It's lazy (futures don't run until polled), needs a runtime (tokio, async-std), and has `Pin` complexity for self-referential futures. Faber's simple `futura`/`cede` hides all this.

### 7. `novum X cum { overrides }`

Rust doesn't have Zig's comptime `@hasField`. The auto-merge pattern would need:
- A builder pattern, or
- Default trait + struct update syntax: `Struct { field: value, ..Default::default() }`

The struct update syntax is close but requires `Default` impl.

## Rust vs Zig Comparison

| Aspect | Zig | Rust | Easier Target |
|--------|-----|------|---------------|
| Ownership/borrowing | No GC, but simpler model | Complex borrow checker | Zig |
| Interfaces | Duck typing (lossy) | Real traits | Rust |
| Error handling | Error unions | Result<T, E> | Similar |
| Generics | Comptime | Monomorphized | Similar |
| String handling | `[]const u8` slices | `String`/`&str` split | Zig |
| Auto-merge constructor | `@hasField` comptime | Needs builder/Default | Zig |
| Async | Frame-based | Future + runtime | Both hard |
| Ecosystem/tooling | Newer | Mature (cargo) | Rust |

## Potential Approaches

### Approach 1: Clone Everything

Generate owned values everywhere, clone on every pass. Safe but inefficient.

```rust
fn process(items: Vec<String>) -> Vec<String> {
    items.iter().map(|x| x.clone()).collect()
}
```

### Approach 2: Rc<RefCell<T>> Wrapper

Use reference-counted, runtime-borrow-checked wrappers for all values. Approximates GC semantics.

```rust
type FaberString = Rc<RefCell<String>>;
type FaberList<T> = Rc<RefCell<Vec<T>>>;
```

### Approach 3: Ownership Annotations in Faber

Extend Faber with ownership hints:

```
functio process(&lista<textus> items) -> textus  // borrowed
functio take(lista<textus> items) -> lista<textus>  // moved
```

This is a language design change, not just codegen.

### Approach 4: Inference Heuristics

- Function params: borrow by default (`&T`)
- Return values: owned by default (`T`)
- Local variables: owned (`T`)
- Method receivers: `&self` for reads, `&mut self` for mutations

## Type Mappings

| Faber | Rust | Notes |
|-------|------|-------|
| `textus` | `String` | Owned string |
| `numerus` | `f64` | Float for JS compat |
| `bivalens` | `bool` | Boolean |
| `nihil` | `()` | Unit type |
| `textus?` | `Option<String>` | Optional |
| `lista<T>` | `Vec<T>` | Vector |
| `tabula<K,V>` | `HashMap<K,V>` | Hash map |
| `copia<T>` | `HashSet<T>` | Hash set |

## Current Implementation Status

**Not yet implemented.** The `rs/` codegen directory contains a skeleton only.

## Future Considerations

1. **Ownership strategy** - Must decide on clone-all vs Rc vs inference
2. **Lifetime inference** - Heuristics for when to borrow vs own
3. **Error type design** - Custom error enum vs `Box<dyn Error>`
4. **Async runtime** - Tokio vs async-std vs runtime-agnostic
5. **Derive macros** - Auto-generate `Default`, `Clone`, `Debug`
6. **Cargo integration** - Generate `Cargo.toml` for projects

## Open Questions

1. Should Faber grow ownership annotations to support Rust properly?
2. Is "clone everything" acceptable for educational/prototype use?
3. Could we detect pure functions and optimize ownership automatically?
4. Should `genus` generate `#[derive(Clone, Default)]` automatically?
