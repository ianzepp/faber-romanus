# Norma Innatum: Methods on Primitive Types

Status: **Proposal** (not yet tested)

## Overview

Extend the norma stdlib pattern to support methods on primitive types (textus, numerus, fractus, bivalens). This enables idiomatic operations like:

```fab
"hello".longitudo()      # → 5
(-42).absolutum()        # → 42
3.14.rotunda()           # → 3
```

## Design Principles

1. **Methods for operations, not conversions.** Faber already has postfix conversion syntax (`"42" numeratum`, `42 fractum`). Don't duplicate with methods.

2. **Use existing norma pattern.** Each primitive gets a `fons/norma/<type>.fab` file with `@ innatum` and `@ verte` annotations.

3. **Latin naming.** Method names follow Latin conventions consistent with the rest of the stdlib.

## Primitive: textus

String operations. File: `fons/norma/textus.fab`

| Method | Signature | Description | TS | Py |
|--------|-----------|-------------|----|----|
| `longitudo` | `() -> numerus` | Length | `.length` | `len(§)` |
| `sectio` | `(numerus, numerus) -> textus` | Slice | `.slice` | `§[§:§]` |
| `continet` | `(textus) -> bivalens` | Contains substring | `.includes` | `§ in §` |
| `initium` | `(textus) -> bivalens` | Starts with | `.startsWith` | `.startswith` |
| `finis` | `(textus) -> bivalens` | Ends with | `.endsWith` | `.endswith` |
| `maiuscula` | `() -> textus` | Uppercase | `.toUpperCase()` | `.upper()` |
| `minuscula` | `() -> textus` | Lowercase | `.toLowerCase()` | `.lower()` |
| `recide` | `() -> textus` | Trim whitespace | `.trim()` | `.strip()` |
| `divide` | `(textus) -> lista<textus>` | Split by separator | `.split` | `.split` |
| `muta` | `(textus, textus) -> textus` | Replace all | `.replaceAll` | `.replace` |

### Not included (use postfix conversion instead)

- `numeratum` → use `"42" numeratum`
- `fractum` → use `"3.14" fractum`

## Primitive: numerus

Integer operations. File: `fons/norma/numerus.fab`

| Method | Signature | Description | TS | Py |
|--------|-----------|-------------|----|----|
| `absolutum` | `() -> numerus` | Absolute value | `Math.abs(§)` | `abs(§)` |
| `signum` | `() -> numerus` | Sign (-1, 0, 1) | `Math.sign(§)` | `(§>0)-(§<0)` |
| `minimus` | `(numerus) -> numerus` | Min of two | `Math.min(§,§)` | `min(§,§)` |
| `maximus` | `(numerus) -> numerus` | Max of two | `Math.max(§,§)` | `max(§,§)` |

### Not included

- `fractum` → use `42 fractum`
- `textum` → use `42 textum` (if this exists) or `scriptum("§", 42)`

## Primitive: fractus

Floating-point operations. File: `fons/norma/fractus.fab`

| Method | Signature | Description | TS | Py |
|--------|-----------|-------------|----|----|
| `absolutum` | `() -> fractus` | Absolute value | `Math.abs(§)` | `abs(§)` |
| `signum` | `() -> fractus` | Sign | `Math.sign(§)` | `math.copysign(1,§)` |
| `rotunda` | `() -> numerus` | Round to nearest | `Math.round(§)` | `round(§)` |
| `pavimentum` | `() -> numerus` | Floor | `Math.floor(§)` | `math.floor(§)` |
| `tectum` | `() -> numerus` | Ceiling | `Math.ceil(§)` | `math.ceil(§)` |
| `trunca` | `() -> numerus` | Truncate toward zero | `Math.trunc(§)` | `math.trunc(§)` |
| `minimus` | `(fractus) -> fractus` | Min of two | `Math.min(§,§)` | `min(§,§)` |
| `maximus` | `(fractus) -> fractus` | Max of two | `Math.max(§,§)` | `max(§,§)` |

### Not included

- `numeratum` → use `3.14 numeratum`

## Primitive: bivalens

Boolean operations. Likely no methods needed - boolean operations are handled by operators (`et`, `aut`, `non`).

## Primitive: nihil, vacuum

No methods. These are unit/null types.

## Implementation Notes

### Current State

`textus.fab` exists but hasn't been tested end-to-end. The semantic analyzer may need updates to properly resolve method calls on primitives.

### Required Changes

1. **Verify semantic analysis.** Ensure `"hello".longitudo()` resolves the member expression with `resolvedType = TEXTUS`.

2. **Test codegen.** Confirm the norma registry lookup works for primitive types.

3. **Create remaining files.** `numerus.fab`, `fractus.fab` once textus.fab is proven.

### Open Questions

1. Should `genus <primitive> { }` be required in norma files, or can we use just `@ innatum`?

2. How do these interact with nullable primitives (`textus?`)? Does `maybeStr?.longitudo()` work?

3. Should methods that exist on both numerus and fractus (like `absolutum`) share a definition somehow?
