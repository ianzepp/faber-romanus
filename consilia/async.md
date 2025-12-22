# Async Design

## Overview

Faber's async model maps to native async/await patterns:

| Faber | JavaScript | Zig |
|-------|------------|-----|
| `futura functio` | `async function` | `fn` returning frame |
| `exspecta` | `await` | `await` / suspend |
| `promissum<T>` | `Promise<T>` | Future-like pattern |

---

## Keywords

### futura

Marks a function as asynchronous. Returns `promissum<T>` implicitly.

```
futura functio fetchData(textus url) -> textus {
    fixum response = exspecta fetch(url)
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

### exspecta

Awaits a promise. Only valid inside `futura functio`.

```
fixum data = exspecta fetchData("https://api.example.com")
```

**Etymology:** "expect, wait for, await" — the Latin root of "expect."

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
| `promissum.resolvere(T)` | `Promise.resolve` | Immediate success |
| `promissum.reicere(erratum)` | `Promise.reject` | Immediate failure |

### Static Combinators

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `promissum.omnes(lista<promissum<T>>)` | `Promise.all` | All must succeed |
| `promissum.primus(lista<promissum<T>>)` | `Promise.race` | First to settle |
| `promissum.quilibet(lista<promissum<T>>)` | `Promise.any` | First to succeed |
| `promissum.omnesStabiles(...)` | `Promise.allSettled` | All settled |

**Naming rationale:**
- `omnes` = "all"
- `primus` = "first" (race)
- `quilibet` = "any, whichever"
- `stabiles` = "settled, stable"

---

## Error Handling

### With tempta/cape

```
tempta {
    fixum data = exspecta fetchData(url)
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
    esto results = []
    ex urls pro url {
        fixum data = exspecta fetchData(url)
        results.adde(data)
    }
    redde results
}
```

### Parallel Async

```
futura functio fetchAll(lista<textus> urls) -> lista<textus> {
    fixum promissa = urls.mappa((url) => fetchData(url))
    redde exspecta promissum.omnes(promissa)
}
```

### Timeout Pattern

```
futura functio cumTimeout(promissum<T> p, numerus ms) -> T {
    redde exspecta promissum.primus([
        p,
        delay(ms).tunc(() => iace "Timeout")
    ])
}
```

---

## Open Questions

1. **Top-level await**: Allow `exspecta` at module level?
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
- `exspecta` → `await`
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
