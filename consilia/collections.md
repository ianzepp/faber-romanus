# Collections Design

## Overview

Three core collection types wrap native implementations:

| Faber | JavaScript | Zig | Description |
|-------|------------|-----|-------------|
| `lista<T>` | `Array<T>` | `ArrayList(T)` | Ordered, indexed, duplicates allowed |
| `tabula<K,V>` | `Map<K,V>` | `HashMap(K,V)` | Key-value pairs, unique keys |
| `copia<T>` | `Set<T>` | `HashSet(T)` | Unique values, unordered |

All collection type names are feminine (Latin convention for containers).

---

## lista<T>

**Etymology:** "list, border, edge" — a bounded sequence.

### Core Methods

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `adde(T)` | `push` | Add to end |
| `remove() -> T?` | `pop` | Remove from end |
| `primus() -> T?` | `[0]` | First element |
| `ultimus() -> T?` | `at(-1)` | Last element |
| `longitudo() -> numerus` | `length` | Count |
| `vacua() -> bivalens` | `length === 0` | Is empty |
| `purgare()` | `length = 0` | Clear all |

### Search & Test

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `contine(T) -> bivalens` | `includes` | Contains element |
| `indiceDe(T) -> numerus?` | `indexOf` | Find index |

### Transformation

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `mappa((T) -> U) -> lista<U>` | `map` | Transform each |
| `filtra((T) -> bivalens) -> lista<T>` | `filter` | Keep matching |
| `reducere(U, (U,T) -> U) -> U` | `reduce` | Fold to value |
| `coniunge(textus) -> textus` | `join` | Join to string |

### Open Questions

1. **Mutability**: Should `adde`/`remove` mutate in place or return new list?
   - JS convention: mutate in place
   - Functional convention: return new
   - Proposal: mutate in place, provide `cum` variants for immutable ops

2. **Negative indices**: Support `lista[-1]` for last element?
   - JS: No (use `at(-1)`)
   - Python: Yes
   - Proposal: Support via subscript operator

3. **Slicing**: Syntax for sublists?
   - Python: `lista[1:3]`
   - Proposal: `lista.sectio(1, 3)` method

---

## tabula<K, V>

**Etymology:** "board, tablet, table" — a writing surface with entries.

### Core Methods

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `pone(K, V)` | `set` | Set key-value |
| `accipe(K) -> V?` | `get` | Get by key |
| `habet(K) -> bivalens` | `has` | Key exists |
| `dele(K) -> bivalens` | `delete` | Remove key |
| `longitudo() -> numerus` | `size` | Count |
| `vacua() -> bivalens` | `size === 0` | Is empty |
| `purgare()` | `clear` | Clear all |

### Iteration

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `claves() -> cursor<K>` | `keys()` | Iterate keys |
| `valores() -> cursor<V>` | `values()` | Iterate values |
| `paria() -> cursor<(K,V)>` | `entries()` | Iterate pairs |

### Open Questions

1. **Object conversion**: `exObjecto(obj)` static constructor?
   - Useful for JS interop
   - Less relevant for Zig target

2. **Default values**: `accipeAut(K, V) -> V` for get-or-default?

---

## copia<T>

**Etymology:** "abundance, supply" — a collection of resources.

### Core Methods

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `adde(T)` | `add` | Add element |
| `habet(T) -> bivalens` | `has` | Contains |
| `dele(T) -> bivalens` | `delete` | Remove |
| `longitudo() -> numerus` | `size` | Count |
| `vacua() -> bivalens` | `size === 0` | Is empty |
| `purgare()` | `clear` | Clear all |

### Set Operations

| Faber | JS Equivalent | Description |
|-------|---------------|-------------|
| `unio(copia<T>) -> copia<T>` | `union` | A ∪ B |
| `intersectio(copia<T>) -> copia<T>` | `intersection` | A ∩ B |
| `differentia(copia<T>) -> copia<T>` | `difference` | A - B |

### Open Questions

1. **Symmetric difference**: `symmetrica(copia<T>)` for (A - B) ∪ (B - A)?

2. **Subset/superset**: `subcopia(copia<T>) -> bivalens`?

---

## Common Patterns

### Method Naming Convention

| Pattern | Meaning | Examples |
|---------|---------|----------|
| `-are` verbs | Actions | `adde`, `dele`, `purgare` |
| Adjectives | Properties | `vacua`, `primus`, `ultimus` |
| Nouns | Derived values | `longitudo`, `claves`, `valores` |

### The `cum` Pattern

For immutable operations, use `cum` (with) prefix:

```
fixum nova = lista.cumAdde(elementum)  // returns new list
lista.adde(elementum)                   // mutates in place
```

### Iteration Integration

All collections work with `ex...pro`:

```
ex lista pro elementum { ... }
ex tabula.claves() pro clavis { ... }
ex copia pro valor { ... }
```

---

## Implementation Notes

### TypeScript Target

Direct mapping to native types:
- `lista<T>` → `Array<T>`
- `tabula<K,V>` → `Map<K,V>`
- `copia<T>` → `Set<T>`

### Zig Target

Use standard library types:
- `lista<T>` → `std.ArrayList(T)`
- `tabula<K,V>` → `std.HashMap(K,V,...)`
- `copia<T>` → `std.HashSet(T,...)`

Zig requires allocator handling — need design decision on how to expose this.
