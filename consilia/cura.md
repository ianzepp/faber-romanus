---
status: partial
targets: [ts, zig]
note: Parser/AST done; TS codegen done; Zig curatorStack partial; curatum not implemented
updated: 2024-12
---

# Cura - Resource Management

## Implementation Status

| Feature                | Status   | Notes                             |
| ---------------------- | -------- | --------------------------------- |
| `cura ... fit` syntax  | Done     | Parser + AST (needs grammar update) |
| `cura ... fiet` async  | Not Done | Replaces `cura cede` syntax       |
| `cura ... cape` errors | Done     | Optional catch clause             |
| TypeScript codegen     | Done     | try/finally with solve?.()        |
| Zig `curatorStack`     | Partial  | Functions only; not `cura` blocks |
| `curatum` param        | Not Done | Allocator in function signature   |
| `curatum` callsite     | Not Done | Per-call allocator override       |
| `curator` keyword      | Not Done | Allocator category in cura blocks |
| Python codegen         | Not Done | with statement                    |
| Rust codegen           | Not Done | RAII / Drop                       |

---

## Overview

`cura` provides two related capabilities:

1. **Resource cleanup** — file handles, connections, locks get released on scope exit
2. **Allocator scoping** — memory allocators for non-GC targets (Zig, C++, Rust)

For GC targets (TypeScript, Python), allocators are irrelevant. The compiler ignores allocator-related constructs entirely.

---

## Etymology

| Keyword   | Meaning                       | Role                              |
| --------- | ----------------------------- | --------------------------------- |
| `cura`    | "care, concern"               | Block that manages a resource     |
| `curator` | "one who cares for, steward"  | Allocator category keyword        |
| `curatum` | "having been cared for" (PPP) | Allocator annotation              |
| `fit`     | "it becomes" (sync)           | Sync resource binding             |
| `fiet`    | "it will become" (async)      | Async resource binding            |
| `solve`   | "release, free"               | Cleanup method                    |

---

## Syntax

All `cura` blocks follow a uniform grammar:

```ebnf
curaStmt := 'cura' expression ('fit' | 'fiet') IDENTIFIER blockStmt catchClause?
```

- `fit` — sync resource acquisition
- `fiet` — async resource acquisition

The binding is always created and available in the block scope.

---

## The Three Use Cases

### 1. Allocators — `cura curator fit <strategy>`

For memory allocators on non-GC targets (Zig, C++, Rust):

```fab
cura curator fit arena {
    varia items: textus[] = []
    items.adde("hello")        // uses 'arena' implicitly via curatorStack
    items.adde("world")

    // Explicit access for Zig interop:
    zigLibrary.init(arena)     // pass allocator directly when needed
}
// arena freed, all allocations released
```

**How it works:**
1. The `curator` keyword signals allocator scoping
2. The binding (`arena`) is pushed onto the `curatorStack`
3. Operations within the block use the stack top implicitly
4. The binding is also available as a variable for explicit access (Zig interop)
5. On block exit: stack pops, cleanup runs

Nesting works naturally:

```fab
cura curator fit outer {
    varia a: textus[] = []
    a.adde("one")              // uses 'outer'

    cura curator fit inner {
        varia b: textus[] = []
        b.adde("two")          // uses 'inner'
    }
    // inner freed

    a.adde("three")            // uses 'outer' again
}
// outer freed
```

**Allocator strategies:**

| Strategy | Zig Mapping                          |
| -------- | ------------------------------------ |
| `arena`  | `std.heap.ArenaAllocator`            |
| `page`   | `std.heap.page_allocator`            |
| `alloc`  | Default (context-dependent)          |

### 2. `curatum` — Allocator Annotation (Escape Hatch)

The `curatum` keyword marks allocator intent. It appears in two places:

#### In Function Signatures

When a function needs an explicit allocator parameter:

```fab
functio buildList(curatum mem, textus prefix) -> textus[] {
    varia items: textus[] = []
    items.adde(prefix)         // uses 'mem'
    redde items
}
```

**When to use:** Rarely. Most code should rely on `cura` blocks. Use `curatum` params when:

- Writing library code that must work with caller-provided allocators
- Interfacing with low-level systems code
- You need fine-grained control over which allocator a function uses

**Target behavior:**

- Zig: `curatum mem` → `mem: std.mem.Allocator`
- TS/Py: parameter stripped entirely (GC handles memory)

#### At Callsites

Override the allocator for a single call without modifying the callee:

```fab
cura arena() fit temp {
    // Everything here uses 'temp'
    fixum a = buildList("foo")

    // But this specific call uses a different allocator
    fixum b = buildList("bar") curatum custom_alloc
}
```

**When to use:** When you need a specific call to use a different allocator than the current scope provides, but you don't want to (or can't) modify the function signature.

**How it works:** `curatum X` temporarily pushes `X` onto the `curatorStack` for the duration of that call only.

#### Symmetry

Same keyword, same meaning — "with this allocator":

| Context   | Syntax                        | Meaning                              |
| --------- | ----------------------------- | ------------------------------------ |
| Signature | `functio f(curatum mem, ...)` | Function receives allocator as `mem` |
| Callsite  | `f() curatum alloc`           | Use `alloc` for this call            |

---

## Default Behavior

Outside any `cura` block, there's an implicit default allocator (`alloc`). For Zig, this maps to a global arena or page allocator. For GC targets, it's ignored.

```fab
// Top-level code, no explicit cura block
varia items: textus[] = []
items.adde("hello")           // uses default 'alloc'
```

Most Faber code never mentions allocators at all. Just use `cura` blocks when you need scoped cleanup, and let the compiler handle the rest.

---

## Resource Cleanup (Non-Allocator)

`cura` isn't just for allocators. Any resource needing cleanup works:

```fab
cura aperi("data.bin") fit fd {
    fixum data = lege(fd, 1024)
    process(data)
}
// fd closed automatically
```

```fab
cura connect(db_url) fit conn {
    fixum users = conn.query("SELECT * FROM users")
    redde users
}
// conn closed automatically
```

```fab
cura mutex.lock() fit guard {
    shared_counter += 1
}
// lock released automatically
```

Cleanup runs even if an error occurs:

```fab
cura aperi("data.bin") fit fd {
    riskyOperation(fd)
} cape err {
    mone("Operation failed:", err)
}
// fd still closed
```

---

## The `curator` Interface

Resources implement cleanup via the `curator` interface:

```fab
pactum curator {
    functio solve() -> vacuum
}
```

Custom resources:

```fab
genus TempFile implet curator {
    privatum path: textus

    functio solve() {
        dele(ego.path)
    }
}

cura TempFile.create() fit tmp {
    inscribe(tmp.path, data)
}
// temp file deleted
```

---

## Async Resources

`cura` works with async acquisition:

```fab
cura cede connect(db_url) fit conn {
    fixum result = cede conn.query(sql)
}
// conn closed
```

Cleanup is always synchronous. Async cleanup creates ordering problems and most resources have sync close anyway.

---

## Target Mappings

### TypeScript

```typescript
const fd = await open('data.bin');
try {
    const data = await read(fd, 1024);
    process(data);
} finally {
    fd.solve?.();
}
```

Allocator constructs (`curatum` params/callsites, allocator `cura` blocks) are stripped entirely.

### Python

```python
with open("data.bin") as fd:
    data = fd.read(1024)
    process(data)
```

Allocator constructs stripped.

### Zig

```zig
var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
defer arena.deinit();
const alloc = arena.allocator();

var items = std.ArrayList([]const u8).init(alloc);
defer items.deinit();
try items.append(alloc, "hello");
```

The `curatorStack` determines which allocator name appears in generated code.

### Rust

```rust
{
    let fd = File::open("data.bin")?;
    let data = read(&fd, 1024)?;
    process(data);
}
// fd dropped
```

---

## Design Decisions

### Why two mechanisms?

**`cura` blocks** handle 95% of cases — scoped resource lifetime with implicit allocator threading.

**`curatum`** is the escape hatch for explicit control — either in function signatures (for library authors) or at callsites (for per-call overrides).

Most Faber code uses only `cura` blocks.

### Why implicit allocator threading?

Explicit allocator params pollute every function signature. Faber targets multiple backends — forcing Zig's allocator model onto TypeScript code is wrong.

The `curatorStack` approach keeps Faber source clean while generating correct Zig code.

### Why sync-only cleanup?

Async cleanup creates ordering problems:

- What if cleanup awaits something that fails?
- Nested async cleanup order is undefined
- Most resources have sync close anyway

If async cleanup is truly needed, do it explicitly before scope exit.

### Why `solve` for cleanup?

Latin `solve` means "release, free" — fitting for releasing resources. Short and clear.

---

## Implementation Notes

### Zig Codegen

The `curatorStack` tracks the active allocator name:

```typescript
let curatorStack: string[] = ['alloc'];

function getCurator(): string {
    return curatorStack[curatorStack.length - 1] ?? 'alloc';
}
```

Currently pushes on:

- Function entry when a `curatum` param exists

Needs to also push on:

- `cura` block entry (using the binding name)
- `curatum` callsite (for that call only)

### GC Target Codegen

Simply ignore:

- `curatum` parameters (strip from signature and callsites)
- `curatum` callsite annotations (strip entirely)
- Allocator-related `cura` blocks (generate normal try/finally for cleanup, ignore allocator aspect)
