# Range Containment: `intra`

## Summary

Add `intra` (within) as an infix operator for range containment checks.

## Motivation

Current syntax for bounds checking is verbose and repetitive:

```fab
si x >= 0 et x < 100 { }
```

The variable `x` appears twice, and the comparison operators add noise.

## Proposed Syntax

```fab
si x intra 0..100 { }
```

Reads as: "if x within 0 to 100."

## Boundary Semantics

The range operator already encodes inclusivity — `intra` inherits it:

| Syntax | Semantics | Bounds |
|--------|-----------|--------|
| `si x intra 0..100` | exclusive end | 0 ≤ x < 100 |
| `si x intra 0 usque 100` | inclusive end | 0 ≤ x ≤ 100 |
| `si x intra 0 ante 100` | explicit exclusive | 0 ≤ x < 100 |

No new boundary syntax needed.

## Alternatives Considered

### Range-centric form

```fab
si 0..100 habet x { }
si 0..100 continet x { }
```

Valid Latin, but less natural for "is this value in bounds?" questions. Could be offered as a method form on ranges for consistency with collection APIs.

### Latin comparison operators

```fab
si x maior 0 et x minor 100 { }
```

More verbose than symbolic `>` `<`, and doesn't solve the repetition problem.

## Recommendation

Implement `intra` as the primary idiom. The value-centric form ("is x within range?") matches the common mental model better than the range-centric form ("does range contain x?").
