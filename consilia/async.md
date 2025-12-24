# Async Design

## Verb Conjugation for Return Types

Faber uses Latin verb conjugation of *fieri* (to become) to encode async/iterator semantics in the return type:

| | Sync | Async |
|---|---|---|
| **Single return** | `fit textus` | `fiet textus` |
| **Iterator/yield** | `fiunt textus` | `fient textus` |

Examples:
```
functio greet(name) fit textus { ... }       // sync, returns string
functio fetch(url) fiet textus { ... }       // async, returns Promise<string>
functio range(n) fiunt numerus { ... }       // sync generator, yields numbers
functio stream(url) fient textus { ... }     // async generator, yields strings
```

Grammar encodes both dimensions:
- **Tense**: present (sync) vs future (async)
- **Number**: singular (return once) vs plural (yield many)

### Compatibility with Prefixes

The `->` arrow and `futura`/`cursor` prefixes remain valid. Either mechanism works:

| Syntax | Semantics |
|--------|-----------|
| `functio f() -> T` | sync, single (default) |
| `functio f() fit T` | sync, single (explicit) |
| `functio f() fiet T` | async, single |
| `functio f() fiunt T` | sync, generator |
| `functio f() fient T` | async, generator |
| `futura functio f() -> T` | async, single (prefix determines) |
| `cursor functio f() -> T` | sync, generator (prefix determines) |
| `futura cursor functio f() -> T` | async, generator |

**Validation**: If both prefix and verb are used, they must agree:
- `futura functio f() fit T` - ERROR: `fit` (sync) contradicts `futura` (async)
- `cursor functio f() fit T` - ERROR: `fit` (single) contradicts `cursor` (generator)
- `futura functio f() fiet T` - OK: redundant but valid
- `cursor functio f() fiunt T` - OK: redundant but valid

---

## Overview

Faber's async model maps to native async/await patterns:

| Faber | JavaScript | Zig |
|-------|------------|-----|
| `futura functio` | `async function` | `fn` returning frame |
| `cede` | `await` | `await` / suspend |
| `promissum<T>` | `Promise<T>` | Future-like pattern |

**Unified suspension model:** `cede` is shared with generators (`cursor functio`). The function modifier determines semantics:
- In `futura functio`: `cede expr` awaits a promise
- In `cursor functio`: `cede expr` yields a value

---

## Keywords

### futura

Marks a function as asynchronous. Returns `promissum<T>` implicitly.

```
futura functio fetchData(textus url) -> textus {
    fixum response = cede fetch(url)
    redde response.text()
}
```

Compiles to:
```typescript
async function fetchData(url: string): Promise<string> {
    const response = await fetch(url);
    return response.text();
}
```

### cede (in async context)

Awaits a promise. Only valid inside `futura functio`.

```
fixum data = cede fetchData("https://api.example.com")
```

**Etymology:** "yield, give way, surrender" — ceding control to the event loop until the promise resolves.

**See also:** In `cursor functio`, `cede` yields values to the caller (see iteration.md).

### figendum / variandum (async bindings)

Alternative syntax using gerundive forms ("that which will be...") with implicit await:

```
figendum data = fetchData("https://api.example.com")  // immutable, implicit await
variandum result = fetchInitial()                      // mutable, implicit await
```

These are equivalent to `fixum x = cede y()` and `varia x = cede y()` respectively, but more natural Latin. The gerundive signals futurity — the value will be fixed/varied once the operation completes.

**Sync/async agnostic:** `figendum` works with both sync and async values. If the RHS is a promise, it awaits; if plain, it passes through. This makes code future-proof when APIs evolve from sync to async.

See `vincula.md` for full details.

---

## promissum<T>

**Etymology:** "promise, guarantee" — something pledged for the future.

### Instance Methods

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `tunc((T) -> U) -> promissum<U>` | `then` | Chain success |
| `cape((erratum) -> U) -> promissum<U>` | `catch` | Handle error |
| `demum(() -> vacuum) -> promissum<T>` | `finally` | Always run |

**Naming rationale:**
- `tunc` = "then" (Latin temporal adverb)
- `cape` = "catch, seize" (imperative of capere)
- `demum` = "finally, at last" (Latin adverb)

### Static Constructors

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `promissum.da(T)` | `Promise.resolve` | Immediate success |
| `promissum.nega(erratum)` | `Promise.reject` | Immediate failure |

**Naming rationale:**
- `da` = "give" (imperative of dare) — here's your value
- `nega` = "deny" (imperative of negare) — refused with error

### Static Combinators

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `promissum.omnes(lista<promissum<T>>)` | `Promise.all` | All must succeed |
| `promissum.primus(lista<promissum<T>>)` | `Promise.race` | First to settle |
| `promissum.quilibet(lista<promissum<T>>)` | `Promise.any` | First to succeed |
| `promissum.finita(...)` | `Promise.allSettled` | All settled |

**Naming rationale:**
- `omnes` = "all" (must succeed)
- `primus` = "first" (race — first to settle wins)
- `quilibet` = "any, whichever" (first to succeed)
- `finita` = "finished" (all done, regardless of success/failure)

---

## Error Handling

### With tempta/cape (TS/Python only)

> **Note:** `tempta`/`demum` implies try/catch/finally semantics. Since `demum` (finally) has no direct equivalent in Rust/Zig (they use RAII/defer), use `fac`/`cape` for systems targets instead. See `codegen/rust.md` and `codegen/zig.md`.

```
tempta {
    fixum data = cede fetchData(url)
    scribe data
}
cape err {
    scribe "Error: " + err.message
}
```

### With .cape() method

```
fetchData(url)
    .tunc((data) => scribe data)
    .cape((err) => scribe "Error: " + err.message)
```

### Unhandled Rejections

Open question: How to handle unhandled promise rejections?
- Compiler warning for promises not awaited or `.cape()`'d?
- Runtime hook like Node's `unhandledRejection`?

---

## Patterns

### Sequential Async

```
futura functio processAll(lista<textus> urls) -> lista<textus> {
    varia results = []
    ex urls pro url {
        fixum data = cede fetchData(url)
        results.adde(data)
    }
    redde results
}
```

### Parallel Async

```
futura functio fetchAll(lista<textus> urls) -> lista<textus> {
    fixum promissa = urls.mappa((url) => fetchData(url))
    redde cede promissum.omnes(promissa)
}
```

### Timeout Pattern

```
futura functio cumTimeout(promissum<T> p, numerus ms) -> T {
    redde cede promissum.primus([
        p,
        delay(ms).tunc(() => iace "Timeout")
    ])
}
```

---

## Open Questions

1. **Top-level await**: Allow `cede` at module level?
   - JS: Yes (ES modules)
   - Proposal: Yes, for scripts

2. **Async iterators**: Support `futura ex...pro`?
   ```
   futura ex stream pro chunk {
       // process each chunk as it arrives
   }
   ```

3. **Cancellation**: Add cancellation token pattern?
   - Not native to JS Promises
   - Could wrap with AbortController

4. **Zig target**: How to map to Zig's async model?
   - Zig uses suspend/resume with frames
   - May need different abstraction

---

## Implementation Notes

### TypeScript Target

Direct mapping:
- `futura functio` → `async function`
- `cede` (in async) → `await`
- `promissum<T>` → `Promise<T>`

All instance methods map directly to Promise prototype.

### Zig Target

More complex — Zig's async is different:
- Functions return frames
- Explicit suspend points
- No built-in Promise type

Options:
1. Generate Zig async frames directly
2. Provide runtime promise library
3. Limit async to TypeScript target initially

---

## Future: Non-Blocking Async Bindings (nexum)

**Status:** Conceptual — not yet implemented.

**Etymology:** *nexum* = "bond, tie" (past participle of *necto*, "to bind")

### The Problem

`figendum` and `variandum` block execution until the promise resolves:

```
figendum data = loadData()   // execution pauses here
scribe "loaded"              // runs after loadData() completes
```

For reactive UIs, you often want non-blocking async — start the operation, continue execution, update the binding when the result arrives.

### Proposed Syntax

| Keyword | Mutability | Async | Blocking |
|---------|------------|-------|----------|
| `fixum` | const | no | n/a |
| `figendum` | const | yes | **blocks** |
| `nexum` | const | yes | **non-blocking** |
| `nectendum`? | let | yes | **non-blocking** |

```
// Non-blocking — execution continues immediately
// `results` starts as undefined (or default), updates when promise resolves
nexum results = loadResults()
scribe "loading started"  // runs immediately

// With default value via `vel` (or)
nexum results = loadResults() vel []  // starts as [], becomes loaded value
```

### Codegen Challenge

Non-blocking async that "updates later" requires a reactive runtime. The variable can't be a plain `const` — something must observe the state change.

**Possible outputs:**

```typescript
// Vanilla TS — fire-and-forget, no reactivity
let results = undefined;
loadResults().then(v => { results = v; });

// With signals (SolidJS-style)
const results = createSignal(undefined);
loadResults().then(results.set);

// With stores (Svelte-style)
const results = writable(undefined);
loadResults().then(v => results.set(v));
```

### Open Questions

1. **Reactive runtime:** Does Faber ship a minimal Signal class in the preamble, or target specific frameworks (Svelte, Solid, Vue)?

2. **Initial value:** What is the value before resolution?
   - `undefined` by default?
   - Require `vel defaultValue` syntax?
   - Special `pendens` (pending) state?

3. **Error handling:** What happens if the promise rejects?
   - Silent failure?
   - Require `cape` clause?
   - Set to error state?

4. **Re-triggering:** Can `nectendum` be re-assigned to start a new async operation?
   ```
   nectendum results = loadResults()
   // later...
   results = loadMore()  // re-trigger?
   ```

5. **Interaction with genus:** How does `nexum` relate to computed fields (`=>`)?
   ```
   genus Component {
       nexum data = loadData()           // async field?
       numerus count => data.longitudo() // depends on async?
   }
   ```

### Recommendation

Defer implementation until:
1. A clear reactive model is chosen (signals vs stores vs observables)
2. The primary UI target is determined (web framework integration)
3. The `vel` default value syntax is validated in other contexts

The existing `figendum`/`variandum` cover blocking async well. `nexum` is valuable for reactive UIs but requires framework-level decisions.
