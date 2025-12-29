---
status: implemented
targets: [ts, py]
updated: 2024-12
---

# Nexum (Reactive Fields)

**Etymology:** _nexum_ = "bound, tied" (past participle of _necto_, "to bind")

## Overview

`nexum` marks a field as reactive — changes trigger invalidation and re-render. Unlike regular fields, `nexum` fields emit getter/setter pairs with an invalidation hook.

## Syntax

```fab
genus Counter {
    nexum numerus count: 0
    textus label: "Counter"
}
```

## Codegen Transformation

### TypeScript

```typescript
class Counter {
    #count = 0; // Private backing field
    label = 'Counter'; // Regular field

    get count(): number {
        return this.#count;
    }

    set count(v: number) {
        this.#count = v;
        this.__invalidate?.('count'); // Invalidation hook
    }
}
```

### Python

```python
class Counter:
    def __init__(self, overrides={}):
        self._count = 0
        self.label = "Counter"

    @property
    def count(self):
        return self._count

    @count.setter
    def count(self, value):
        self._count = value
        self.__invalidate__('count')
```

## Implementation Status

| Target     | Status | Notes                                   |
| ---------- | ------ | --------------------------------------- |
| TypeScript | Done   | Uses private fields (#) + getter/setter |
| Python     | Done   | Uses @property decorator                |
| Zig        | -      | Reactivity needs runtime decision       |
| Rust       | -      | Reactivity needs runtime decision       |
| C++        | -      | Reactivity needs runtime decision       |

## Use Cases

Reactive fields are designed for UI frameworks where state changes should trigger re-renders:

```fab
genus TodoItem {
    nexum textus title
    nexum bivalens completed: falsum

    functio toggle() {
        ego.completed = non ego.completed
    }
}
```

## Interaction with `pingo` (render)

When a `genus` has a `pingo()` method and reactive fields, the framework calls `__invalidate(field)` on changes, which may trigger re-render by calling `pingo()`.

**Note:** This is framework-integration specific. The exact invalidation -> re-render mechanism depends on the target UI framework (Svelte, Solid, Vue, etc.).

## Differences from `figendum`/`variandum`

| Feature | `figendum`/`variandum` | `nexum` (in genus)        |
| ------- | ---------------------- | ------------------------- |
| Scope   | Top-level bindings     | Class/struct fields       |
| Async   | Blocks until resolves  | Non-blocking reactive     |
| Purpose | Async data loading     | Reactive state management |

`figendum` and `variandum` are for awaiting async results. `nexum` is for reactive state in UI components.

**Note:** Top-level `nexum` bindings (non-blocking async variables) are not implemented. `nexum` is only supported as a field modifier within `genus`.
