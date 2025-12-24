# Vincula - Variable Bindings

## Overview

Variable declaration and binding keywords for sync and async contexts.

## Etymology

- `vincula` - "bonds, bindings" (plural of vinculum)
- `fixum` - "fixed, set" (past participle of figere) — immutable binding
- `varia` - "varied, changeable" — mutable binding
- `figendum` - "that which will be fixed" (gerundive) — async immutable
- `variandum` - "that which will be varied" (gerundive) — async mutable

---

## Binding Keywords

| | Sync | Async |
|---|---|---|
| Immutable | `fixum` | `figendum` |
| Mutable | `varia` | `variandum` |

### Sync Bindings

```
// Immutable — cannot be reassigned
fixum name = "Marcus"
fixum count = 42
fixum users = lege "users.json" ut json

// Mutable — can be reassigned
varia counter = 0
counter = counter + 1

varia status = "pending"
status = "complete"
```

### Async Bindings

Async bindings await the RHS automatically — no explicit `cede` needed:

```
// Immutable async — await then fix
figendum response = pete("https://api.example.com/users")
figendum data = response.json()
figendum config = lege "config.json" ut json

// Mutable async — await then allow mutation
variandum result = fetchInitial()
result = transform(result)
result = cede fetchMore()  // can still use cede for subsequent awaits
```

The gerundive form ("that which will be...") signals futurity — the value isn't available now but will be fixed/set once the async operation completes.

---

## Grammatical Parallel

The async keywords mirror the `fit`/`fiet` return pattern:

| Concept | Present/Past | Future |
|---------|--------------|--------|
| Return | `fit` (becomes) | `fiet` (will become) |
| Immutable | `fixum` (fixed) | `figendum` (will be fixed) |
| Mutable | `varia` (varied) | `variandum` (will be varied) |

Both use the Latin future/gerundive to indicate "not yet, but will be."

---

## Type Annotations

Type annotations follow the binding keyword:

```
// Sync
fixum name: textus = "Marcus"
varia count: numerus = 0

// Async
figendum users: lista<User> = fetchUsers()
variandum data: Response = pete(url)
```

---

## Destructuring

Bindings work with destructuring via `ex`:

```
// Sync destructuring
ex config fixum { host, port }
ex point varia { x, y }

// Async destructuring — await then destructure
ex cede fetchConfig() figendum { host, port }
ex cede response.json() figendum { users, total }
```

Note: Async destructuring still needs `cede` on the source expression, since `figendum` applies to the bindings, not the source.

---

## Shadowing

Inner scopes can shadow outer bindings:

```
fixum x = 1
si verum {
    fixum x = 2      // shadows outer x
    scribe x         // 2
}
scribe x             // 1
```

Shadowing can change mutability:

```
varia x = 1
fixum x = x + 1      // shadow with immutable
// x is now immutable in this scope
```

---

## Target Mappings

### TypeScript

```typescript
// fixum
const name = "Marcus";

// varia
let counter = 0;

// figendum
const response = await fetch(url);

// variandum
let result = await fetchInitial();
```

### Python

```python
# fixum (Python has no const, but convention)
NAME = "Marcus"  # or just: name = "Marcus"

# varia
counter = 0

# figendum
response = await fetch(url)

# variandum
result = await fetch_initial()
```

### Rust

```rust
// fixum
let name = "Marcus";

// varia
let mut counter = 0;

// figendum
let response = fetch(url).await;

// variandum
let mut result = fetch_initial().await;
```

### Zig

```zig
// fixum
const name = "Marcus";

// varia
var counter: i32 = 0;

// figendum / variandum
// Zig async is frame-based, different model
const response = try await async fetch(url);
```

---

## Design Decisions

### Why gerundives for async?

The gerundive is the Latin future passive participle — "that which must/will be done." It perfectly captures the semantics of an async binding: the value *will be* fixed once the operation completes.

Alternatives considered:
- `cede fixum` — requires two keywords, less elegant
- `fiet` — already a verb form, grammatically inconsistent with `fixum`/`varia`
- New unrelated keyword — loses the Latin grammatical connection

### Why implicit await?

`figendum` and `variandum` imply await. The futurity is in the keyword itself, so explicit `cede` is redundant:

```
// These are equivalent:
figendum data = asyncValue
fixum data = cede asyncValue
```

The gerundive form makes the async nature explicit in the binding declaration.

### Why allow both forms?

Some developers prefer explicit `cede`:
```
fixum data = cede asyncValue
```

This remains valid. `figendum`/`variandum` are syntactic sugar for common async patterns.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| `fixum` | Done | Immutable binding |
| `varia` | Done | Mutable binding |
| `figendum` | Not Done | Async immutable |
| `variandum` | Not Done | Async mutable |
| Type annotations | Done | On all binding forms |
| Destructuring | Done | Via `ex` |
| Async destructuring | Not Done | `ex cede ... figendum` |
| TypeScript codegen | Partial | const/let done, await TBD |
| Rust codegen | Partial | let/let mut done, .await TBD |
| Zig codegen | Partial | const/var done, async TBD |
